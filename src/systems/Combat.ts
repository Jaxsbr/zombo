export interface CombatEntity {
  health: number;
  lane: number;
  col: number; // grid column position
  hitboxLanes?: number; // rows the entity occupies (1 = own lane only, 3 = ±1 adjacent); default 1
}

export interface ShooterEntity extends CombatEntity {
  damage: number;
  range: number;
  fireRate: number;       // shots per second
  fireCooldown: number;   // seconds until next shot
}

export interface EnemyCombatEntity extends CombatEntity {
  damage: number; // damage per second to defenders
}

export interface ProjectileState {
  lane: number;
  x: number;
  damage: number;
  speed: number;
}

const PROJECTILE_SPEED = 4; // cells per second (Water Pistol)

// Honey Bear projectile — slower than Water Pistol, area-denial focus
export const HONEY_BEAR_PROJECTILE_SPEED = 2; // cells per second (must be < PROJECTILE_SPEED)
export const HONEY_BEAR_FIRE_INTERVAL = 3; // seconds between shots
export const HONEY_BEAR_AOE_DAMAGE = 25; // damage applied to each enemy in AOE

export function updateShooterCooldown(shooter: ShooterEntity, deltaSeconds: number): void {
  if (shooter.fireCooldown > 0) {
    shooter.fireCooldown -= deltaSeconds;
  }
}

export function tryFire(
  shooter: ShooterEntity,
  enemiesInLane: CombatEntity[],
): ProjectileState | null {
  if (shooter.fireCooldown > 0 || shooter.fireRate === 0) {
    return null;
  }

  // Find nearest enemy in lane within range (at or to the right of the shooter)
  const inRange = enemiesInLane.filter(
    (e) => e.col >= shooter.col - 0.5 && e.col - shooter.col <= shooter.range && e.health > 0,
  );

  if (inRange.length === 0) {
    return null;
  }

  const nearest = inRange.reduce((a, b) => (a.col < b.col ? a : b));

  shooter.fireCooldown = 1 / shooter.fireRate;

  // Spawn projectile at the nearer of col+1 or the enemy position
  // so point-blank shots connect immediately
  return {
    lane: shooter.lane,
    x: Math.min(shooter.col + 1, nearest.col),
    damage: shooter.damage,
    speed: PROJECTILE_SPEED,
  };
}

export function moveProjectile(projectile: ProjectileState, deltaSeconds: number): void {
  projectile.x += projectile.speed * deltaSeconds;
}

export function checkProjectileHit(
  projectile: ProjectileState,
  enemy: CombatEntity,
): boolean {
  const laneDist = Math.abs(projectile.lane - enemy.lane);
  const reach = ((enemy.hitboxLanes ?? 1) - 1) / 2; // 1→0, 3→1
  return (
    laneDist <= reach &&
    Math.abs(projectile.x - enemy.col) < 0.5 &&
    enemy.health > 0
  );
}

export function applyDamage(target: CombatEntity, damage: number): void {
  target.health -= damage;
}

export function isDead(entity: CombatEntity): boolean {
  return entity.health <= 0;
}

/**
 * Returns the rows affected by a vertical AOE centered on targetRow.
 * Clamps to valid grid bounds [0, gridRows-1].
 */
export function getAOETargetRows(targetRow: number, gridRows: number = 5): number[] {
  const rows = [targetRow];
  if (targetRow > 0) rows.push(targetRow - 1);
  if (targetRow < gridRows - 1) rows.push(targetRow + 1);
  return rows.sort((a, b) => a - b);
}

/**
 * Apply AOE damage to all alive enemies in targetRow ± 1 row at the target column.
 * Returns the list of enemies that were hit.
 */
export function applyAOEDamage(
  targetRow: number,
  targetCol: number,
  damage: number,
  enemies: CombatEntity[],
  gridRows: number = 5,
): CombatEntity[] {
  const rows = getAOETargetRows(targetRow, gridRows);
  const hit: CombatEntity[] = [];
  for (const enemy of enemies) {
    if (enemy.health <= 0) continue;
    if (rows.includes(enemy.lane) && Math.abs(enemy.col - targetCol) < 0.5) {
      enemy.health -= damage;
      hit.push(enemy);
    }
  }
  return hit;
}

/**
 * Apply knockback to an enemy — push it rightward by `amount` cells.
 * Clamped to maxCol (grid right edge). Boss-type enemies are immune.
 * Returns the new col position.
 */
export function applyKnockback(
  enemy: CombatEntity & { bossType?: boolean },
  amount: number,
  maxCol: number = 8,
): number {
  if ((enemy as { bossType?: boolean }).bossType) return enemy.col;
  enemy.col = Math.min(enemy.col + amount, maxCol);
  return enemy.col;
}

export function wallBlocks(
  wall: CombatEntity,
  enemy: EnemyCombatEntity,
  deltaSeconds: number,
): boolean {
  if (wall.lane !== enemy.lane || wall.health <= 0) {
    return false;
  }
  // Enemy is blocked when it reaches the wall's column
  if (Math.abs(enemy.col - wall.col) < 0.5) {
    // Enemy attacks the wall
    wall.health -= enemy.damage * deltaSeconds;
    return true;
  }
  return false;
}
