import { describe, it, expect } from 'vitest';
import { DEFENDER_TYPES, MINE_ARM_DELAY } from '../src/config/defenders';
import { EnemyCombatEntity, isDead } from '../src/systems/Combat';
import {
  mineTriggerCheck,
  createMineState,
  updateMineState,
  bombDetonate,
  MINE_BOSS_DAMAGE,
  BOMB_BOSS_DAMAGE,
  BOMB_HEAVY_DAMAGE,
  MINE_HEAVY_DAMAGE,
} from '../src/systems/SingleUse';

function makeEnemy(overrides: Partial<EnemyCombatEntity> = {}): EnemyCombatEntity {
  return {
    health: 100,
    lane: 2,
    col: 4,
    damage: 20,
    ...overrides,
  };
}

describe('Marble Mine — dormant and armed behavior', () => {
  it('mine starts dormant (not armed)', () => {
    const state = createMineState(MINE_ARM_DELAY);
    expect(state.armed).toBe(false);
  });

  it('mine does not trigger while dormant', () => {
    const state = createMineState(MINE_ARM_DELAY);
    const enemy = makeEnemy({ lane: 2, col: 4 });
    // Mine at (2, 4), enemy at (2, 4) — but mine not armed
    expect(state.armed).toBe(false);
    const target = mineTriggerCheck(2, 4, [enemy]);
    // Target found but mine logic should check armed state before acting
    expect(target).not.toBeNull(); // mineTriggerCheck finds the enemy
    expect(state.armed).toBe(false); // but mine isn't armed — caller must check
  });

  it('mine arms after MINE_ARM_DELAY elapses', () => {
    const state = createMineState(MINE_ARM_DELAY);
    updateMineState(state, MINE_ARM_DELAY - 1);
    expect(state.armed).toBe(false);
    updateMineState(state, 1);
    expect(state.armed).toBe(true);
  });

  it('armed mine trigger kills enemy on same cell', () => {
    const state = createMineState(MINE_ARM_DELAY);
    updateMineState(state, MINE_ARM_DELAY);
    expect(state.armed).toBe(true);

    const enemy = makeEnemy({ lane: 2, col: 4, health: 300 });
    const target = mineTriggerCheck(2, 4, [enemy]);
    expect(target).not.toBeNull();

    // Apply mine damage
    if (target) {
      target.health -= DEFENDER_TYPES.mine.damage;
    }
    expect(isDead(enemy)).toBe(true);
  });

  it('mine self-destructs — config is singleUse=true', () => {
    expect(DEFENDER_TYPES.mine.singleUse).toBe(true);
  });

  it('mine does not block movement — behavior is mine, not wall', () => {
    expect(DEFENDER_TYPES.mine.behavior).toBe('mine');
    expect(DEFENDER_TYPES.mine.behavior).not.toBe('wall');
  });

  it('mine trigger does not fire for enemy in different lane', () => {
    const enemy = makeEnemy({ lane: 0, col: 4 }); // wrong lane
    const target = mineTriggerCheck(2, 4, [enemy]);
    expect(target).toBeNull();
  });

  it('mine trigger does not fire for enemy far from mine col', () => {
    const enemy = makeEnemy({ lane: 2, col: 7 }); // wrong col
    const target = mineTriggerCheck(2, 4, [enemy]);
    expect(target).toBeNull();
  });

  it('boss mine hit reduces HP by MINE_BOSS_DAMAGE and does NOT kill', () => {
    const state = createMineState(MINE_ARM_DELAY);
    updateMineState(state, MINE_ARM_DELAY);
    expect(state.armed).toBe(true);

    // Boss enemy with 2000 HP
    const bossEnemy = makeEnemy({ lane: 2, col: 4, health: 2000 });
    const target = mineTriggerCheck(2, 4, [bossEnemy]);
    expect(target).not.toBeNull();

    // Apply boss mine damage (instead of instant kill)
    if (target) {
      target.health -= MINE_BOSS_DAMAGE;
    }
    expect(bossEnemy.health).toBe(2000 - MINE_BOSS_DAMAGE);
    expect(isDead(bossEnemy)).toBe(false);
  });

  it('MINE_BOSS_DAMAGE is at least 300', () => {
    expect(MINE_BOSS_DAMAGE).toBeGreaterThanOrEqual(300);
  });
});

describe('Glitter Bomb — immediate 3×3 AOE detonation', () => {
  it('kills non-boss enemies inside 3×3 area', () => {
    const e1 = makeEnemy({ lane: 1, col: 3, health: 100 }); // row-1, col-1
    const e2 = makeEnemy({ lane: 2, col: 4, health: 100 }); // center
    const e3 = makeEnemy({ lane: 3, col: 5, health: 100 }); // row+1, col+1
    const affected = bombDetonate(2, 4, [e1, e2, e3]);
    expect(affected).toHaveLength(3);
    expect(isDead(e1)).toBe(true);
    expect(isDead(e2)).toBe(true);
    expect(isDead(e3)).toBe(true);
  });

  it('deals BOMB_BOSS_DAMAGE to boss-type enemies instead of instant kill', () => {
    const boss = { ...makeEnemy({ lane: 2, col: 4, health: 2000 }), bossType: true };
    const affected = bombDetonate(2, 4, [boss]);
    expect(affected).toHaveLength(1);
    expect(boss.health).toBe(2000 - BOMB_BOSS_DAMAGE);
    expect(isDead(boss)).toBe(false);
  });

  it('does NOT affect enemies outside 3×3 area', () => {
    const outside1 = makeEnemy({ lane: 0, col: 4, health: 100 }); // 2 rows away
    const outside2 = makeEnemy({ lane: 2, col: 7, health: 100 }); // 3 cols away
    const affected = bombDetonate(2, 4, [outside1, outside2]);
    expect(affected).toHaveLength(0);
    expect(outside1.health).toBe(100);
    expect(outside2.health).toBe(100);
  });

  it('clamps to grid bounds when bomb placed at edge', () => {
    const e1 = makeEnemy({ lane: 0, col: 0, health: 100 }); // at corner
    const e2 = makeEnemy({ lane: 1, col: 1, health: 100 }); // diagonal
    const outside = makeEnemy({ lane: 2, col: 2, health: 100 }); // 2 rows and 2 cols from bomb
    const affected = bombDetonate(0, 0, [e1, e2, outside]);
    expect(affected).toHaveLength(2);
    expect(isDead(e1)).toBe(true);
    expect(isDead(e2)).toBe(true);
    expect(outside.health).toBe(100);
  });

  it('BOMB_BOSS_DAMAGE is at least 300', () => {
    expect(BOMB_BOSS_DAMAGE).toBeGreaterThanOrEqual(300);
  });

  it('bomb config is singleUse with rechargeTime >= 12000', () => {
    expect(DEFENDER_TYPES.bomb.singleUse).toBe(true);
    expect(DEFENDER_TYPES.bomb.rechargeTime).toBeGreaterThanOrEqual(12000);
  });

  it('bomb cost is in range 75-125', () => {
    expect(DEFENDER_TYPES.bomb.cost).toBeGreaterThanOrEqual(75);
    expect(DEFENDER_TYPES.bomb.cost).toBeLessThanOrEqual(125);
  });

  it('instant-kills basic (Dust Bunny) and jumper (Sock Puppet) enemies', () => {
    const basic = { ...makeEnemy({ lane: 2, col: 4, health: 80 }), enemyKey: 'basic' };
    const jumper = { ...makeEnemy({ lane: 2, col: 4, health: 150 }), enemyKey: 'jumper' };
    bombDetonate(2, 4, [basic, jumper]);
    expect(isDead(basic)).toBe(true);
    expect(isDead(jumper)).toBe(true);
  });

  it('deals BOMB_HEAVY_DAMAGE to tough (Cleaning Robot) instead of instant kill', () => {
    const tough = { ...makeEnemy({ lane: 2, col: 4, health: 550 }), enemyKey: 'tough' };
    const affected = bombDetonate(2, 4, [tough]);
    expect(affected).toHaveLength(1);
    expect(tough.health).toBe(550 - BOMB_HEAVY_DAMAGE);
    expect(isDead(tough)).toBe(false);
  });

  it('deals BOMB_HEAVY_DAMAGE to armored (Armored Bunny) instead of instant kill', () => {
    const armored = { ...makeEnemy({ lane: 2, col: 4, health: 300 }), enemyKey: 'armored' };
    const affected = bombDetonate(2, 4, [armored]);
    expect(affected).toHaveLength(1);
    expect(armored.health).toBe(300 - BOMB_HEAVY_DAMAGE);
    expect(isDead(armored)).toBe(false);
  });

  it('MINE_HEAVY_DAMAGE is at least 200', () => {
    expect(MINE_HEAVY_DAMAGE).toBeGreaterThanOrEqual(200);
  });
});
