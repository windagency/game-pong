// src/main.ts
import type { GameState } from './types';
// CONFIG and DOM_ELEMENT_IDS are used by imported modules (game, renderer, input)
// but not directly in this file, so direct imports here are not strictly necessary
// if those modules correctly import them.
import { createInitialGameState, updateGameState } from './game';
import { render, initializeRenderer } from './renderer'; // Added initializeRenderer
import { setupInputHandlers, processPaddleInputs } from './input';

/**
 * The main game class.
 * Orchestrates the game initialization, game loop, and state management.
 */
class PongGame {
  /** The central state object for the game. */
  private gameState: GameState;
  /** Timestamp of the last frame, used for calculating delta time. */
  private lastFrameTime: number = 0;
  /** Stores the ID returned by requestAnimationFrame to allow cancellation if needed. */
  private animationFrameId: number | null = null;


  constructor() {
    // Critical step: Initialize the renderer. This sets up the canvas,
    // rendering context, and caches DOM elements for overlays.
    // This can throw an error if essential HTML elements are missing.
    try {
      initializeRenderer();
    } catch (error) {
      console.error("Initialization Error: Failed to initialize renderer.", error);
      // Further error handling could involve displaying a message to the user
      // or preventing the game from attempting to start.
      throw error; // Re-throw to stop game execution if renderer fails
    }

    // Initialize the core game state.
    this.gameState = createInitialGameState();

    // Setup input handlers. This connects keyboard events and UI buttons
    // to game actions, modifying the `this.gameState` directly.
    // The `restartGame` method is bound to `this` to ensure correct context when called as a callback.
    setupInputHandlers(this.gameState, this.restartGame.bind(this));

    // Bind the gameLoop method to `this` context for requestAnimationFrame.
    this.gameLoop = this.gameLoop.bind(this);
  }

  /**
   * Restarts the game by creating a new initial game state.
   * This is typically called when the "Restart" button is pressed after a game over.
   */
  public restartGame(): void {
    console.log("Restarting game...");
    // Create a fresh game state.
    this.gameState = createInitialGameState();
    // The existing input handlers will now operate on this new gameState object
    // because they were set up to modify the gameState object referenced by this.gameState.
    // Ensure any visual elements related to game over are reset by the render function
    // based on the new gameState.

    setupInputHandlers(this.gameState, this.restartGame.bind(this));
  }

  /**
   * The core game loop, called repeatedly by `requestAnimationFrame`.
   * This method orchestrates the processing of inputs, updating game logic,
   * and rendering the current game state.
   * @param currentTime - The current high-resolution timestamp, provided by `requestAnimationFrame`.
   */
  private gameLoop(currentTime: number): void {
    // Calculate delta time (time elapsed since the last frame) in seconds.
    // Useful for frame-rate independent animations and physics, though Pong is often simple enough.
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = deltaTime;

    // Process player inputs to determine paddle movements.
    processPaddleInputs(this.gameState);

    // Update the game state (ball position, collisions, scores).
    updateGameState(this.gameState);

    // Render the current state of the game to the canvas.
    render(this.gameState);

    // Request the next animation frame to continue the loop.
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  /**
   * Starts the game by recording the initial time and requesting the first animation frame.
   */
  public start(): void {
    console.log("Starting Pong Game...");
    this.lastFrameTime = performance.now(); // Set initial time for delta time calculation.
    // Stop any previous game loop before starting a new one, if applicable
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  /**
   * Stops the game loop. (Optional: useful if you need to explicitly stop the game)
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      console.log("Pong Game stopped.");
    }
  }
}

// --- Application Entry Point ---
// Waits for the DOM to be fully loaded before initializing and starting the game.
window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new PongGame();
    game.start();
  } catch (error) {
    console.error("Fatal Error: Could not start the Pong game due to an initialization failure.", error);
    // Attempt to display a user-friendly error message directly on the page.
    const body = document.querySelector('body');
    if (body) {
      const errorContainer = document.createElement('div');
      errorContainer.style.position = 'fixed';
      errorContainer.style.top = '0';
      errorContainer.style.left = '0';
      errorContainer.style.width = '100%';
      errorContainer.style.height = '100%';
      errorContainer.style.backgroundColor = 'rgba(0,0,0,0.9)';
      errorContainer.style.color = 'red';
      errorContainer.style.display = 'flex';
      errorContainer.style.flexDirection = 'column';
      errorContainer.style.justifyContent = 'center';
      errorContainer.style.alignItems = 'center';
      errorContainer.style.fontFamily = '"Courier New", Courier, monospace';
      errorContainer.style.fontSize = '1.2em';
      errorContainer.style.padding = '20px';
      errorContainer.style.boxSizing = 'border-box';
      errorContainer.style.zIndex = '10000';

      const title = document.createElement('h1');
      title.textContent = 'Game Initialization Failed';
      title.style.color = '#ff4da6';
      title.style.marginBottom = '20px';

      const message = document.createElement('p');
      message.textContent = 'An error occurred while trying to start the game. Please check the browser console for more details.';

      const errorDetails = document.createElement('p');
      errorDetails.style.fontSize = '0.8em';
      errorDetails.style.marginTop = '15px';
      errorDetails.style.color = '#ccc';
      errorDetails.textContent = `Details: ${(error as Error).message}`;

      errorContainer.appendChild(title);
      errorContainer.appendChild(message);
      errorContainer.appendChild(errorDetails);

      // Clear body before adding error message to ensure it's prominent
      // body.innerHTML = ''; 
      body.appendChild(errorContainer);
    }
  }
});
