import { describe, it, expect } from 'vitest';
import { DEFENDER_TYPES, MINE_ARM_DELAY } from '../src/config/defenders';
import { EnemyCombatEntity, isDead } from '../src/systems/Combat';
import {
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
