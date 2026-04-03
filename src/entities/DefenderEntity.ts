import Phaser from 'phaser';
import { DefenderType } from '../config/defenders';
import { CELL_SIZE, HUD_HEIGHT } from '../config/game';

const DEFENDER_COLORS: Record<string, number> = {
  generator: 0x22c55e,
  shooter: 0x3b82f6,
  wall: 0x9ca3af,
};

const HEALTH_BAR_HEIGHT = 4;
const HEALTH_BAR_OFFSET = 4;

export class DefenderEntity extends Phaser.GameObjects.Container {
  readonly defenderType: DefenderType;
  readonly defenderKey: string;
  readonly gridRow: number;
  readonly gridCol: number;
  health: number;

  // CombatEntity interface
  get lane(): number { return this.gridRow; }
  get col(): number { return this.gridCol; }
  private readonly maxHealth: number;
  private readonly healthBar: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    row: number,
    col: number,
    key: string,
    type: DefenderType,
  ) {
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = HUD_HEIGHT + row * CELL_SIZE + CELL_SIZE / 2;
    super(scene, x, y);

    this.defenderType = type;
    this.defenderKey = key;
    this.gridRow = row;
    this.gridCol = col;
    this.health = type.health;
    this.maxHealth = type.health;

    const color = DEFENDER_COLORS[key] ?? 0xffffff;
    const padding = 6;
    const rect = scene.add.graphics();
    rect.fillStyle(color, 1);
    rect.fillRect(
      -CELL_SIZE / 2 + padding,
      -CELL_SIZE / 2 + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2,
    );
    this.add(rect);

    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.drawHealthBar();

    scene.add.existing(this);
  }

  drawHealthBar(): void {
    this.healthBar.clear();
    const barWidth = CELL_SIZE - 12;
    const fraction = Math.max(0, this.health / this.maxHealth);

    const barY = -CELL_SIZE / 2 + HEALTH_BAR_OFFSET;

    // Background (red)
    this.healthBar.fillStyle(0xef4444, 1);
    this.healthBar.fillRect(-barWidth / 2, barY, barWidth, HEALTH_BAR_HEIGHT);

    // Foreground (green → red gradient via fraction)
    const green = Math.floor(fraction * 0x88);
    const red = Math.floor((1 - fraction) * 0xee);
    const barColor = (red << 16) | (green << 8) | 0x22;
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRect(-barWidth / 2, barY, barWidth * fraction, HEALTH_BAR_HEIGHT);
  }
}
