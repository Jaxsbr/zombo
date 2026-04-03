import { describe, it, expect } from 'vitest';
import { Grid } from '../src/systems/Grid';

describe('Grid', () => {
  const grid = new Grid(5, 9);

  it('has correct dimensions', () => {
    expect(grid.rows).toBe(5);
    expect(grid.cols).toBe(9);
  });

  it('reports cell count as rows * cols', () => {
    expect(grid.cellCount).toBe(45);
  });

  it('validates in-bounds positions', () => {
    expect(grid.isValid({ row: 0, col: 0 })).toBe(true);
    expect(grid.isValid({ row: 4, col: 8 })).toBe(true);
    expect(grid.isValid({ row: 2, col: 5 })).toBe(true);
  });

  it('rejects out-of-bounds positions', () => {
    expect(grid.isValid({ row: -1, col: 0 })).toBe(false);
    expect(grid.isValid({ row: 5, col: 0 })).toBe(false);
    expect(grid.isValid({ row: 0, col: 9 })).toBe(false);
    expect(grid.isValid({ row: 0, col: -1 })).toBe(false);
  });

  it('returns all cells', () => {
    const cells = grid.allCells();
    expect(cells).toHaveLength(45);
    expect(cells[0]).toEqual({ row: 0, col: 0 });
    expect(cells[44]).toEqual({ row: 4, col: 8 });
  });

  it('produces unique cell keys', () => {
    const keys = grid.allCells().map((c) => grid.cellKey(c));
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(45);
  });
});
