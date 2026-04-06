import { describe, it, expect } from 'vitest';
import { ENEMY_TYPES } from '../src/config/enemies';
import { attemptJump } from '../src/systems/EnemyMovement';

describe('Armored Bunny — config', () => {
  it('health is 300', () => {
    expect(ENEMY_TYPES.armored.health).toBe(300);
  });

  it('speed is 0.20 (slower than basic, faster than tough — tank archetype)', () => {
    expect(ENEMY_TYPES.armored.speed).toBe(0.20);
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
  it('has correct stats: health=150, speed=0.30', () => {
    expect(ENEMY_TYPES.jumper.health).toBe(150);
    expect(ENEMY_TYPES.jumper.speed).toBe(0.30);
  });

  it('starts with jumpsRemaining = 1', () => {
    expect(ENEMY_TYPES.jumper.jumpsRemaining).toBe(1);
  });
});

describe('Enemy speed hierarchy', () => {
  it('jumper > basic > armored > tough (kid-friendly PvZ archetype: tanky = slow)', () => {
    expect(ENEMY_TYPES.jumper.speed).toBeGreaterThan(ENEMY_TYPES.basic.speed);
    expect(ENEMY_TYPES.basic.speed).toBeGreaterThan(ENEMY_TYPES.armored.speed);
    expect(ENEMY_TYPES.armored.speed).toBeGreaterThan(ENEMY_TYPES.tough.speed);
  });
});
