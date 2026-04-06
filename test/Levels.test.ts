import { describe, it, expect } from 'vitest';
import { LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, ALL_LEVELS } from '../src/config/levels';
import { ENEMY_TYPES } from '../src/config/enemies';

describe('Level progression — guided intro', () => {
  it('L1: activeLanes=[2], tutorialMode=true, 1 wave, <= 3 basic enemies', () => {
    expect(LEVEL_1.activeLanes).toEqual([2]);
    expect(LEVEL_1.tutorialMode).toBe(true);
    expect(LEVEL_1.waves).toHaveLength(1);
    const totalSpawns = LEVEL_1.waves[0].spawns.length;
    expect(totalSpawns).toBeLessThanOrEqual(3);
    for (const spawn of LEVEL_1.waves[0].spawns) {
      expect(spawn.type).toBe(ENEMY_TYPES.basic);
    }
  });

  it('L1: starting balance === 100 (generator affordable, pistol also affordable)', () => {
    expect(LEVEL_1.startingBalance).toBe(100);
  });

  it('L1: a single Water Pistol survives the wave (total enemy HP <= pistol DPS x reasonable time)', () => {
    const pistolDPS = 15; // 15 damage per second
    const totalEnemyHP = LEVEL_1.waves[0].spawns.reduce((sum, s) => sum + s.type.health, 0);
    // At 15 DPS, total HP / 15 = seconds needed. Enemies traverse 9 cols at 0.5 cells/s = 18s.
    // Total kill time must be less than traverse time for a single pistol to survive
    const killTime = totalEnemyHP / pistolDPS;
    expect(killTime).toBeLessThan(18);
  });

  it('L2: activeLanes=[1,2,3], 2 waves, basic enemies only', () => {
    expect(LEVEL_2.activeLanes).toEqual([1, 2, 3]);
    expect(LEVEL_2.waves).toHaveLength(2);
    for (const wave of LEVEL_2.waves) {
      for (const spawn of wave.spawns) {
        expect(spawn.type).toBe(ENEMY_TYPES.basic);
      }
    }
  });

  it('L3: activeLanes=[0,1,2,3,4], 3 waves, basic enemies only', () => {
    expect(LEVEL_3.activeLanes).toEqual([0, 1, 2, 3, 4]);
    expect(LEVEL_3.waves).toHaveLength(3);
    for (const wave of LEVEL_3.waves) {
      for (const spawn of wave.spawns) {
        expect(spawn.type).toBe(ENEMY_TYPES.basic);
      }
    }
  });

  it('L4: 5 lanes, 3-4 waves, basic enemies only', () => {
    // activeLanes omitted = all 5 rows
    expect(LEVEL_4.activeLanes).toBeUndefined();
    expect(LEVEL_4.waves.length).toBeGreaterThanOrEqual(3);
    expect(LEVEL_4.waves.length).toBeLessThanOrEqual(4);
    for (const wave of LEVEL_4.waves) {
      for (const spawn of wave.spawns) {
        expect(spawn.type).toBe(ENEMY_TYPES.basic);
      }
    }
  });

  it('L5: 5 lanes, 4 waves, startingBalance 50, basic + armored from wave 2 onward', () => {
    expect(LEVEL_5.activeLanes).toBeUndefined();
    expect(LEVEL_5.waves).toHaveLength(4);
    expect(LEVEL_5.enemyBio).toEqual({ enemyKey: 'armored' });
    expect(LEVEL_5.startingBalance).toBe(100);

    // Wave 1: basic only (warmup before armored introduced)
    for (const spawn of LEVEL_5.waves[0].spawns) {
      expect(spawn.type).toBe(ENEMY_TYPES.basic);
    }

    // Waves 2-4: at least one armored enemy
    for (let i = 1; i < LEVEL_5.waves.length; i++) {
      const hasArmored = LEVEL_5.waves[i].spawns.some(s => s.type === ENEMY_TYPES.armored);
      expect(hasArmored).toBe(true);
    }
  });

  it('all levels have valid lane values within their activeLanes', () => {
    for (const level of ALL_LEVELS) {
      const validLanes = level.activeLanes ?? [0, 1, 2, 3, 4];
      for (const wave of level.waves) {
        for (const spawn of wave.spawns) {
          expect(validLanes).toContain(spawn.lane);
        }
      }
    }
  });

  it('every wave has at least one spawn', () => {
    for (const level of ALL_LEVELS) {
      for (const wave of level.waves) {
        expect(wave.spawns.length).toBeGreaterThan(0);
      }
    }
  });

  it('spawns within each wave are ordered by delay', () => {
    for (const level of ALL_LEVELS) {
      for (const wave of level.waves) {
        for (let i = 1; i < wave.spawns.length; i++) {
          expect(wave.spawns[i].delay).toBeGreaterThanOrEqual(wave.spawns[i - 1].delay);
        }
      }
    }
  });

  it('ALL_LEVELS has 9 entries', () => {
    expect(ALL_LEVELS).toHaveLength(9);
  });
});

describe('Level progression — stage-one-completion (L6-L9)', () => {
  it('L6: no activeLanes override, enemyBio for tough, startingBalance === 50, >= 4 waves', () => {
    expect(LEVEL_6.activeLanes).toBeUndefined();
    expect(LEVEL_6.enemyBio).toEqual({ enemyKey: 'tough' });
    expect(LEVEL_6.startingBalance).toBe(100);
    expect(LEVEL_6.waves.length).toBeGreaterThanOrEqual(4);
  });

  it('L6: wave 1 has no tough; waves 2+ each have at least one tough; all waves include armored', () => {
    const hasNoToughWave1 = LEVEL_6.waves[0].spawns.every(s => s.type !== ENEMY_TYPES.tough);
    expect(hasNoToughWave1).toBe(true);
    for (let i = 1; i < LEVEL_6.waves.length; i++) {
      expect(LEVEL_6.waves[i].spawns.some(s => s.type === ENEMY_TYPES.tough)).toBe(true);
    }
    const allSpawns = LEVEL_6.waves.flatMap(w => w.spawns);
    expect(allSpawns.some(s => s.type === ENEMY_TYPES.armored)).toBe(true);
  });

  it('L7: no activeLanes override, no enemyBio, startingBalance === 50, >= 4 waves', () => {
    expect(LEVEL_7.activeLanes).toBeUndefined();
    expect(LEVEL_7.enemyBio).toBeUndefined();
    expect(LEVEL_7.startingBalance).toBe(100);
    expect(LEVEL_7.waves.length).toBeGreaterThanOrEqual(4);
  });

  it('L7: every wave contains at least one tough spawn', () => {
    for (const wave of LEVEL_7.waves) {
      const hasTough = wave.spawns.some(s => s.type === ENEMY_TYPES.tough);
      expect(hasTough).toBe(true);
    }
  });

  it('L8: no activeLanes override, enemyBio for jumper, startingBalance === 50, >= 4 waves', () => {
    expect(LEVEL_8.activeLanes).toBeUndefined();
    expect(LEVEL_8.enemyBio).toEqual({ enemyKey: 'jumper' });
    expect(LEVEL_8.startingBalance).toBe(100);
    expect(LEVEL_8.waves.length).toBeGreaterThanOrEqual(4);
  });

  it('L8: wave 1 contains no jumpers; each of waves 2+ contains at least one jumper', () => {
    const hasJumperWave1 = LEVEL_8.waves[0].spawns.some(s => s.type === ENEMY_TYPES.jumper);
    expect(hasJumperWave1).toBe(false);
    for (let i = 1; i < LEVEL_8.waves.length; i++) {
      const hasJumper = LEVEL_8.waves[i].spawns.some(s => s.type === ENEMY_TYPES.jumper);
      expect(hasJumper).toBe(true);
    }
  });

  it('L9: no activeLanes override, no enemyBio, startingBalance === 50, >= 5 waves', () => {
    expect(LEVEL_9.activeLanes).toBeUndefined();
    expect(LEVEL_9.enemyBio).toBeUndefined();
    expect(LEVEL_9.startingBalance).toBe(100);
    expect(LEVEL_9.waves.length).toBeGreaterThanOrEqual(5);
  });

  it('L9: waves collectively include at least one each of basic, tough, armored, jumper', () => {
    const allSpawns = LEVEL_9.waves.flatMap(w => w.spawns);
    expect(allSpawns.some(s => s.type === ENEMY_TYPES.basic)).toBe(true);
    expect(allSpawns.some(s => s.type === ENEMY_TYPES.tough)).toBe(true);
    expect(allSpawns.some(s => s.type === ENEMY_TYPES.armored)).toBe(true);
    expect(allSpawns.some(s => s.type === ENEMY_TYPES.jumper)).toBe(true);
  });
});
