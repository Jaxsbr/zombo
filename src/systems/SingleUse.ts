import { CombatEntity, applyDamage, isDead } from './Combat';

/**
 * Bomb — area damage within Chebyshev distance 1 (3x3 grid area).
 * Returns the list of enemies that were hit.
 */
export function bombDetonate(
  bombRow: number,
  bombCol: number,
  enemies: CombatEntity[],
  damage: number,
): CombatEntity[] {
  const hit: CombatEntity[] = [];
  for (const enemy of enemies) {
    if (isDead(enemy)) continue;
    const rowDist = Math.abs(enemy.lane - bombRow);
    const colDist = Math.abs(enemy.col - bombCol);
    // Chebyshev distance <= 1 means within 3x3 area
    if (rowDist <= 1 && colDist <= 1) {
      applyDamage(enemy, damage);
      hit.push(enemy);
    }
  }
  return hit;
}

/**
 * Mine — check if any enemy is on the mine's cell.
 * Returns the first enemy on the mine cell, or null.
 */
export function mineTriggerCheck(
  mineRow: number,
  mineCol: number,
  enemies: CombatEntity[],
): CombatEntity | null {
  for (const enemy of enemies) {
    if (isDead(enemy)) continue;
    if (enemy.lane === mineRow && Math.abs(enemy.col - mineCol) < 0.5) {
      return enemy;
    }
  }
  return null;
}

/**
 * Mine arm state — tracks whether the mine has armed.
 */
export interface MineState {
  armed: boolean;
  elapsedMs: number;
  armDelayMs: number;
}

export function createMineState(armDelayMs: number): MineState {
  return { armed: false, elapsedMs: 0, armDelayMs };
}

export function updateMineState(state: MineState, deltaMs: number): void {
  if (state.armed) return;
  state.elapsedMs += deltaMs;
  if (state.elapsedMs >= state.armDelayMs) {
    state.armed = true;
  }
}
