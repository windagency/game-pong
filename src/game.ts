// src/game.ts
import type { GameState, Paddle, Ball, ControlKeys } from './types'; // Added ControlKeys
import { CONFIG, KEYS } from './config'; // Added KEYS
import { clamp, checkBallPaddleCollision } from './utils';

/**
 * Creates and returns the initial state of the game.
 * This function sets up the positions and properties of the ball, paddles,
 * and other game parameters according to the CONFIG.
 * @returns The initial GameState object.
 */
export function createInitialGameState(): GameState {
  const initialKeysPressed: Record<string, boolean> = {};
  // Initialize all known control keys to false. This ensures the keysPressed object
  // starts with a defined structure for all controllable actions.
  for (const keyAction in KEYS) {
    if (Object.prototype.hasOwnProperty.call(KEYS, keyAction)) {
      // Cast keyAction to keyof ControlKeys to satisfy TypeScript's strict checking
      const keyValue = KEYS[keyAction as keyof ControlKeys];
      initialKeysPressed[keyValue.toLowerCase()] = false; // Store keys in lowercase
    }
  }


  return {
    ball: {
      x: CONFIG.canvasWidth / 2,
      y: CONFIG.canvasHeight / 2,
      radius: CONFIG.ballRadius,
      speedX: CONFIG.ballInitialSpeed * (Math.random() > 0.5 ? 1 : -1),
      speedY: CONFIG.ballInitialSpeed * (Math.random() * 1.6 - 0.8), // Wider range of initial Y angles
      initialSpeed: CONFIG.ballInitialSpeed,
    },
    paddleLeft: {
      id: 'left',
      x: CONFIG.paddleMargin,
      y: CONFIG.canvasHeight / 2 - CONFIG.paddleHeight / 2,
      width: CONFIG.paddleWidth,
      height: CONFIG.paddleHeight,
      speed: CONFIG.paddleSpeed,
      dy: 0,
      score: 0,
    },
    paddleRight: {
      id: 'right',
      x: CONFIG.canvasWidth - CONFIG.paddleWidth - CONFIG.paddleMargin,
      y: CONFIG.canvasHeight / 2 - CONFIG.paddleHeight / 2,
      width: CONFIG.paddleWidth,
      height: CONFIG.paddleHeight,
      speed: CONFIG.paddleSpeed,
      dy: 0,
      score: 0,
    },
    canvas: {
      width: CONFIG.canvasWidth,
      height: CONFIG.canvasHeight,
    },
    gamePaused: false,
    gameOver: false,
    winningScore: CONFIG.winningScore,
    winner: null,
    keysPressed: initialKeysPressed, // Now correctly typed and initialized
  };
}

/**
 * Resets the ball to the center of the canvas with a new random direction.
 * This is called when a player scores or when the game starts/restarts.
 * @param ball - The ball object to reset.
 * @param serveDirection - Determines which side the ball serves towards (1 for right, -1 for left).
 */
function resetBall(ball: Ball, serveDirection: 1 | -1): void {
  ball.x = CONFIG.canvasWidth / 2;
  ball.y = CONFIG.canvasHeight / 2;
  ball.speedX = ball.initialSpeed * serveDirection;
  // Give a slight random vertical angle, ensuring it's not too steep or flat
  const randomFactor = Math.random() * 0.8 - 0.4; // -0.4 to 0.4
  ball.speedY = ball.initialSpeed * randomFactor;
  // Ensure ball has some Y speed to avoid straight horizontal movement initially
  if (Math.abs(ball.speedY) < ball.initialSpeed * 0.1) {
    ball.speedY = (ball.initialSpeed * 0.1) * Math.sign(ball.speedY || (Math.random() > 0.5 ? 1 : -1));
  }
}

/**
 * Updates the position of a paddle based on its current direction (dy).
 * Ensures the paddle stays within the canvas boundaries.
 * @param paddle - The paddle object to update.
 * @param canvasHeight - The height of the game canvas.
 */
function updatePaddlePosition(paddle: Paddle, canvasHeight: number): void {
  paddle.y += paddle.dy * paddle.speed;
  paddle.y = clamp(paddle.y, 0, canvasHeight - paddle.height);
}

/**
 * Handles the ball's collision with a paddle.
 * Reverses the ball's X direction, potentially increases its speed,
 * and adjusts its Y speed based on where it hit the paddle.
 * @param ball - The ball object.
 * @param paddle - The paddle object it collided with.
 */
function handleBallPaddleCollision(ball: Ball, paddle: Paddle): void {
  // Reverse X direction
  ball.speedX *= -1;

  // Increase speed slightly, up to a maximum for each axis
  const newSpeedXAbs = Math.abs(ball.speedX) * CONFIG.ballSpeedIncreaseFactor;
  ball.speedX = Math.min(newSpeedXAbs, CONFIG.ballMaxSpeed) * Math.sign(ball.speedX);

  // Adjust ball's Y trajectory based on hit location on paddle
  // The further from the center of the paddle, the steeper the angle
  const deltaY = ball.y - (paddle.y + paddle.height / 2);
  // The 0.25 factor can be tuned for more/less effect on Y speed.
  // A higher factor makes the angle more pronounced.
  let newSpeedY = deltaY * 0.25;
  // Ensure Y speed doesn't exceed max speed and also consider existing Y speed influence
  ball.speedY = clamp(newSpeedY, -CONFIG.ballMaxSpeed, CONFIG.ballMaxSpeed);


  // Ensure ball is pushed out of paddle to prevent sticking
  if (paddle.id === 'left') {
    ball.x = paddle.x + paddle.width + ball.radius + 0.1; // Add small offset
  } else {
    ball.x = paddle.x - ball.radius - 0.1; // Add small offset
  }
}

/**
 * Updates the ball's position and handles collisions with walls and paddles.
 * Also checks for scoring conditions.
 * @param gameState - The current state of the game.
 */
function updateBall(gameState: GameState): void {
  const { ball, paddleLeft, paddleRight, canvas } = gameState;

  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Ball collision with top/bottom walls
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius; // Place it exactly at the boundary
    ball.speedY *= -1;
  } else if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius; // Place it exactly at the boundary
    ball.speedY *= -1;
  }

  // Ball collision with paddles
  // Check only if ball is moving towards the paddle to prevent re-collision after bounce
  if (ball.speedX < 0 && checkBallPaddleCollision(ball, paddleLeft)) { // Moving left, check left paddle
    handleBallPaddleCollision(ball, paddleLeft);
  } else if (ball.speedX > 0 && checkBallPaddleCollision(ball, paddleRight)) { // Moving right, check right paddle
    handleBallPaddleCollision(ball, paddleRight);
  }

  // Scoring
  if (ball.x + ball.radius < 0) { // Ball passed left edge: Player 2 (right paddle) scores
    paddleRight.score++;
    checkWinCondition(gameState);
    if (!gameState.gameOver) resetBall(ball, 1); // Serve to player 1 (ball moves right)
  } else if (ball.x - ball.radius > canvas.width) { // Ball passed right edge: Player 1 (left paddle) scores
    paddleLeft.score++;
    checkWinCondition(gameState);
    if (!gameState.gameOver) resetBall(ball, -1); // Serve to player 2 (ball moves left)
  }
}

/**
 * Checks if a player has reached the winning score.
 * If so, sets the game to over and declares the winner.
 * @param gameState - The current state of the game.
 */
function checkWinCondition(gameState: GameState): void {
  if (gameState.paddleLeft.score >= gameState.winningScore) {
    gameState.gameOver = true;
    gameState.winner = 'Player 1';
  } else if (gameState.paddleRight.score >= gameState.winningScore) {
    gameState.gameOver = true;
    gameState.winner = 'Player 2';
  }
  // If game is over, stop ball movement immediately
  if (gameState.gameOver) {
    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;
  }
}

/**
 * The main game update function, called every frame.
 * Updates paddle positions and ball state if the game is not paused or over.
 * @param gameState - The current state of the game.
 */
export function updateGameState(gameState: GameState): void {
  if (gameState.gamePaused || gameState.gameOver) {
    return; // No updates if paused or game is over
  }

  updatePaddlePosition(gameState.paddleLeft, gameState.canvas.height);
  updatePaddlePosition(gameState.paddleRight, gameState.canvas.height);
  updateBall(gameState);
}
