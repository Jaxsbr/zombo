export interface CombatEntity {
  health: number;
  lane: number;
  col: number; // grid column position
}

export interface ShooterEntity extends CombatEntity {
  damage: number;
  range: number;
  fireRate: number;       // shots per second
  fireCooldown: number;   // seconds until next shot
}

export interface EnemyCombatEntity extends CombatEntity {
  damage: number; // damage per second to walls
}

export interface ProjectileState {
  lane: number;
  x: number;
  damage: number;
  speed: number;
}

const PROJECTILE_SPEED = 8; // cells per second

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

  // Find nearest enemy in lane within range (to the right of the shooter)
  const inRange = enemiesInLane.filter(
    (e) => e.col > shooter.col && e.col - shooter.col <= shooter.range && e.health > 0,
  );

  if (inRange.length === 0) {
    return null;
  }

  shooter.fireCooldown = 1 / shooter.fireRate;

  return {
    lane: shooter.lane,
    x: shooter.col + 1,
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
  return (
    projectile.lane === enemy.lane &&
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
