import { ENEMY_TYPES } from './enemies';
import { LevelConfig } from '../systems/WaveManager';

export const LEVEL_1: LevelConfig = {
  setupDelay: 25,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    // Wave 1: gentle — 2 slow Dust Bunnies, economy-building time
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
      ],
    },
    // Wave 2: mixed pressure — 4 enemies testing basic defense
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.tough, lane: 0, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
      ],
    },
    // Wave 3: the real test — 6 enemies, multi-lane pressure with Cleaning Robots
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2.5 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 3.5 },
      ],
    },
  ],
};
