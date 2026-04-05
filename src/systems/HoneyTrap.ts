/**
 * HoneyTrap — honey pot state management for the Honey Bear (trapper) defender.
 * Pure TypeScript, no Phaser dependency.
 */

export interface HoneyPot {
  row: number;
  col: number;
  remainingMs: number;
  durationMs: number;
}

export const HONEY_POT_DURATION = 8000; // ms before pot expires
export const HONEY_POT_SLOW = 0.5; // speed multiplier for enemies on a honey pot cell
export const HONEY_TOSS_INTERVAL = 4000; // ms between tosses
export const HONEY_TOSS_RANGE = 5; // max cells ahead a trapper can toss

export function createHoneyPot(row: number, col: number, durationMs: number = HONEY_POT_DURATION): HoneyPot {
  return { row, col, remainingMs: durationMs, durationMs };
}

/**
 * Update all honey pots — decrement timers, return only active (non-expired) pots.
 */
export function updateHoneyPots(pots: HoneyPot[], deltaMs: number): HoneyPot[] {
  for (const pot of pots) {
    pot.remainingMs -= deltaMs;
  }
  return pots.filter(p => p.remainingMs > 0);
}

/**
 * Get the speed multiplier for an enemy at the given cell.
 * Returns HONEY_POT_SLOW if any active pot exists on that cell, otherwise 1.0.
 */
export function getSpeedModifier(pots: HoneyPot[], row: number, col: number): number {
  for (const pot of pots) {
    if (pot.row === row && pot.col === col && pot.remainingMs > 0) {
      return HONEY_POT_SLOW;
    }
  }
  return 1.0;
}
