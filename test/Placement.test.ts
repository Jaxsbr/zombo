import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from '../src/systems/Grid';
import { Economy } from '../src/systems/Economy';
import { Placement } from '../src/systems/Placement';
import { DEFENDER_TYPES } from '../src/config/defenders';

describe('Placement', () => {
  let grid: Grid;
  let economy: Economy;
  let placement: Placement;

  beforeEach(() => {
    grid = new Grid(5, 9);
    economy = new Economy(500);
    placement = new Placement(grid, economy);
  });

  it('places on an empty cell and deducts cost', () => {
    const result = placement.place({ row: 0, col: 0 }, DEFENDER_TYPES.shooter);
    expect(result).toEqual({ ok: true });
    expect(economy.getBalance()).toBe(425); // 500 - 75
    expect(placement.isOccupied({ row: 0, col: 0 })).toBe(true);
  });

  it('rejects placement on an occupied cell', () => {
    placement.place({ row: 1, col: 2 }, DEFENDER_TYPES.wall);
    const result = placement.place({ row: 1, col: 2 }, DEFENDER_TYPES.shooter);
    expect(result).toEqual({ ok: false, reason: 'occupied' });
  });

  it('rejects placement with insufficient funds', () => {
    const poorEconomy = new Economy(10);
    const poorPlacement = new Placement(grid, poorEconomy);
    const result = poorPlacement.place({ row: 0, col: 0 }, DEFENDER_TYPES.shooter);
    expect(result).toEqual({ ok: false, reason: 'insufficient_funds' });
    expect(poorEconomy.getBalance()).toBe(10); // unchanged
  });

  it('rejects placement on invalid cell', () => {
    const result = placement.place({ row: -1, col: 0 }, DEFENDER_TYPES.shooter);
    expect(result).toEqual({ ok: false, reason: 'invalid_cell' });
  });

  it('allows placement after removal', () => {
    placement.place({ row: 2, col: 3 }, DEFENDER_TYPES.wall);
    placement.remove({ row: 2, col: 3 });
    expect(placement.isOccupied({ row: 2, col: 3 })).toBe(false);
    const result = placement.place({ row: 2, col: 3 }, DEFENDER_TYPES.generator);
    expect(result).toEqual({ ok: true });
  });

  it('resets clears all occupancy', () => {
    placement.place({ row: 0, col: 0 }, DEFENDER_TYPES.wall);
    placement.place({ row: 1, col: 1 }, DEFENDER_TYPES.shooter);
    placement.reset();
    expect(placement.isOccupied({ row: 0, col: 0 })).toBe(false);
    expect(placement.isOccupied({ row: 1, col: 1 })).toBe(false);
  });
});
