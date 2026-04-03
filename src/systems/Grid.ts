export interface CellPosition {
  row: number;
  col: number;
}

export class Grid {
  readonly rows: number;
  readonly cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
  }

  get cellCount(): number {
    return this.rows * this.cols;
  }

  isValid(pos: CellPosition): boolean {
    return pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols;
  }

  allCells(): CellPosition[] {
    const cells: CellPosition[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  }

  cellKey(pos: CellPosition): string {
    return `${pos.row},${pos.col}`;
  }
}
