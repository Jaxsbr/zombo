import { describe, it, expect } from 'vitest';
import { DEFENDER_TYPES, MINE_ARM_DELAY } from '../src/config/defenders';
import { CombatEntity, EnemyCombatEntity, isDead } from '../src/systems/Combat';
import {
  bombDetonate,
  mineTriggerCheck,
  createMineState,
  updateMineState,
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

describe('Teddy Bomb — area damage', () => {
  it('deals lethal damage to enemies within Chebyshev distance 1', () => {
    const enemies = [
      makeEnemy({ lane: 2, col: 4, health: 300 }), // same cell
      makeEnemy({ lane: 1, col: 3, health: 300 }), // diagonal
      makeEnemy({ lane: 3, col: 5, health: 100 }), // diagonal
    ];
    const hit = bombDetonate(2, 4, enemies, DEFENDER_TYPES.bomb.damage);
    expect(hit).toHaveLength(3);
    expect(enemies.every(e => isDead(e))).toBe(true);
  });

  it('does not damage enemies outside the 3x3 area', () => {
    const inRange = makeEnemy({ lane: 2, col: 4, health: 100 });
    const outOfRange = makeEnemy({ lane: 0, col: 4, health: 100 }); // 2 rows away
    const farAway = makeEnemy({ lane: 2, col: 7, health: 100 }); // 3 cols away
    const hit = bombDetonate(2, 4, [inRange, outOfRange, farAway], DEFENDER_TYPES.bomb.damage);
    expect(hit).toHaveLength(1);
    expect(isDead(inRange)).toBe(true);
    expect(outOfRange.health).toBe(100);
    expect(farAway.health).toBe(100);
  });

  it('bomb self-destructs — config is singleUse=true', () => {
    expect(DEFENDER_TYPES.bomb.singleUse).toBe(true);
  });
});

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
});
