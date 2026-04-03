import Phaser from 'phaser';
import { EnemyType } from '../config/enemies';
import { CELL_SIZE, HUD_HEIGHT } from '../config/game';

const ENEMY_COLORS: Record<string, number> = {
  basic: 0xef4444,
  tough: 0xa855f7,
};

const HEALTH_BAR_HEIGHT = 4;
const HEALTH_BAR_OFFSET = 4;
const CIRCLE_RADIUS = 22;

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

    const color = ENEMY_COLORS[key] ?? 0xffffff;
    const circle = scene.add.graphics();
    circle.fillStyle(color, 1);
    circle.fillCircle(0, 0, CIRCLE_RADIUS);
    this.add(circle);

    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.drawHealthBar();

    scene.add.existing(this);
  }

  updatePosition(): void {
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
  }

  drawHealthBar(): void {
    this.healthBar.clear();
    const barWidth = CELL_SIZE - 12;
    const fraction = Math.max(0, this.health / this.maxHealth);

    const barY = -CELL_SIZE / 2 + HEALTH_BAR_OFFSET;

    this.healthBar.fillStyle(0xef4444, 1);
    this.healthBar.fillRect(-barWidth / 2, barY, barWidth, HEALTH_BAR_HEIGHT);

    const green = Math.floor(fraction * 0x88);
    const red = Math.floor((1 - fraction) * 0xee);
    const barColor = (red << 16) | (green << 8) | 0x22;
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRect(-barWidth / 2, barY, barWidth * fraction, HEALTH_BAR_HEIGHT);
  }
}
