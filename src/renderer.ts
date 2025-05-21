// src/renderer.ts
import type { GameState, Paddle, Ball } from './types';
import { CONFIG, DOM_ELEMENT_IDS } from './config';

// --- DOM Element and Canvas Context Caching ---
// It's more efficient to get these once rather than on every render call.
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let pauseMessageEl: HTMLDivElement | null = null;
let gameOverMessageEl: HTMLDivElement | null = null;
let winnerMessageEl: HTMLDivElement | null = null;

/**
 * Initializes cached DOM elements and the canvas rendering context.
 * Should be called once when the game starts.
 * @throws Error if the canvas element or context cannot be found/created.
 */
export function initializeRenderer(): void {
  canvas = document.getElementById(DOM_ELEMENT_IDS.canvas) as HTMLCanvasElement;
  if (!canvas) {
    throw new Error(`Canvas element with ID "${DOM_ELEMENT_IDS.canvas}" not found.`);
  }
  ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D rendering context not available.');
  }

  pauseMessageEl = document.getElementById(DOM_ELEMENT_IDS.pauseMessage) as HTMLDivElement;
  gameOverMessageEl = document.getElementById(DOM_ELEMENT_IDS.gameOverMessage) as HTMLDivElement;
  winnerMessageEl = document.getElementById(DOM_ELEMENT_IDS.winnerMessage) as HTMLDivElement;

  if (!pauseMessageEl || !gameOverMessageEl || !winnerMessageEl) {
    // This is not a fatal error, but good to log if overlays won't work.
    console.warn('Renderer Warning: One or more message overlay DOM elements are missing. Overlay messages might not display.');
  }
  // Set canvas dimensions based on config
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;
}


/**
 * Draws the background and the center net.
 * @param activeCtx - The active 2D rendering context.
 */
function drawBackgroundAndNet(activeCtx: CanvasRenderingContext2D): void {
  // Background
  activeCtx.fillStyle = CONFIG.backgroundColor;
  activeCtx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

  // Net
  activeCtx.fillStyle = CONFIG.netColor;
  const netX = CONFIG.canvasWidth / 2 - CONFIG.netWidth / 2;
  for (let y = 0; y < CONFIG.canvasHeight; y += 15) { // Dashed line effect
    activeCtx.fillRect(netX, y, CONFIG.netWidth, 10);
  }
}

/**
 * Draws a paddle on the canvas.
 * @param activeCtx - The active 2D rendering context.
 * @param paddle - The paddle object to draw.
 */
function drawPaddle(activeCtx: CanvasRenderingContext2D, paddle: Paddle): void {
  activeCtx.fillStyle = paddle.id === 'left' ? CONFIG.accentColor1 : CONFIG.accentColor2;
  activeCtx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

/**
 * Draws the ball on the canvas.
 * @param activeCtx - The active 2D rendering context.
 * @param ball - The ball object to draw.
 */
function drawBall(activeCtx: CanvasRenderingContext2D, ball: Ball): void {
  activeCtx.fillStyle = CONFIG.ballColor;
  activeCtx.beginPath();
  activeCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  activeCtx.fill();
}

/**
 * Draws the scores of both players.
 * @param activeCtx - The active 2D rendering context.
 * @param scoreLeft - Score of the left player.
 * @param scoreRight - Score of the right player.
 */
function drawScores(activeCtx: CanvasRenderingContext2D, scoreLeft: number, scoreRight: number): void {
  activeCtx.font = CONFIG.scoreFont;
  activeCtx.textAlign = 'center';

  activeCtx.fillStyle = CONFIG.accentColor1;
  activeCtx.fillText(scoreLeft.toString(), CONFIG.canvasWidth / 4, 60);

  activeCtx.fillStyle = CONFIG.accentColor2;
  activeCtx.fillText(scoreRight.toString(), (CONFIG.canvasWidth * 3) / 4, 60);
}

/**
 * Manages the display of overlay messages (Pause, Game Over).
 * @param gameState - The current state of the game.
 */
function manageOverlayMessages(gameState: GameState): void {
  if (pauseMessageEl) {
    pauseMessageEl.style.display = (gameState.gamePaused && !gameState.gameOver) ? 'block' : 'none';
  }

  if (gameOverMessageEl && winnerMessageEl) {
    if (gameState.gameOver) {
      gameOverMessageEl.style.display = 'flex'; // Use flex for centering content if needed by CSS
      gameOverMessageEl.style.flexDirection = 'column'; // Use flex for centering content if needed by CSS
      winnerMessageEl.textContent = gameState.winner ? `${gameState.winner} wins!` : 'Game Over!';
      // Set winner message color based on who won, or default if no winner (e.g. tie, though not possible in current rules)
      winnerMessageEl.style.color = gameState.winner === 'Player 1' ? CONFIG.accentColor1 : (gameState.winner === 'Player 2' ? CONFIG.accentColor2 : CONFIG.textColor);
    } else {
      gameOverMessageEl.style.display = 'none';
    }
  }
}

/**
 * Main render function to draw the entire game state.
 * This function is called every frame to update the visual display.
 * It assumes `initializeRenderer` has been called successfully.
 * @param gameState - The current state of the game.
 */
export function render(gameState: GameState): void {
  if (!ctx || !canvas) {
    // This check is crucial. If renderer isn't initialized, we can't draw.
    // An error should have been thrown by initializeRenderer if canvas/ctx are null.
    // If somehow it's called before init or after a failure, log and exit.
    console.error('Render Error: Renderer not properly initialized. Canvas context is unavailable.');
    return;
  }

  // Clear previous frame and draw background/net
  drawBackgroundAndNet(ctx);

  // Draw game elements: paddles, ball, and scores.
  // These are drawn regardless of pause state to show the current game board.
  // If game is over, they are typically still drawn to show the final state.
  drawPaddle(ctx, gameState.paddleLeft);
  drawPaddle(ctx, gameState.paddleRight);
  drawBall(ctx, gameState.ball);
  drawScores(ctx, gameState.paddleLeft.score, gameState.paddleRight.score);


  // Handle Pause and Game Over messages overlay
  // These are drawn on top of the game elements.
  manageOverlayMessages(gameState);
}
