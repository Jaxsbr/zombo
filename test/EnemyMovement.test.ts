import { describe, it, expect } from 'vitest';
import { moveEnemy, MovingEnemy } from '../src/systems/EnemyMovement';

describe('EnemyMovement', () => {
  it('moves enemy leftward by speed * delta', () => {
    const enemy: MovingEnemy = { x: 8, lane: 0, speed: 0.5 };
    moveEnemy(enemy, 1);
    expect(enemy.x).toBe(7.5);
  });

  it('x-position decreases after a movement tick', () => {
    const enemy: MovingEnemy = { x: 5, lane: 2, speed: 1 };
    const initialX = enemy.x;
    moveEnemy(enemy, 0.5);
    expect(enemy.x).toBeLessThan(initialX);
  });

  it('moves proportionally to delta time', () => {
    const enemy: MovingEnemy = { x: 8, lane: 1, speed: 2 };
    moveEnemy(enemy, 0.25);
    expect(enemy.x).toBe(7.5); // 8 - (2 * 0.25)
  });

  it('eventually reaches column 0 with enough ticks', () => {
    const enemy: MovingEnemy = { x: 4, lane: 0, speed: 1 };
    for (let i = 0; i < 4; i++) {
      moveEnemy(enemy, 1);
    }
    expect(enemy.x).toBeLessThanOrEqual(0);
  });
});
