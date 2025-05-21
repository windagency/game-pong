// src/utils.ts
import type { Ball, Paddle, GameEntity } from './types';

/**
 * Clamps a number between a minimum and maximum value.
 * @param value - The number to clamp.
 * @param min - The minimum allowed value.
 * @param max - The maximum allowed value.
 * @returns The clamped number.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Checks for Axis-Aligned Bounding Box (AABB) collision between two game entities.
 * This is a common and simple collision detection method for rectangular objects.
 * @param rect1 - The first game entity, e.g., a paddle or the ball's bounding box.
 * @param rect2 - The second game entity.
 * @returns True if the entities are colliding, false otherwise.
 */
export function checkAABBCollision(rect1: GameEntity, rect2: GameEntity): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Checks for collision between the ball (treated as a square bounding box) and a paddle.
 * For more precise collision, circle-rectangle physics would be needed,
 * but AABB is often sufficient for arcade-style games like Pong.
 * @param ball - The ball object.
 * @param paddle - The paddle object.
 * @returns True if the ball's bounding box and paddle are colliding, false otherwise.
 */
export function checkBallPaddleCollision(ball: Ball, paddle: Paddle): boolean {
  // Create a bounding box for the ball for AABB collision
  const ballRect: GameEntity = {
    x: ball.x - ball.radius,
    y: ball.y - ball.radius,
    width: ball.radius * 2,
    height: ball.radius * 2,
  };
  return checkAABBCollision(ballRect, paddle);
}
