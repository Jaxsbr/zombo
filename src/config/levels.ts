import { ENEMY_TYPES } from './enemies';
import { LevelConfig } from '../systems/WaveManager';

export const LEVEL_1: LevelConfig = {
  waves: [
    // Wave 1: gentle introduction — 3 basic enemies
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 4 },
      ],
    },
    // Wave 2: more pressure — 4 basic enemies
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4.5 },
      ],
    },
    // Wave 3: introduce tough enemies — 2 basic + 1 tough
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 3 },
      ],
    },
    // Wave 4: mixed assault — 3 basic + 2 tough
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
      ],
    },
    // Wave 5: final push — heavy tough presence
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 2.5 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 4 },
      ],
    },
  ],
};
