import { ENEMY_TYPES } from './enemies';
import { LevelConfig } from '../systems/WaveManager';

export const LEVEL_1: LevelConfig = {
  setupDelay: 25,
  interWaveDelay: 18,
  announceDuration: 2.5,
  waves: [
    // Round 1 (waves 1-3): introduction and basic pressure
    // Wave 1: gentle — 2 slow Dust Bunnies, economy-building time
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
      ],
    },
    // Wave 2: mixed — 3 enemies, first Cleaning Robot
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 1, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1.5 },
        { type: ENEMY_TYPES.tough, lane: 0, delay: 3 },
      ],
    },
    // Wave 3: round 1 climax — 4 enemies, multi-lane
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 1, delay: 3 },
      ],
    },
    // Round 2 (waves 4-6): escalation
    // Wave 4: 5 enemies, wider spread
    {
      spawns: [
        { type: ENEMY_TYPES.basic, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 1.5 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2.5 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 3 },
      ],
    },
    // Wave 5: 6 enemies, heavy robot presence
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 0.5 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 2 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 2.5 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 3.5 },
      ],
    },
    // Wave 6: round 2 climax — 7 enemies, all lanes
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 0.5 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 1.5 },
        { type: ENEMY_TYPES.tough, lane: 3, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 0, delay: 3 },
        { type: ENEMY_TYPES.basic, lane: 4, delay: 3.5 },
      ],
    },
    // Final (wave 7): boss rush — 8 enemies, dense and fast
    {
      spawns: [
        { type: ENEMY_TYPES.tough, lane: 0, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 2, delay: 0 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 0.5 },
        { type: ENEMY_TYPES.basic, lane: 1, delay: 1 },
        { type: ENEMY_TYPES.basic, lane: 3, delay: 1 },
        { type: ENEMY_TYPES.tough, lane: 0, delay: 2 },
        { type: ENEMY_TYPES.basic, lane: 2, delay: 2.5 },
        { type: ENEMY_TYPES.tough, lane: 4, delay: 3 },
      ],
    },
  ],
};
