import { Grid, CellPosition } from './Grid';
import { Economy } from './Economy';
import { DefenderType } from '../config/defenders';

export type PlacementResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_cell' | 'occupied' | 'insufficient_funds' };

export class Placement {
  private readonly grid: Grid;
  private readonly economy: Economy;
  private readonly occupied: Set<string> = new Set();

  constructor(grid: Grid, economy: Economy) {
    this.grid = grid;
    this.economy = economy;
  }

  place(pos: CellPosition, defender: DefenderType): PlacementResult {
    if (!this.grid.isValid(pos)) {
      return { ok: false, reason: 'invalid_cell' };
    }
    const key = this.grid.cellKey(pos);
    if (this.occupied.has(key)) {
      return { ok: false, reason: 'occupied' };
    }
    if (!this.economy.spend(defender.cost)) {
      return { ok: false, reason: 'insufficient_funds' };
    }
    this.occupied.add(key);
    return { ok: true };
  }

  isOccupied(pos: CellPosition): boolean {
    return this.occupied.has(this.grid.cellKey(pos));
  }

  remove(pos: CellPosition): void {
    this.occupied.delete(this.grid.cellKey(pos));
  }

  reset(): void {
    this.occupied.clear();
  }
}
