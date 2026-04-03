import { describe, it, expect } from 'vitest';
import {
  ShooterEntity,
  CombatEntity,
  EnemyCombatEntity,
  ProjectileState,
  tryFire,
  updateShooterCooldown,
  moveProjectile,
  checkProjectileHit,
  applyDamage,
  isDead,
  wallBlocks,
} from '../src/systems/Combat';

function makeShooter(overrides: Partial<ShooterEntity> = {}): ShooterEntity {
  return {
    health: 80,
    lane: 0,
    col: 2,
    damage: 25,
    range: 9,
    fireRate: 1,
    fireCooldown: 0,
    ...overrides,
  };
}

function makeEnemy(overrides: Partial<EnemyCombatEntity> = {}): EnemyCombatEntity {
  return {
    health: 100,
    lane: 0,
    col: 6,
    damage: 20,
    ...overrides,
  };
}

describe('Combat — Shooter attacks', () => {
  it('fires a projectile when enemy is in lane and range', () => {
    const shooter = makeShooter();
    const enemy = makeEnemy();
    const projectile = tryFire(shooter, [enemy]);
    expect(projectile).not.toBeNull();
    expect(projectile!.damage).toBe(25);
    expect(projectile!.lane).toBe(0);
  });

  it('does not fire when on cooldown', () => {
    const shooter = makeShooter({ fireCooldown: 0.5 });
    const enemy = makeEnemy();
    const projectile = tryFire(shooter, [enemy]);
    expect(projectile).toBeNull();
  });

  it('does not fire when no enemies in range', () => {
    const shooter = makeShooter({ range: 2 });
    const enemy = makeEnemy({ col: 8 }); // out of range
    const projectile = tryFire(shooter, [enemy]);
    expect(projectile).toBeNull();
  });

  it('does not fire at enemies behind the shooter', () => {
    const shooter = makeShooter({ col: 5 });
    const enemy = makeEnemy({ col: 3 }); // behind
    const projectile = tryFire(shooter, [enemy]);
    expect(projectile).toBeNull();
  });

  it('cooldown decreases over time', () => {
    const shooter = makeShooter({ fireCooldown: 1 });
    updateShooterCooldown(shooter, 0.5);
    expect(shooter.fireCooldown).toBe(0.5);
  });
});

describe('Combat — Projectile damage', () => {
  it('projectile moves rightward', () => {
    const proj: ProjectileState = { lane: 0, x: 3, damage: 25, speed: 8 };
    moveProjectile(proj, 0.5);
    expect(proj.x).toBe(7); // 3 + 8*0.5
  });

  it('detects hit when projectile overlaps enemy', () => {
    const proj: ProjectileState = { lane: 0, x: 6, damage: 25, speed: 8 };
    const enemy = makeEnemy({ col: 6 });
    expect(checkProjectileHit(proj, enemy)).toBe(true);
  });

  it('does not hit enemy in different lane', () => {
    const proj: ProjectileState = { lane: 0, x: 6, damage: 25, speed: 8 };
    const enemy = makeEnemy({ lane: 1, col: 6 });
    expect(checkProjectileHit(proj, enemy)).toBe(false);
  });

  it('enemy health decreases when hit', () => {
    const enemy = makeEnemy({ health: 100 });
    applyDamage(enemy, 25);
    expect(enemy.health).toBe(75);
  });

  it('enemy at health <= 0 is flagged for removal', () => {
    const enemy = makeEnemy({ health: 25 });
    applyDamage(enemy, 25);
    expect(isDead(enemy)).toBe(true);
  });

  it('enemy at negative health is also dead', () => {
    const enemy = makeEnemy({ health: 10 });
    applyDamage(enemy, 25);
    expect(enemy.health).toBe(-15);
    expect(isDead(enemy)).toBe(true);
  });
});

describe('Combat — Wall blocking', () => {
  it('wall blocks enemy at same position', () => {
    const wall: CombatEntity = { health: 400, lane: 0, col: 3 };
    const enemy = makeEnemy({ lane: 0, col: 3 });
    const blocked = wallBlocks(wall, enemy, 1);
    expect(blocked).toBe(true);
  });

  it('wall health decreases when enemy attacks it', () => {
    const wall: CombatEntity = { health: 400, lane: 0, col: 3 };
    const enemy = makeEnemy({ lane: 0, col: 3, damage: 20 });
    wallBlocks(wall, enemy, 1);
    expect(wall.health).toBe(380); // 400 - 20*1
  });

  it('wall does not block enemy in different lane', () => {
    const wall: CombatEntity = { health: 400, lane: 0, col: 3 };
    const enemy = makeEnemy({ lane: 1, col: 3 });
    const blocked = wallBlocks(wall, enemy, 1);
    expect(blocked).toBe(false);
  });

  it('dead wall does not block', () => {
    const wall: CombatEntity = { health: 0, lane: 0, col: 3 };
    const enemy = makeEnemy({ lane: 0, col: 3 });
    const blocked = wallBlocks(wall, enemy, 1);
    expect(blocked).toBe(false);
  });
});
