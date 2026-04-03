import { describe, it, expect } from 'vitest';
import { ENEMY_TYPES } from '../src/config/enemies';

describe('Enemy types', () => {
  it('defines at least 2 enemy types', () => {
    const types = Object.keys(ENEMY_TYPES);
    expect(types.length).toBeGreaterThanOrEqual(2);
  });

  it('all types have name, health, and speed', () => {
    for (const [key, enemy] of Object.entries(ENEMY_TYPES)) {
      expect(enemy.name, `${key} missing name`).toBeTruthy();
      expect(enemy.health, `${key} has invalid health`).toBeGreaterThan(0);
      expect(enemy.speed, `${key} has invalid speed`).toBeGreaterThan(0);
    }
  });

  it('basic and tough have distinct health/speed values', () => {
    const basic = ENEMY_TYPES.basic;
    const tough = ENEMY_TYPES.tough;
    expect(basic.health).not.toBe(tough.health);
    expect(basic.speed).not.toBe(tough.speed);
    expect(tough.health).toBeGreaterThan(basic.health);
    expect(basic.speed).toBeGreaterThan(tough.speed);
  });
});
