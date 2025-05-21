// src/input.ts
import type { GameState } from './types';
import { KEYS, DOM_ELEMENT_IDS } from './config';

/**
 * Sets up event listeners for keyboard input and the restart button.
 * Modifies the gameState based on pressed keys for paddle movement and game control.
 * @param gameState - The current game state, to be modified by input. This object's `keysPressed` property will be updated.
 * @param onRestart - Callback function to trigger a game restart.
 */
export function setupInputHandlers(gameState: GameState, onRestart: () => void): void {
  const restartButton = document.getElementById(DOM_ELEMENT_IDS.restartButton) as HTMLButtonElement | null;
  if (!restartButton) {
    console.warn(`Input Handler Warning: Restart button with ID "${DOM_ELEMENT_IDS.restartButton}" not found. Restart button functionality will be unavailable.`);
  }

  // Listen for keydown events
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key.toLowerCase(); // Normalize key to lowercase
    // Directly modify the keysPressed property of the passed-in gameState object.
    // This ensures that the central gameState is always up-to-date.
    (gameState.keysPressed as Record<string, boolean>)[key] = true;

    // Handle pause toggle directly on key press
    if (key === KEYS.pause.toLowerCase() && !gameState.gameOver) {
      gameState.gamePaused = !gameState.gamePaused;
      event.preventDefault(); // Prevent default browser action for 'P' (e.g., printing)
    }

    // Handle restart on key press if game is over
    if (key === KEYS.restart.toLowerCase() && gameState.gameOver) {
      onRestart();
      event.preventDefault(); // Prevent default browser action for 'R' (e.g., reloading page)
    }
  });

  // Listen for keyup events
  window.addEventListener('keyup', (event: KeyboardEvent) => {
    const key = event.key.toLowerCase(); // Normalize key to lowercase
    (gameState.keysPressed as Record<string, boolean>)[key] = false;
  });

  // Handle restart button click
  restartButton?.addEventListener('click', () => {
    if (gameState.gameOver) { // Only allow restart if the game is actually over
      onRestart();
    }
  });
}

/**
 * Processes the currently pressed keys from `gameState.keysPressed` to update paddle movement directions (`dy`).
 * This function should be called in the game loop before updating paddle positions.
 * @param gameState - The current game state, which includes `keysPressed` and paddle objects.
 */
export function processPaddleInputs(gameState: GameState): void {
  // If game is paused or over, paddles should not respond to new input for movement.
  // Their dy should be set to 0 to stop movement.
  if (gameState.gamePaused || gameState.gameOver) {
    gameState.paddleLeft.dy = 0;
    gameState.paddleRight.dy = 0;
    return;
  }

  // Left Paddle (Player 1)
  if (gameState.keysPressed[KEYS.player1Up.toLowerCase()]) {
    gameState.paddleLeft.dy = -1;
  } else if (gameState.keysPressed[KEYS.player1Down.toLowerCase()]) {
    gameState.paddleLeft.dy = 1;
  } else {
    gameState.paddleLeft.dy = 0;
  }

  // Right Paddle (Player 2)
  if (gameState.keysPressed[KEYS.player2Up.toLowerCase()]) {
    gameState.paddleRight.dy = -1;
  } else if (gameState.keysPressed[KEYS.player2Down.toLowerCase()]) {
    gameState.paddleRight.dy = 1;
  } else {
    gameState.paddleRight.dy = 0;
  }
}
