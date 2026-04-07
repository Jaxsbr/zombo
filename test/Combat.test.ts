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
  getAOETargetRows,
  applyAOEDamage,
  applyKnockback,
  HONEY_BEAR_PROJECTILE_SPEED,
  HONEY_BEAR_AOE_DAMAGE,
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

describe('Combat — Honey Bear AOE', () => {
  it('getAOETargetRows returns center row and both adjacent rows', () => {
    const rows = getAOETargetRows(2);
    expect(rows).toEqual([1, 2, 3]);
  });

  it('getAOETargetRows clamps to top grid bound', () => {
    const rows = getAOETargetRows(0);
    expect(rows).toEqual([0, 1]);
  });

  it('getAOETargetRows clamps to bottom grid bound', () => {
    const rows = getAOETargetRows(4);
    expect(rows).toEqual([3, 4]);
  });

  it('applyAOEDamage hits enemies in target row and adjacent rows at the hit column', () => {
    const e1 = makeEnemy({ lane: 1, col: 5, health: 100 }); // adjacent row above
    const e2 = makeEnemy({ lane: 2, col: 5, health: 100 }); // target row
    const e3 = makeEnemy({ lane: 3, col: 5, health: 100 }); // adjacent row below
    const e4 = makeEnemy({ lane: 4, col: 5, health: 100 }); // out of AOE range
    const e5 = makeEnemy({ lane: 2, col: 7, health: 100 }); // same row but different col

    const hit = applyAOEDamage(2, 5, HONEY_BEAR_AOE_DAMAGE, [e1, e2, e3, e4, e5]);

    expect(hit).toHaveLength(3);
    expect(e1.health).toBe(100 - HONEY_BEAR_AOE_DAMAGE);
    expect(e2.health).toBe(100 - HONEY_BEAR_AOE_DAMAGE);
    expect(e3.health).toBe(100 - HONEY_BEAR_AOE_DAMAGE);
    expect(e4.health).toBe(100); // untouched
    expect(e5.health).toBe(100); // untouched
  });

  it('applyAOEDamage skips dead enemies', () => {
    const alive = makeEnemy({ lane: 2, col: 5, health: 100 });
    const dead = makeEnemy({ lane: 2, col: 5, health: 0 });

    const hit = applyAOEDamage(2, 5, 10, [alive, dead]);
    expect(hit).toHaveLength(1);
    expect(hit[0]).toBe(alive);
  });

  it('HONEY_BEAR_PROJECTILE_SPEED is less than Water Pistol projectile speed (4)', () => {
    expect(HONEY_BEAR_PROJECTILE_SPEED).toBeLessThan(4);
  });
});

describe('Combat — Knockback (per-enemy amount)', () => {
  it('Dust Bunny knocked back by 0.6 cells', () => {
    const enemy = { ...makeEnemy({ col: 4 }), knockbackAmount: 0.6 };
    const newCol = applyKnockback(enemy);
    expect(newCol).toBeCloseTo(4.6);
    expect(enemy.col).toBeCloseTo(4.6);
  });

  it('Sock Puppet knocked back by 0.5 cells', () => {
    const enemy = { ...makeEnemy({ col: 4 }), knockbackAmount: 0.5 };
    const newCol = applyKnockback(enemy);
    expect(newCol).toBeCloseTo(4.5);
  });

  it('Armored Bunny knocked back by 0.3 cells', () => {
    const enemy = { ...makeEnemy({ col: 4 }), knockbackAmount: 0.3 };
    const newCol = applyKnockback(enemy);
    expect(newCol).toBeCloseTo(4.3);
  });

  it('Cleaning Robot knocked back by 0.1 cells', () => {
    const enemy = { ...makeEnemy({ col: 4 }), knockbackAmount: 0.1 };
    const newCol = applyKnockback(enemy);
    expect(newCol).toBeCloseTo(4.1);
  });

  it('boss (knockbackAmount 0) is NOT knocked back', () => {
    const enemy = { ...makeEnemy({ col: 4 }), knockbackAmount: 0 };
    const newCol = applyKnockback(enemy);
    expect(newCol).toBe(4);
    expect(enemy.col).toBe(4);
  });

  it('enemy without knockbackAmount is NOT knocked back', () => {
    const enemy = makeEnemy({ col: 4 });
    const newCol = applyKnockback(enemy);
    expect(newCol).toBe(4);
  });

  it('knockback is clamped to maxCol', () => {
    const enemy = { ...makeEnemy({ col: 7.8 }), knockbackAmount: 0.6 };
    const newCol = applyKnockback(enemy, 8);
    expect(newCol).toBe(8);
    expect(enemy.col).toBe(8);
  });
});
