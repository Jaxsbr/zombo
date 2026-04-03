import Phaser from 'phaser';
import { CELL_SIZE, HUD_HEIGHT } from '../config/game';

const PROJECTILE_COLOR = 0xfbbf24;
const PROJECTILE_RADIUS = 5;

export class ProjectileEntity extends Phaser.GameObjects.Container {
  readonly lane: number;
  col: number;
  readonly damage: number;
  readonly speed: number;

  constructor(
    scene: Phaser.Scene,
    lane: number,
    col: number,
    damage: number,
    speed: number,
  ) {
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = HUD_HEIGHT + lane * CELL_SIZE + CELL_SIZE / 2;
    super(scene, x, y);

    this.lane = lane;
    this.col = col;
    this.damage = damage;
    this.speed = speed;

    const circle = scene.add.graphics();
    circle.fillStyle(PROJECTILE_COLOR, 1);
    circle.fillCircle(0, 0, PROJECTILE_RADIUS);
    this.add(circle);

    scene.add.existing(this);
  }

  updatePosition(): void {
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
  }
}
