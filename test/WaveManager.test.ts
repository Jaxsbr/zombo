import { describe, it, expect } from 'vitest';
import { WaveManager, LevelConfig } from '../src/systems/WaveManager';
import { ENEMY_TYPES } from '../src/config/enemies';

const sampleLevel: LevelConfig = {
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 1.5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 0.5 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 2 },
      ],
    },
  ],
};

describe('WaveManager', () => {
  it('reports total wave count', () => {
    const wm = new WaveManager(sampleLevel);
    expect(wm.totalWaves).toBe(3);
  });

  it('sample level has at least 3 waves', () => {
    expect(sampleLevel.waves.length).toBeGreaterThanOrEqual(3);
  });

  it('starts at wave 1', () => {
    const wm = new WaveManager(sampleLevel);
    expect(wm.currentWaveNumber).toBe(1);
    expect(wm.isComplete).toBe(false);
  });

  it('spawns enemies at correct delays', () => {
    const wm = new WaveManager(sampleLevel);
    // At t=0, first spawn (delay=0) should fire
    const first = wm.update(0);
    expect(first).toHaveLength(1);
    expect(first[0].lane).toBe(0);

    // At t=1, second spawn (delay=1) should fire
    const second = wm.update(1);
    expect(second).toHaveLength(1);
    expect(second[0].lane).toBe(2);
  });

  it('advances to next wave after all spawns in current wave', () => {
    const wm = new WaveManager(sampleLevel);
    wm.update(0);    // spawn first
    wm.update(1);    // spawn second, wave 1 complete
    expect(wm.currentWaveNumber).toBe(2);
  });

  it('marks complete after all waves spawned', () => {
    const wm = new WaveManager(sampleLevel);
    // Exhaust all waves with large time steps
    wm.update(10);
    wm.update(10);
    wm.update(10);
    wm.update(10);
    wm.update(10);
    expect(wm.isComplete).toBe(true);
  });

  it('returns empty array when complete', () => {
    const wm = new WaveManager(sampleLevel);
    wm.update(100);
    wm.update(100);
    wm.update(100);
    wm.update(100);
    const result = wm.update(100);
    expect(result).toHaveLength(0);
  });

  it('resets to initial state', () => {
    const wm = new WaveManager(sampleLevel);
    wm.update(100);
    wm.update(100);
    wm.reset();
    expect(wm.currentWaveNumber).toBe(1);
    expect(wm.isComplete).toBe(false);
  });
});
