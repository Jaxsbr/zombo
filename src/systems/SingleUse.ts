import { CombatEntity, isDead } from './Combat';

export const MINE_BOSS_DAMAGE = 400; // chunk damage to boss enemies instead of instant kill
export const BOMB_BOSS_DAMAGE = 400; // chunk damage to boss enemies from Glitter Bomb
export const BOMB_HEAVY_DAMAGE = 250; // chunk damage to tough/armored enemies from bomb (not instant kill)
export const MINE_HEAVY_DAMAGE = 250; // chunk damage to tough/armored enemies from mine (not instant kill)

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

// Tough enemy keys — these survive bomb/mine with heavy damage instead of instant kill
const TOUGH_ENEMY_KEYS = new Set(['tough', 'armored']);

/**
 * Bomb detonation — affects all enemies in a 3×3 grid area centered on (bombRow, bombCol).
 * Dust Bunnies and Sock Puppets are instant-killed. Tough/armored enemies take BOMB_HEAVY_DAMAGE.
 * Boss enemies take BOMB_BOSS_DAMAGE. Grid bounds clamped to [0, maxRow] and [0, maxCol].
 * Returns the list of enemies that were affected.
 */
export function bombDetonate(
  bombRow: number,
  bombCol: number,
  enemies: (CombatEntity & { bossType?: boolean; enemyKey?: string })[],
  maxRow: number = 4,
  maxCol: number = 8,
): CombatEntity[] {
  const minRow = Math.max(0, bombRow - 1);
  const maxR = Math.min(maxRow, bombRow + 1);
  const minCol = Math.max(0, bombCol - 1);
  const maxC = Math.min(maxCol, bombCol + 1);

  const affected: CombatEntity[] = [];
  for (const enemy of enemies) {
    if (isDead(enemy)) continue;
    // Col uses ±0.5 tolerance because enemies have fractional col during movement;
    // lane is always an integer so exact bounds suffice for rows.
    if (enemy.lane >= minRow && enemy.lane <= maxR &&
        enemy.col >= minCol - 0.5 && enemy.col <= maxC + 0.5) {
      if (enemy.bossType) {
        enemy.health -= BOMB_BOSS_DAMAGE;
      } else if (TOUGH_ENEMY_KEYS.has(enemy.enemyKey ?? '')) {
        enemy.health -= BOMB_HEAVY_DAMAGE;
      } else {
        enemy.health = 0; // instant kill (basic, jumper)
      }
      affected.push(enemy);
    }
  }
  return affected;
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
