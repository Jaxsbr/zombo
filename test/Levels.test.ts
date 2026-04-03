import { describe, it, expect } from 'vitest';
import { LEVEL_1 } from '../src/config/levels';
import { ENEMY_TYPES } from '../src/config/enemies';

describe('Levels', () => {
  it('LEVEL_1 has exactly 3 waves', () => {
    expect(LEVEL_1.waves.length).toBe(3);
  });

  it('LEVEL_1 wave 1 has <= 2 spawns, all basic type', () => {
    const wave1 = LEVEL_1.waves[0];
    expect(wave1.spawns.length).toBeLessThanOrEqual(2);
    for (const spawn of wave1.spawns) {
      expect(spawn.type).toBe(ENEMY_TYPES.basic);
    }
  });

  it('LEVEL_1 wave 2 has 3-4 spawns with mixed enemy types', () => {
    const wave2 = LEVEL_1.waves[1];
    expect(wave2.spawns.length).toBeGreaterThanOrEqual(3);
    expect(wave2.spawns.length).toBeLessThanOrEqual(4);
    const types = new Set(wave2.spawns.map((s) => s.type));
    expect(types.size).toBeGreaterThanOrEqual(2);
  });

  it('LEVEL_1 wave 3 has 5-6 spawns with >= 2 tough across >= 3 lanes', () => {
    const wave3 = LEVEL_1.waves[2];
    expect(wave3.spawns.length).toBeGreaterThanOrEqual(5);
    expect(wave3.spawns.length).toBeLessThanOrEqual(6);
    const toughCount = wave3.spawns.filter((s) => s.type === ENEMY_TYPES.tough).length;
    expect(toughCount).toBeGreaterThanOrEqual(2);
    const lanes = new Set(wave3.spawns.map((s) => s.lane));
    expect(lanes.size).toBeGreaterThanOrEqual(3);
  });

  it('every wave has at least one spawn', () => {
    for (const wave of LEVEL_1.waves) {
      expect(wave.spawns.length).toBeGreaterThan(0);
    }
  });

  it('every spawn has a valid lane (0-4)', () => {
    for (const wave of LEVEL_1.waves) {
      for (const spawn of wave.spawns) {
        expect(spawn.lane).toBeGreaterThanOrEqual(0);
        expect(spawn.lane).toBeLessThan(5);
      }
    }
  });

  it('every spawn has a non-negative delay', () => {
    for (const wave of LEVEL_1.waves) {
      for (const spawn of wave.spawns) {
        expect(spawn.delay).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('spawns within each wave are ordered by delay', () => {
    for (const wave of LEVEL_1.waves) {
      for (let i = 1; i < wave.spawns.length; i++) {
        expect(wave.spawns[i].delay).toBeGreaterThanOrEqual(wave.spawns[i - 1].delay);
      }
    }
  });
});
