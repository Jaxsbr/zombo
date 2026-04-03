import { describe, it, expect } from 'vitest';
import { WaveManager, LevelConfig } from '../src/systems/WaveManager';
import { ENEMY_TYPES } from '../src/config/enemies';

// Instant-spawn config: no delays, for existing behavior tests
const sampleLevel: LevelConfig = {
  setupDelay: 0,
  interWaveDelay: 0,
  announceDuration: 0,
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

describe('WaveManager — wave state machine', () => {
  // Delayed level with staggered spawns so spawning state persists across ticks
  const delayedLevel: LevelConfig = {
    setupDelay: 20,
    interWaveDelay: 15,
    announceDuration: 2.5,
    waves: [
      {
        spawns: [
          { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
          { type: ENEMY_TYPES.basic, lane: 1, delay: 3 },
        ],
      },
      {
        spawns: [
          { type: ENEMY_TYPES.tough, lane: 2, delay: 0 },
          { type: ENEMY_TYPES.tough, lane: 3, delay: 2 },
        ],
      },
    ],
  };

  it('starts in setup state with setupDelay > 0', () => {
    const wm = new WaveManager(delayedLevel);
    expect(wm.waveState).toBe('setup');
  });

  it('holds spawns during setup period', () => {
    const wm = new WaveManager(delayedLevel);
    const result = wm.update(10);
    expect(result).toHaveLength(0);
    expect(wm.waveState).toBe('setup');
  });

  it('transitions setup → announcing after setupDelay', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20);
    expect(wm.waveState).toBe('announcing');
  });

  it('holds spawns during announcing state', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20); // through setup
    const result = wm.update(1);
    expect(result).toHaveLength(0);
    expect(wm.waveState).toBe('announcing');
  });

  it('transitions announcing → spawning after announceDuration', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20);  // setup done
    wm.update(2.5); // announce done → spawning (first spawn at delay=0 fires)
    expect(wm.waveState).toBe('spawning');
  });

  it('spawns enemies during spawning state', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20);  // setup done
    const result = wm.update(2.5); // announce done → spawning
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(ENEMY_TYPES.basic);
    expect(wm.waveState).toBe('spawning');
  });

  it('transitions spawning → waiting after wave spawns complete (not last wave)', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20);  // setup done
    wm.update(2.5); // announce done, spawns first enemy
    wm.update(3);   // spawn second enemy, wave done
    expect(wm.waveState).toBe('waiting');
  });

  it('holds spawns during inter-wave delay', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20);   // setup
    wm.update(2.5);  // announce → spawning (first enemy)
    wm.update(3);    // second enemy, wave done → waiting
    const result = wm.update(5);
    expect(result).toHaveLength(0);
    expect(wm.waveState).toBe('waiting');
  });

  it('transitions waiting → announcing after interWaveDelay', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20);   // setup
    wm.update(2.5);  // announce → spawning
    wm.update(3);    // wave done → waiting
    wm.update(15);   // inter-wave delay → announcing
    expect(wm.waveState).toBe('announcing');
  });

  it('transitions through all states correctly', () => {
    const wm = new WaveManager(delayedLevel);
    // setup
    expect(wm.waveState).toBe('setup');
    // setup → announcing
    wm.update(20);
    expect(wm.waveState).toBe('announcing');
    // announcing → spawning (wave 1)
    wm.update(2.5);
    expect(wm.waveState).toBe('spawning');
    // spawning wave 1 → waiting
    wm.update(3);
    expect(wm.waveState).toBe('waiting');
    // waiting → announcing (wave 2)
    wm.update(15);
    expect(wm.waveState).toBe('announcing');
    // announcing → spawning (wave 2)
    wm.update(2.5);
    expect(wm.waveState).toBe('spawning');
    // spawning wave 2 (last) → complete
    wm.update(2);
    expect(wm.waveState).toBe('complete');
  });

  it('uses default delays when not specified', () => {
    const defaultLevel: LevelConfig = {
      waves: [{ spawns: [{ type: ENEMY_TYPES.basic, lane: 0, delay: 0 }] }],
    };
    const wm = new WaveManager(defaultLevel);
    expect(wm.waveState).toBe('setup');
    // Default setupDelay is 25, should still be in setup at t=20
    wm.update(20);
    expect(wm.waveState).toBe('setup');
    // At t=25 should transition to announcing
    wm.update(5);
    expect(wm.waveState).toBe('announcing');
  });

  it('resets wave state to setup when setupDelay > 0', () => {
    const wm = new WaveManager(delayedLevel);
    wm.update(20);
    wm.update(2.5);
    wm.update(3);
    wm.reset();
    expect(wm.waveState).toBe('setup');
    expect(wm.currentWaveNumber).toBe(1);
  });

  it('starts in announcing state when setupDelay is 0', () => {
    const noSetup: LevelConfig = {
      setupDelay: 0,
      interWaveDelay: 10,
      announceDuration: 2,
      waves: [{ spawns: [{ type: ENEMY_TYPES.basic, lane: 0, delay: 0 }] }],
    };
    const wm = new WaveManager(noSetup);
    expect(wm.waveState).toBe('announcing');
  });
});
