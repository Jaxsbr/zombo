import { describe, it, expect } from 'vitest';
import { LEVEL_1 } from '../src/config/levels';

describe('Levels', () => {
  it('LEVEL_1 has at least 5 waves', () => {
    expect(LEVEL_1.waves.length).toBeGreaterThanOrEqual(5);
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
