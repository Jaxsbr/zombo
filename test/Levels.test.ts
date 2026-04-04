import { describe, it, expect } from 'vitest';
import { LEVEL_1 } from '../src/config/levels';
import { ENEMY_TYPES } from '../src/config/enemies';

describe('Levels', () => {
  it('LEVEL_1 has exactly 7 waves', () => {
    expect(LEVEL_1.waves.length).toBe(7);
  });

  it('LEVEL_1 wave 1 has 2 enemies (gentle start)', () => {
    expect(LEVEL_1.waves[0].spawns.length).toBe(2);
  });

  it('LEVEL_1 wave 7 has 8+ enemies (final wave boss rush)', () => {
    expect(LEVEL_1.waves[6].spawns.length).toBeGreaterThanOrEqual(8);
  });

  it('enemy count escalates across waves', () => {
    const counts = LEVEL_1.waves.map(w => w.spawns.length);
    // Each wave should have >= the count of the wave before it (generally escalating)
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
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

  it('later waves include tough enemies', () => {
    const wave7 = LEVEL_1.waves[6];
    const toughCount = wave7.spawns.filter(s => s.type === ENEMY_TYPES.tough).length;
    expect(toughCount).toBeGreaterThanOrEqual(3);
  });
});
