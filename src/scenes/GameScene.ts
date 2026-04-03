import Phaser from 'phaser';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, HUD_HEIGHT } from '../config/game';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.drawGrid();
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * CELL_SIZE;
        const y = HUD_HEIGHT + row * CELL_SIZE;

        // Alternating green shades for a lawn look
        const shade = (row + col) % 2 === 0 ? 0x3a7d32 : 0x2d6b27;
        graphics.fillStyle(shade, 1);
        graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Cell border
        graphics.lineStyle(1, 0x1a5c14, 0.3);
        graphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    // HUD background
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, GRID_COLS * CELL_SIZE, HUD_HEIGHT);
  }
}
