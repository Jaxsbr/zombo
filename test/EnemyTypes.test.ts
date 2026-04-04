import { describe, it, expect } from 'vitest';
import { ENEMY_TYPES } from '../src/config/enemies';
import { attemptJump } from '../src/systems/EnemyMovement';

describe('Armored Bunny — config', () => {
  it('health equals exactly 3x basic health', () => {
    expect(ENEMY_TYPES.armored.health).toBe(ENEMY_TYPES.basic.health * 3);
  });

  it('speed equals basic speed', () => {
    expect(ENEMY_TYPES.armored.speed).toBe(ENEMY_TYPES.basic.speed);
  });
});

describe('Sock Puppet — jump logic', () => {
  it('jumps over defender cell when jumpsRemaining > 0', () => {
    const result = attemptJump(5, 4, 1);
    expect(result.jumped).toBe(true);
    expect(result.newCol).toBeLessThan(4); // past the defender
    expect(result.newJumps).toBe(0);
  });

  it('does not jump when jumpsRemaining = 0', () => {
    const result = attemptJump(5, 4, 0);
    expect(result.jumped).toBe(false);
    expect(result.newCol).toBe(5);
    expect(result.newJumps).toBe(0);
  });

  it('walks entire lane normally if no defender encountered (no jump used)', () => {
    // jumpsRemaining stays at 1 if attemptJump is never called
    expect(ENEMY_TYPES.jumper.jumpsRemaining).toBe(1);
  });

  it('interacts normally with defenders after jump is spent', () => {
    const result = attemptJump(3, 2, 0);
    expect(result.jumped).toBe(false);
    // When jumped=false, enemy is blocked normally (wallBlocks applies)
    expect(result.newCol).toBe(3);
  });
});

describe('Sock Puppet — config', () => {
  it('has correct stats: health=150, speed=0.35', () => {
    expect(ENEMY_TYPES.jumper.health).toBe(150);
    expect(ENEMY_TYPES.jumper.speed).toBe(0.35);
  });

  it('starts with jumpsRemaining = 1', () => {
    expect(ENEMY_TYPES.jumper.jumpsRemaining).toBe(1);
  });
});
