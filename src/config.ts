// src/config.ts
import type { GameConfig, ControlKeys, DomElementIds } from './types';

/**
 * Game configuration object.
 * All game parameters are defined here for easy tweaking.
 * Marked as Readonly to prevent runtime modifications.
 */
export const CONFIG: Readonly<GameConfig> = {
  canvasWidth: 800,
  canvasHeight: 600,
  paddleWidth: 15,
  paddleHeight: 100,
  paddleSpeed: 8,
  paddleMargin: 20,
  ballRadius: 8,
  ballInitialSpeed: 5,
  ballSpeedIncreaseFactor: 1.05, // Increase speed by 5% on each paddle hit
  ballMaxSpeed: 15, // Cap the ball speed for each axis
  winningScore: 5,
  netWidth: 4,
  netColor: 'rgba(255, 255, 255, 0.3)', // Slightly more subtle net
  paddleColor: '#00ffdd', // Default paddle color, can be overridden by accent colors
  ballColor: '#ff4da6',
  backgroundColor: '#000000',
  scoreFont: '48px "Courier New", Courier, monospace',
  messageFont: '24px "Courier New", Courier, monospace',
  textColor: '#ffffff',
  accentColor1: '#00ffdd', // Player 1 / UI primary
  accentColor2: '#ff4da6', // Player 2 / UI secondary
};

/**
 * Control key mappings.
 * Defines which keyboard keys control game actions.
 * Marked as Readonly.
 */
export const KEYS: Readonly<ControlKeys> = {
  player1Up: 'w',
  player1Down: 's',
  player2Up: 'ArrowUp',
  player2Down: 'ArrowDown',
  pause: 'p',
  restart: 'r',
};

/**
 * DOM Element IDs used in the HTML.
 * Centralizes the IDs for easier management if they need to change.
 * Marked as Readonly.
 */
export const DOM_ELEMENT_IDS: Readonly<DomElementIds> = {
  canvas: 'gameCanvas',
  pauseMessage: 'pauseMessage',
  gameOverMessage: 'gameOverMessage',
  winnerMessage: 'winnerMessage',
  restartButton: 'restartButton',
};
