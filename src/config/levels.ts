import { ENEMY_TYPES } from './enemies';
import { LevelConfig } from '../systems/WaveManager';

// L1: Tutorial — 1 lane, 1 wave, 2 basic enemies (single pistol survives)
// Starting balance 75: generator (50) affordable, pistol (100) not
export const LEVEL_1: LevelConfig = {
  activeLanes: [2],
  tutorialMode: true,
  startingBalance: 75,
  setupDelay: 30,
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
  startingBalance: 200,
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
  startingBalance: 300,
  setupDelay: 22,
  interWaveDelay: 16,
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
  startingBalance: 400,
  setupDelay: 22,
  interWaveDelay: 15,
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

// L5: 5 lanes, 4 waves, basic + armored from wave 2 onward
export const LEVEL_5: LevelConfig = {
  startingBalance: 450,
  enemyBio: { enemyKey: 'armored' },
  setupDelay: 20,
  interWaveDelay: 14,
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
        { type: ENEMY_TYPES.armored, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 2.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 4 },
      ],
    },
  ],
};

// L6: Full 5 lanes, 4 waves — Cleaning Robot intro, warmup wave 1 only basic
export const LEVEL_6: LevelConfig = {
  startingBalance: 450,
  enemyBio: { enemyKey: 'tough' },
  setupDelay: 20,
  interWaveDelay: 14,
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
        { type: ENEMY_TYPES.tough, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 0, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2.5 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 4 },
      ],
    },
  ],
};

// L7: Honey Bear practice — all 5 lanes, 4 waves, tough in every wave
export const LEVEL_7: LevelConfig = {
  startingBalance: 500,
  setupDelay: 18,
  interWaveDelay: 13,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.tough, lane: 1, delay: 5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 3 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 4 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2.5 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 3 },
        { type: ENEMY_TYPES.tough, lane: 1, delay: 5 },
      ],
    },
  ],
};

// L8: Sock Puppet intro — 4 waves, no jumpers in wave 1, jumpers from wave 2 onward
export const LEVEL_8: LevelConfig = {
  startingBalance: 550,
  enemyBio: { enemyKey: 'jumper' },
  setupDelay: 18,
  interWaveDelay: 13,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.jumper, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 1 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 2 },
        { type: ENEMY_TYPES.jumper, lane: 4, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 1 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.jumper, lane: 3, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.jumper, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2.5 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 3 },
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 4.5 },
      ],
    },
  ],
};

// L9: Marble Mine practice — 5 waves, all 4 enemy types, first loadout selection moment
export const LEVEL_9: LevelConfig = {
  startingBalance: 600,
  setupDelay: 16,
  interWaveDelay: 12,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.jumper, lane: 1, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 3, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 1 },
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 3 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 4 },
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 0, delay: 1 },
        { type: ENEMY_TYPES.jumper, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 2.5 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 3 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper, lane: 2, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 2.5 },
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 3.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 4.5 },
      ],
    },
  ],
};

export const ALL_LEVELS: LevelConfig[] = [
  LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5,
  LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9,
];
