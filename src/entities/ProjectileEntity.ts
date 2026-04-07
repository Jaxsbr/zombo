import Phaser from 'phaser';
import { CELL_SIZE, HUD_HEIGHT } from '../config/game';

const PROJECTILE_COLOR = 0xfbbf24;
const HONEY_PROJECTILE_COLOR = 0xe65100; // amber — distinct from Water Pistol yellow
const CANNON_PROJECTILE_COLOR = 0x00bcd4; // cyan — Water Cannon blue
const PROJECTILE_RADIUS = 5;
const HONEY_PROJECTILE_RADIUS = 11; // big fat honey glob
const CANNON_PROJECTILE_RADIUS = 8; // larger than Water Pistol, smaller than honey

export class ProjectileEntity extends Phaser.GameObjects.Container {
  readonly lane: number;
  col: number;
  readonly damage: number;
  readonly speed: number;
  readonly isHoney: boolean;
  readonly isCannon: boolean;

  constructor(
    scene: Phaser.Scene,
    lane: number,
    col: number,
    damage: number,
    speed: number,
    isHoney: boolean = false,
    isCannon: boolean = false,
  ) {
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = HUD_HEIGHT + lane * CELL_SIZE + CELL_SIZE / 2;
    super(scene, x, y);

    this.lane = lane;
    this.col = col;
    this.damage = damage;
    this.speed = speed;
    this.isHoney = isHoney;
    this.isCannon = isCannon;

    const g = scene.add.graphics();
    if (isHoney) {
      // Outer glow ring
      g.fillStyle(0xffb300, 0.25);
      g.fillCircle(0, 0, HONEY_PROJECTILE_RADIUS + 4);
      // Main glob
      g.fillStyle(HONEY_PROJECTILE_COLOR, 0.9);
      g.fillCircle(0, 0, HONEY_PROJECTILE_RADIUS);
      // Hot center highlight
      g.fillStyle(0xffd54f, 0.6);
      g.fillCircle(-2, -2, 5);
    } else if (isCannon) {
      // Outer splash ring
      g.fillStyle(0x4dd0e1, 0.3);
      g.fillCircle(0, 0, CANNON_PROJECTILE_RADIUS + 3);
      // Main water blast — blue/cyan
      g.fillStyle(CANNON_PROJECTILE_COLOR, 0.9);
      g.fillCircle(0, 0, CANNON_PROJECTILE_RADIUS);
      // White splash highlight
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(-2, -2, 3);
    } else {
      g.fillStyle(PROJECTILE_COLOR, 1);
      g.fillCircle(0, 0, PROJECTILE_RADIUS);
    }
    this.add(g);

    scene.add.existing(this);
  }

  updatePosition(): void {
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
  }
}
