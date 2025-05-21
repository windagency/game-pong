// src/types.ts

/**
 * Represents 2D coordinates.
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * Represents dimensions (width and height).
 */
export interface Dimensions {
  readonly width: number; // Canvas dimensions shouldn't change after init
  readonly height: number;
}

/**
 * Represents a generic game entity with position and dimensions.
 * Note: While paddles have width/height, for collision, we might treat ball as a point or square.
 */
export interface GameEntity extends Coordinates {
  readonly width: number;
  readonly height: number;
}

/**
 * Represents a paddle in the game.
 * It has an ID to distinguish between left and right paddles,
 * speed for movement, and dy for its current vertical movement direction.
 */
export interface Paddle extends GameEntity {
  readonly id: 'left' | 'right';
  readonly speed: number;
  dy: -1 | 0 | 1; // -1 for up, 0 for still, 1 for down. Mutable.
  score: number; // Mutable.
}

/**
 * Represents the ball in the game.
 * It has a radius and speeds for its movement along X and Y axes.
 * initialSpeed is stored to reset the ball's speed.
 */
export interface Ball extends Coordinates {
  readonly radius: number;
  speedX: number; // Mutable.
  speedY: number; // Mutable.
  readonly initialSpeed: number;
}

/**
 * Represents the overall state of the game.
 * This includes the ball, both paddles, canvas dimensions,
 * game status flags (paused, game over), winning score, and current winner.
 */
export interface GameState {
  ball: Ball;
  paddleLeft: Paddle;
  paddleRight: Paddle;
  readonly canvas: Dimensions; // Canvas dimensions are fixed after initialization.
  gamePaused: boolean; // Mutable.
  gameOver: boolean;   // Mutable.
  readonly winningScore: number;
  winner: 'Player 1' | 'Player 2' | null; // Mutable.
  readonly keysPressed: Record<string, boolean>; // State of keys, managed by input handler.
}

/**
 * Defines the structure for game configuration settings.
 * All properties are readonly to prevent accidental modification during runtime.
 */
export interface GameConfig {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly paddleWidth: number;
  readonly paddleHeight: number;
  readonly paddleSpeed: number;
  readonly paddleMargin: number; // Distance from canvas edge
  readonly ballRadius: number;
  readonly ballInitialSpeed: number;
  readonly ballSpeedIncreaseFactor: number; // Factor to increase ball speed on paddle hit
  readonly ballMaxSpeed: number; // Maximum speed the ball can reach in one axis
  readonly winningScore: number;
  readonly netWidth: number;
  readonly netColor: string;
  readonly paddleColor: string;
  readonly ballColor: string;
  readonly backgroundColor: string;
  readonly scoreFont: string;
  readonly messageFont: string;
  readonly textColor: string;
  readonly accentColor1: string; // For player 1 / UI elements
  readonly accentColor2: string; // For player 2 / UI elements
}

/**
 * Defines the keys used for game controls.
 * All properties are readonly.
 */
export interface ControlKeys {
  readonly player1Up: string;
  readonly player1Down: string;
  readonly player2Up: string;
  readonly player2Down: string;
  readonly pause: string;
  readonly restart: string;
}

/**
 * Defines the string IDs for DOM elements used by the game.
 * All properties are readonly.
 */
export interface DomElementIds {
  readonly canvas: string;
  readonly pauseMessage: string;
  readonly gameOverMessage: string;
  readonly winnerMessage: string;
  readonly restartButton: string;
}
