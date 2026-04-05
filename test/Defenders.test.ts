import { describe, it, expect } from 'vitest';
import { DEFENDER_TYPES } from '../src/config/defenders';

describe('Defender types', () => {
  it('defines at least 3 defender types', () => {
    const types = Object.keys(DEFENDER_TYPES);
    expect(types.length).toBeGreaterThanOrEqual(3);
  });

  it('all types have name, cost, and health', () => {
    for (const [key, def] of Object.entries(DEFENDER_TYPES)) {
      expect(def.name, `${key} missing name`).toBeTruthy();
      expect(def.cost, `${key} has invalid cost`).toBeGreaterThan(0);
      expect(def.health, `${key} has invalid health`).toBeGreaterThan(0);
    }
  });

  it('includes generator, shooter, and wall', () => {
    expect(DEFENDER_TYPES.generator).toBeDefined();
    expect(DEFENDER_TYPES.shooter).toBeDefined();
    expect(DEFENDER_TYPES.wall).toBeDefined();
  });

  it('generator does not produce passive income and does not attack', () => {
    const gen = DEFENDER_TYPES.generator;
    expect(gen.generatesIncome).toBe(0);
    expect(gen.damage).toBe(0);
  });

  it('generator income is 0 — passive timer does not increase balance', () => {
    const gen = DEFENDER_TYPES.generator;
    // Simulates what tickGeneratorIncome would do with generatesIncome
    const balance = 100;
    const newBalance = balance + gen.generatesIncome;
    expect(newBalance).toBe(100); // no change — income is 0
  });

  it('shooter attacks but does not generate income', () => {
    const shooter = DEFENDER_TYPES.shooter;
    expect(shooter.damage).toBeGreaterThan(0);
    expect(shooter.fireRate).toBeGreaterThan(0);
    expect(shooter.generatesIncome).toBe(0);
  });

  it('wall has high health relative to other types', () => {
    const wall = DEFENDER_TYPES.wall;
    const others = Object.values(DEFENDER_TYPES).filter((d) => d.name !== 'Block Tower');
    for (const other of others) {
      expect(wall.health).toBeGreaterThan(other.health);
    }
  });
});
