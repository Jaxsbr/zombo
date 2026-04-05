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
  // Mechanical detail — gear bolts on body (suggests toughness)
  g.fillStyle(0x9e9e9e, 1);
  g.fillCircle(-9, 2, 2);
  g.fillCircle(9, 2, 2);
  g.fillCircle(-9, 10, 2);
  g.fillCircle(9, 10, 2);
  // Panel line across body
  g.lineStyle(1, 0x5e35b1, 0.6);
  g.lineBetween(-13, 6, 13, 6);
}

function drawArmoredBunnyHelmet(g: Phaser.GameObjects.Graphics, healthFraction: number): void {
  if (healthFraction > 0.5) {
    // Full helmet — green toy bucket/helmet
    g.fillStyle(0x4caf50, 1);
    g.fillRect(-12, -20, 24, 14);
    g.fillStyle(0x388e3c, 1);
    g.fillRect(-14, -8, 28, 4);
    g.lineStyle(OUTLINE, 0x000000, 1);
    g.strokeRect(-12, -20, 24, 14);
    g.strokeRect(-14, -8, 28, 4);
    // Helmet star
    g.fillStyle(0xffeb3b, 1);
    g.fillCircle(0, -14, 4);
  } else if (healthFraction > 0.25) {
    // Cracked helmet — fragments
    g.fillStyle(0x4caf50, 0.7);
    g.fillRect(-10, -18, 10, 12);
    g.fillStyle(0x388e3c, 0.7);
    g.fillRect(-12, -8, 14, 4);
    g.lineStyle(1, 0x000000, 0.6);
    g.strokeRect(-10, -18, 10, 12);
    // Crack lines
    g.lineStyle(1, 0x000000, 0.8);
    g.lineBetween(-2, -18, 2, -10);
    g.lineBetween(-8, -14, -4, -8);
  }
  // < 25% = bare — no helmet drawn
}

function drawArmoredBunny(g: Phaser.GameObjects.Graphics): void {
  // Same body as Dust Bunny
  drawDustBunny(g);
  // Full helmet drawn by default — updated dynamically via updateHelmet
  drawArmoredBunnyHelmet(g, 1);
}

function drawSockPuppet(g: Phaser.GameObjects.Graphics): void {
  // Elongated sock body
  g.fillStyle(0xff8a65, 1);
  g.fillRect(-8, -18, 16, 36);
  // Rounded top (mouth area)
  g.fillStyle(0xff8a65, 1);
  g.fillCircle(0, -18, 8);
  // Mouth — open sock
  g.fillStyle(0xd84315, 1);
  g.fillRect(-6, -20, 12, 6);
  // Outline
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-8, -18, 16, 36);
  g.strokeCircle(0, -18, 8);
  // Googly eyes
  g.fillStyle(0xffffff, 1);
  g.fillCircle(-4, -12, 5);
  g.fillCircle(5, -12, 5);
  g.fillStyle(0x000000, 1);
  g.fillCircle(-3, -11, 2.5);
  g.fillCircle(6, -11, 2.5);
  // Sock stripes
  g.lineStyle(2, 0xffcc80, 1);
  g.lineBetween(-8, 0, 8, 0);
  g.lineBetween(-8, 6, 8, 6);
  g.lineBetween(-8, 12, 8, 12);
  // Spring coil at base — suggests jump capability
  g.lineStyle(2, 0x78909c, 1);
  for (let i = 0; i < 3; i++) {
    const sy = 16 + i * 3;
    g.lineBetween(-5, sy, 5, sy + 1.5);
    g.lineBetween(5, sy + 1.5, -5, sy + 3);
  }
}

const DRAW_ENEMY: Record<string, (g: Phaser.GameObjects.Graphics) => void> = {
  basic: drawDustBunny,
  tough: drawCleaningRobot,
  armored: drawArmoredBunny,
  jumper: drawSockPuppet,
};

export class EnemyEntity extends Phaser.GameObjects.Container {
  readonly enemyType: EnemyType;
  readonly enemyKey: string;
  readonly lane: number;
  health: number;
  col: number;
  readonly damage: number; // EnemyCombatEntity interface
  jumpsRemaining: number; // runtime jump state for jumper enemies
  private readonly maxHealth: number;
  private readonly healthBar: Phaser.GameObjects.Graphics;
  private readonly flashOverlay: Phaser.GameObjects.Graphics;
  private shapeGraphics!: Phaser.GameObjects.Graphics;
  private lastHelmetStage: number = 3; // track helmet visual stage

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
    this.jumpsRemaining = type.jumpsRemaining ?? 0;

    const scale = type.scale ?? 1.0;

    const shape = scene.add.graphics();
    this.shapeGraphics = shape;
    const drawFn = DRAW_ENEMY[key];
    if (drawFn) {
      drawFn(shape);
    } else {
      shape.fillStyle(0xffffff, 1);
      shape.fillCircle(0, 0, 22);
    }
    shape.setScale(scale);
    this.add(shape);

    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    // Hidden at full health — drawHealthBar only renders when damaged

    // White flash overlay for hit reactions — scaled to match entity
    this.flashOverlay = scene.add.graphics();
    this.flashOverlay.fillStyle(0xffffff, 0.8);
    this.flashOverlay.fillCircle(0, 0, 20 * scale);
    this.flashOverlay.setVisible(false);
    this.add(this.flashOverlay);

    scene.add.existing(this);

    // Per-key movement animation
    this.startMovementAnimation(scene);
  }

  private startMovementAnimation(scene: Phaser.Scene): void {
    switch (this.enemyKey) {
      case 'basic':
        // Dust Bunny — bouncing squash-stretch
        scene.tweens.add({
          targets: this,
          scaleY: 0.8,
          scaleX: 1.2,
          y: this.y - 4,
          duration: 400,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      case 'tough':
        // Cleaning Robot — rocking side to side
        scene.tweens.add({
          targets: this,
          angle: 4,
          duration: 600,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      case 'armored':
        // Armored Bunny — same bouncy squash-stretch as basic Dust Bunny
        scene.tweens.add({
          targets: this,
          scaleY: 0.85,
          scaleX: 1.15,
          y: this.y - 3,
          duration: 450,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      case 'jumper':
        // Sock Puppet — bobbing up and down with slight wobble
        scene.tweens.add({
          targets: this,
          y: this.y - 5,
          angle: 3,
          duration: 350,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
    }
  }

  /** Flash white on projectile hit */
  playHitFlash(): void {
    this.flashOverlay.setVisible(true);
    this.flashOverlay.setAlpha(0.8);
    this.scene.tweens.add({
      targets: this.flashOverlay,
      alpha: 0,
      duration: 150,
      onComplete: () => this.flashOverlay.setVisible(false),
    });
  }

  /** Update armored bunny helmet visual based on health fraction */
  updateHelmet(): void {
    if (this.enemyKey !== 'armored') return;
    const fraction = this.health / this.maxHealth;
    const stage = fraction > 0.5 ? 3 : fraction > 0.25 ? 2 : 1;
    if (stage === this.lastHelmetStage) return;
    this.lastHelmetStage = stage;
    // Redraw shape with correct helmet state (scale preserved)
    this.shapeGraphics.clear();
    drawDustBunny(this.shapeGraphics);
    drawArmoredBunnyHelmet(this.shapeGraphics, fraction);
    this.shapeGraphics.setScale(this.enemyType.scale ?? 1.0);
  }

  /** Play jump arc animation */
  playJumpArc(): void {
    const baseY = HUD_HEIGHT + this.lane * CELL_SIZE + CELL_SIZE / 2;
    this.scene.tweens.add({
      targets: this,
      y: baseY - 30,
      duration: 200,
      ease: 'Sine.easeOut',
      yoyo: true,
    });
  }

  updatePosition(): void {
    this.x = this.col * CELL_SIZE + CELL_SIZE / 2;
  }

  drawHealthBar(): void {
    this.healthBar.clear();
    const fraction = Math.max(0, this.health / this.maxHealth);

    // Only show health bar when damaged
    if (fraction >= 1) return;

    const scale = this.enemyType.scale ?? 1.0;
    const barWidth = CELL_SIZE - 12;
    const barY = (CELL_SIZE / 2 - HEALTH_BAR_BOTTOM_OFFSET - HEALTH_BAR_HEIGHT) * scale;

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
