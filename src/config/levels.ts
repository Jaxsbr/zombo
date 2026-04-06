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
export const LEVEL_4: LevelConfig = {
  startingBalance: 100,
  setupDelay: 22,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 3.5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0.5 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2.5 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 3 },
      ],
    },
  ],
};

// L5: 5 lanes, 4 waves, basic + armored — wave 1 warmup (1 armored), scaling to heavy armored
// Wave scaling: 5→7→9→11 enemies, spawn intervals tighten each wave
export const LEVEL_5: LevelConfig = {
  startingBalance: 100,
  enemyBio: { enemyKey: 'armored' },
  setupDelay: 20,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 2.0s intervals — warmup, basic only before armored is introduced
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 4 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 8 },
      ],
    },
    {
      // 7 enemies, 1.5s intervals — even basic/armored split
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 4.5 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 7.5 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 9 },
      ],
    },
    {
      // 9 enemies, 1.0s intervals — heavier armored
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 3 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 4 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 7 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 8 },
      ],
    },
    {
      // 11 enemies, 0.7s intervals — armored heavy, tight clustering
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 0.7 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 1.4 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 2.1 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 2.8 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 3.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 4.2 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 4.9 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 5.6 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 6.3 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 7.0 },
      ],
    },
  ],
};

// L6: Full 5 lanes, 4 waves — Cleaning Robot intro; spawns basic + armored + tough
// Wave 1 warmup has no tough; waves 2+ introduce tough alongside prior types
// Wave scaling: 5→7→9→11 enemies, tightening spawn intervals
export const LEVEL_6: LevelConfig = {
  startingBalance: 100,
  enemyBio: { enemyKey: 'tough' },
  setupDelay: 20,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 2.0s intervals — warmup, basic + armored only (no tough yet)
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 8 },
      ],
    },
    {
      // 7 enemies, 1.5s intervals — tough introduced alongside basic + armored
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 4.5 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 9 },
      ],
    },
    {
      // 9 enemies, 1.0s intervals — all 3 types, more tough
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 1 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 2 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 4 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 7 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 8 },
      ],
    },
    {
      // 11 enemies, 0.7s intervals — tough heavy, tight clustering
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 0.7 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 1.4 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 2.1 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 2.8 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 3.5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 4.2 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 4.9 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 5.6 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 6.3 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 7.0 },
      ],
    },
  ],
};

// L7: Honey Bear practice — all 5 lanes, 4 waves, basic + armored + tough in every wave
// Wave scaling: 5→7→9→11 enemies, tightening intervals
export const LEVEL_7: LevelConfig = {
  startingBalance: 100,
  setupDelay: 18,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 2.0s intervals — all 3 types present from the start
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 4 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 8 },
      ],
    },
    {
      // 7 enemies, 1.5s intervals
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 3 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 4.5 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 6 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 9 },
      ],
    },
    {
      // 9 enemies, 1.0s intervals — heavier tough + armored
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 1 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 2 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 4 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 7 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 8 },
      ],
    },
    {
      // 11 enemies, 0.7s intervals — maximum tough pressure
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 0.7 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 1.4 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 2.1 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 2.8 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 3.5 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 4.2 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 4.9 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 5.6 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 6.3 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 7.0 },
      ],
    },
  ],
};

// L8: Sock Puppet intro — 4 waves, no jumpers in wave 1, jumpers from wave 2 onward
// All prior types (basic + armored + tough) present throughout; jumper joins wave 2+
// Wave scaling: 5→7→9→11 enemies, tightening intervals
export const LEVEL_8: LevelConfig = {
  startingBalance: 100,
  enemyBio: { enemyKey: 'jumper' },
  setupDelay: 18,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 2.0s intervals — warmup with basic + armored + tough, no jumper
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 4 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 6 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 8 },
      ],
    },
    {
      // 7 enemies, 1.5s intervals — jumper introduced alongside all prior types
      spawns: [
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 1.5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 3 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4.5 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 4, delay: 7.5 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 9 },
      ],
    },
    {
      // 9 enemies, 1.0s intervals — all 4 types, more jumpers
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 1 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 3 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 4 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 5 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 6 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 7 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 8 },
      ],
    },
    {
      // 11 enemies, 0.7s intervals — jumper heavy, tight clustering
      spawns: [
        { type: ENEMY_TYPES.jumper,  lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 0.7 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 1.4 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 2.1 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 2.8 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 3.5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 4.2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4.9 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 5.6 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 6.3 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 7.0 },
      ],
    },
  ],
};

// L9: Marble Mine practice — 5 waves, all 4 enemy types, first loadout selection moment
// Wave scaling: 5→7→9→11→13 enemies, tightening intervals for maximum intensity
export const LEVEL_9: LevelConfig = {
  startingBalance: 100,
  setupDelay: 16,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      // 5 enemies, 2.0s intervals — all 4 types from the start
      spawns: [
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 6 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 8 },
      ],
    },
    {
      // 7 enemies, 1.5s intervals
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 1, delay: 4.5 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 6 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 7.5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 9 },
      ],
    },
    {
      // 9 enemies, 1.0s intervals — heavier tough + armored
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 1 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 2 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 3 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 4 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 6 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 7 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 8 },
      ],
    },
    {
      // 11 enemies, 0.7s intervals — heavy jumper + tough pressure
      spawns: [
        { type: ENEMY_TYPES.jumper,  lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough,   lane: 4, delay: 0.7 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 1.4 },
        { type: ENEMY_TYPES.jumper,  lane: 1, delay: 2.1 },
        { type: ENEMY_TYPES.tough,   lane: 3, delay: 2.8 },
        { type: ENEMY_TYPES.basic,   lane: 0, delay: 3.5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 4.2 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4.9 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 5.6 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 6.3 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 7.0 },
      ],
    },
    {
      // 13 enemies, 0.5s intervals — maximum intensity finale
      spawns: [
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.tough,   lane: 1, delay: 1.5 },
        { type: ENEMY_TYPES.basic,   lane: 3, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 2.5 },
        { type: ENEMY_TYPES.jumper,  lane: 4, delay: 3 },
        { type: ENEMY_TYPES.tough,   lane: 2, delay: 3.5 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 4 },
        { type: ENEMY_TYPES.jumper,  lane: 3, delay: 4.5 },
        { type: ENEMY_TYPES.tough,   lane: 0, delay: 5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 5.5 },
        { type: ENEMY_TYPES.basic,   lane: 2, delay: 6 },
      ],
    },
  ],
};

export const ALL_LEVELS: LevelConfig[] = [
  LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5,
  LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9,
];
