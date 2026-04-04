import { ENEMY_TYPES } from './enemies';
import { LevelConfig } from '../systems/WaveManager';

// L1: 3 waves, basic enemies only
export const LEVEL_1: LevelConfig = {
  setupDelay: 25,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2.5 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 3.5 },
      ],
    },
  ],
};

// L2: 3 waves, basic + armored
export const LEVEL_2: LevelConfig = {
  setupDelay: 22,
  interWaveDelay: 16,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 2.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 3 },
      ],
    },
  ],
};

// L3: 4 waves, basic + armored (more pressure)
export const LEVEL_3: LevelConfig = {
  setupDelay: 20,
  interWaveDelay: 15,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 3.5 },
      ],
    },
  ],
};

// L4: 4 waves, basic + armored + jumper
export const LEVEL_4: LevelConfig = {
  setupDelay: 18,
  interWaveDelay: 14,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 2.5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.jumper, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 1.5 },
        { type: ENEMY_TYPES.jumper, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 2.5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.jumper, lane: 2, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 1.5 },
        { type: ENEMY_TYPES.jumper, lane: 3, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 0.5 },
        { type: ENEMY_TYPES.jumper, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.jumper, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2.5 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 3 },
      ],
    },
  ],
};

// L5: 5 waves, all enemy types with multi-lane pressure
export const LEVEL_5: LevelConfig = {
  setupDelay: 15,
  interWaveDelay: 12,
  announceDuration: 2.5,
  waves: [
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.jumper, lane: 4, delay: 2 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.jumper, lane: 3, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 0, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 2 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.armored, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 0.5 },
        { type: ENEMY_TYPES.jumper, lane: 4, delay: 1 },
        { type: ENEMY_TYPES.jumper, lane: 1, delay: 1.5 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2.5 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 0.5 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 1 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.jumper, lane: 2, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 2.5 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 3 },
      ],
    },
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 0.5 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.armored, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.jumper, lane: 0, delay: 2.5 },
        { type: ENEMY_TYPES.jumper, lane: 2, delay: 3 },
        { type: ENEMY_TYPES.armored, lane: 1, delay: 3.5 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 4 },
      ],
    },
  ],
};

export const ALL_LEVELS: LevelConfig[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];
