export interface MovingEnemy {
  x: number;    // current column position (float)
  lane: number;
  speed: number; // cells per second
}

export function moveEnemy(enemy: MovingEnemy, deltaSeconds: number): void {
  enemy.x -= enemy.speed * deltaSeconds;
}

/**
 * Attempt a jump over a blocking defender.
 * Returns the new column position past the defender if jump succeeds, or null if no jump available.
 */
export function attemptJump(
  enemyCol: number,
  defenderCol: number,
  jumpsRemaining: number,
): { jumped: boolean; newCol: number; newJumps: number } {
  if (jumpsRemaining <= 0) {
    return { jumped: false, newCol: enemyCol, newJumps: jumpsRemaining };
  }
  // Jump past the defender — land one cell to the left
  const newCol = defenderCol - 0.6;
  return { jumped: true, newCol, newJumps: jumpsRemaining - 1 };
}
