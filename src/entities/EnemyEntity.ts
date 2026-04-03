import Phaser from 'phaser';
import { EnemyType } from '../config/enemies';
import { CELL_SIZE, HUD_HEIGHT } from '../config/game';

const HEALTH_BAR_HEIGHT = 8;
const HEALTH_BAR_BOTTOM_OFFSET = 6;
const OUTLINE = 2;

function drawDustBunny(g: Phaser.GameObjects.Graphics): void {
  // Fluffy body — overlapping circles in warm pink/gray
  g.fillStyle(0xf48fb1, 1);
  g.fillCircle(-6, 4, 12);
  g.fillCircle(6, 4, 12);
  g.fillCircle(0, -4, 14);
  g.fillCircle(-10, -6, 8);
  g.fillCircle(10, -6, 8);
  // Outline around main mass
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeCircle(-6, 4, 12);
  g.strokeCircle(6, 4, 12);
  g.strokeCircle(0, -4, 14);
  // Eyes — big white circles with black pupils
  g.fillStyle(0xffffff, 1);
  g.fillCircle(-6, -6, 5);
  g.fillCircle(6, -6, 5);
  g.fillStyle(0x000000, 1);
  g.fillCircle(-5, -5, 2.5);
  g.fillCircle(7, -5, 2.5);
}

function drawCleaningRobot(g: Phaser.GameObjects.Graphics): void {
  // Body — metallic purple rectangle
  g.fillStyle(0x7e57c2, 1);
  g.fillRect(-14, -6, 28, 22);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-14, -6, 28, 22);
  // Head/dome — lighter purple
  g.fillStyle(0xb39ddb, 1);
  g.fillRect(-10, -18, 20, 12);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-10, -18, 20, 12);
  // Antenna
  g.lineStyle(2, 0x9e9e9e, 1);
  g.lineBetween(0, -18, 0, -24);
  g.fillStyle(0xff5722, 1);
  g.fillCircle(0, -26, 3);
  // Eyes — glowing green
  g.fillStyle(0x76ff03, 1);
  g.fillCircle(-4, -13, 3);
  g.fillCircle(4, -13, 3);
  g.fillStyle(0x000000, 1);
  g.fillCircle(-4, -13, 1.5);
  g.fillCircle(4, -13, 1.5);
  // Wheels — small circles at bottom
  g.fillStyle(0x424242, 1);
  g.fillCircle(-10, 18, 4);
  g.fillCircle(10, 18, 4);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeCircle(-10, 18, 4);
  g.strokeCircle(10, 18, 4);
}

const DRAW_ENEMY: Record<string, (g: Phaser.GameObjects.Graphics) => void> = {
  basic: drawDustBunny,
  tough: drawCleaningRobot,
};

export class EnemyEntity extends Phaser.GameObjects.Container {
  readonly enemyType: EnemyType;
  readonly enemyKey: string;
  readonly lane: number;
  health: number;
  col: number;
  readonly damage: number; // EnemyCombatEntity interface
  private readonly maxHealth: number;
  private readonly healthBar: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    lane: number,
    col: number,
    key: string,
    type: EnemyType,
  ) {
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = HUD_HEIGHT + lane * CELL_SIZE + CELL_SIZE / 2;
    super(scene, x, y);

    this.enemyType = type;
    this.enemyKey = key;
    this.lane = lane;
    this.col = col;
    this.health = type.health;
    this.maxHealth = type.health;
    this.damage = type.damage;

    const shape = scene.add.graphics();
    const drawFn = DRAW_ENEMY[key];
    if (drawFn) {
      drawFn(shape);
    } else {
      shape.fillStyle(0xffffff, 1);
      shape.fillCircle(0, 0, 22);
    }
    this.add(shape);

    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    // Hidden at full health — drawHealthBar only renders when damaged

    scene.add.existing(this);
  }

  updatePosition(): void {
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
  }

  drawHealthBar(): void {
    this.healthBar.clear();
    const fraction = Math.max(0, this.health / this.maxHealth);

    // Only show health bar when damaged
    if (fraction >= 1) return;

    const barWidth = CELL_SIZE - 12;
    const barY = CELL_SIZE / 2 - HEALTH_BAR_BOTTOM_OFFSET - HEALTH_BAR_HEIGHT;

    // Background (dark)
    this.healthBar.fillStyle(0x1a1a1a, 0.8);
    this.healthBar.fillRoundedRect(-barWidth / 2, barY, barWidth, HEALTH_BAR_HEIGHT, 2);

    // Foreground (green → red gradient via fraction)
    const green = Math.floor(fraction * 0x88);
    const red = Math.floor((1 - fraction) * 0xee);
    const barColor = (red << 16) | (green << 8) | 0x22;
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRoundedRect(-barWidth / 2, barY, barWidth * fraction, HEALTH_BAR_HEIGHT, 2);

    // Border
    this.healthBar.lineStyle(1, 0x000000, 0.5);
    this.healthBar.strokeRoundedRect(-barWidth / 2, barY, barWidth, HEALTH_BAR_HEIGHT, 2);
  }
}
