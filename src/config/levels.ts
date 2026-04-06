import { ENEMY_TYPES } from './enemies';
import { LevelConfig } from '../systems/WaveManager';

// L1: Tutorial — 1 lane, 1 wave, 2 basic enemies (single pistol survives)
// Starting balance 50: generator (50) affordable, pistol requires collecting sparks first
export const LEVEL_1: LevelConfig = {
  activeLanes: [2],
  tutorialMode: true,
  startingBalance: 100,
  setupDelay: 18,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 5 },
      ],
    },
  ],
};

// L2: 3 lanes, 2 waves, basic enemies across 3 lanes
export const LEVEL_2: LevelConfig = {
  activeLanes: [1, 2, 3],
  startingBalance: 100,
  setupDelay: 25,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 4.5 },
      ],
    },
  ],
};

// L3: Full 5 lanes, 3 waves, basic enemies — economy tighter than L2
export const LEVEL_3: LevelConfig = {
  activeLanes: [0, 1, 2, 3, 4],
  startingBalance: 100,
  setupDelay: 22,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 4 },
      ],
    },
  ],
};

// L4: 5 lanes, 3 waves, basic enemies — Block Tower now available
// Spawn intervals: 3.0→2.5→2.0s (linear ramp, no tight clustering)
export const LEVEL_4: LevelConfig = {
  startingBalance: 100,
  setupDelay: 22,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 4 enemies, 3.0s intervals
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 6 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 9 },
      ],
    },
    {
      // 5 enemies, 2.5s intervals
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2.5 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 5 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 7.5 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 10 },
      ],
    },
    {
      // 6 enemies, 2.0s intervals
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 6 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 8 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 10 },
      ],
    },
  ],
};

// L5: 5 lanes, 4 waves, basic + armored — wave 1 warmup (all basic), scaling to heavy armored
// Wave scaling: 5→7→9→11 enemies, linear intervals 3.0→2.5→2.0→1.5s
export const LEVEL_5: LevelConfig = {
  startingBalance: 100,
  enemyBio: { enemyKey: 'armored' },
  setupDelay: 20,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 3.0s intervals — warmup, basic only before armored is introduced
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 9 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 12 },
      ],
    },
    {
      // 7 enemies, 2.5s intervals — even basic/armored split
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 2.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 5 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 7.5 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 10 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 12.5 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 15 },
      ],
    },
    {
      // 9 enemies, 2.0s intervals — heavier armored
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 4 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 6 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 8 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 10 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 12 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 14 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 16 },
      ],
    },
    {
      // 11 enemies, 1.5s intervals — armored heavy
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 3 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 4.5 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 9 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 10.5 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 12 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 13.5 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 15 },
      ],
    },
  ],
};

// L6: Full 5 lanes, 4 waves — Cleaning Robot intro; spawns basic + armored + tough
// Wave 1 warmup has no tough; waves 2+ introduce tough alongside prior types
// Wave scaling: 5→7→9→11 enemies, linear intervals 3.0→2.5→2.0→1.5s
export const LEVEL_6: LevelConfig = {
  startingBalance: 100,
  enemyBio: { enemyKey: 'tough' },
  setupDelay: 20,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 3.0s intervals — warmup, basic + armored only (no tough yet)
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 3 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 9 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 12 },
      ],
    },
    {
      // 7 enemies, 2.5s intervals — tough introduced alongside basic + armored
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 2.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 5 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 7.5 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 10 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 12.5 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 15 },
      ],
    },
    {
      // 9 enemies, 2.0s intervals — all 3 types, more tough
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 8 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 10 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 12 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 14 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 16 },
      ],
    },
    {
      // 11 enemies, 1.5s intervals — tough heavy
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 4.5 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 6 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 9 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 10.5 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 12 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 13.5 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 15 },
      ],
    },
  ],
};

// L7: Honey Bear practice — all 5 lanes, 4 waves, basic + armored + tough in every wave
// Wave scaling: 5→7→9→11 enemies, linear intervals 3.0→2.5→2.0→1.5s
export const LEVEL_7: LevelConfig = {
  startingBalance: 100,
  setupDelay: 18,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 3.0s intervals — all 3 types present from the start
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 3 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 9 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 12 },
      ],
    },
    {
      // 7 enemies, 2.5s intervals
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 2.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 5 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 7.5 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 10 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 12.5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 15 },
      ],
    },
    {
      // 9 enemies, 2.0s intervals — heavier tough + armored
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 8 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 10 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 12 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 14 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 16 },
      ],
    },
    {
      // 11 enemies, 1.5s intervals — tough pressure
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 4.5 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 6 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 9 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 10.5 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 12 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 13.5 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 15 },
      ],
    },
  ],
};

// L8: Sock Puppet intro — 4 waves, no jumpers in wave 1, jumpers from wave 2 onward
// All prior types (basic + armored + tough) present throughout; jumper joins wave 2+
// Wave scaling: 5→7→9→11 enemies, linear intervals 3.0→2.5→2.0→1.5s
export const LEVEL_8: LevelConfig = {
  startingBalance: 100,
  enemyBio: { enemyKey: 'jumper' },
  setupDelay: 18,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 3.0s intervals — warmup with basic + armored + tough, no jumper
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 9 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 12 },
      ],
    },
    {
      // 7 enemies, 2.5s intervals — jumper introduced alongside all prior types
      spawns: [
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 2.5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 7.5 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 10 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 12.5 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 15 },
      ],
    },
    {
      // 9 enemies, 2.0s intervals — all 4 types, more jumpers
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 2 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 4 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 6 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 8 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 10 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 12 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 14 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 16 },
      ],
    },
    {
      // 11 enemies, 1.5s intervals — jumper heavy
      spawns: [
        { type: ENEMY_TYPES.jumper,  lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 3 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 4.5 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 9 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 10.5 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 12 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 13.5 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 15 },
      ],
    },
  ],
};

// L9: Marble Mine practice — 5 waves, all 4 enemy types, first loadout selection moment
// Wave scaling: 5→7→9→11→13 enemies, linear intervals 3.0→2.5→2.0→1.5→1.2s
export const LEVEL_9: LevelConfig = {
  startingBalance: 100,
  setupDelay: 16,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 3.0s intervals — all 4 types from the start
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 3 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 6 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 9 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 12 },
      ],
    },
    {
      // 7 enemies, 2.5s intervals
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 2.5 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 5 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 7.5 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 10 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 12.5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 15 },
      ],
    },
    {
      // 9 enemies, 2.0s intervals — heavier tough + armored
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 8 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 10 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 12 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 14 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 16 },
      ],
    },
    {
      // 11 enemies, 1.5s intervals — heavy jumper + tough pressure
      spawns: [
        { type: ENEMY_TYPES.jumper,  lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 3 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 4.5 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 9 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 10.5 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 12 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 13.5 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 15 },
      ],
    },
    {
      // 13 enemies, 1.2s intervals — intense finale
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 1.2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 2.4 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 3.6 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 4.8 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 6 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 7.2 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 8.4 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 9.6 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 10.8 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 12 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 13.2 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 14.4 },
      ],
    },
  ],
};

export const ALL_LEVELS: LevelConfig[] = [
  LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5,
  LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9,
];
