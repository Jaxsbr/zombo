import Phaser from 'phaser';
import { DefenderType } from '../config/defenders';
import { CELL_SIZE, HUD_HEIGHT } from '../config/game';

const HEALTH_BAR_HEIGHT = 8;
const HEALTH_BAR_BOTTOM_OFFSET = 6;
const OUTLINE = 2;

function drawWaterPistol(g: Phaser.GameObjects.Graphics): void {
  // Body — bright blue rectangle
  g.fillStyle(0x2196f3, 1);
  g.fillRect(-12, -6, 24, 14);
  // Nozzle — narrow barrel extending right
  g.fillStyle(0x64b5f6, 1);
  g.fillRect(12, -3, 10, 8);
  // Handle/trigger — below body
  g.fillStyle(0x1565c0, 1);
  g.fillRect(-4, 8, 10, 10);
  // Trigger — small bump
  g.fillStyle(0xff9800, 1);
  g.fillRect(2, 10, 4, 4);
  // Thick outline
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-12, -6, 24, 14);
  g.strokeRect(12, -3, 10, 8);
  g.strokeRect(-4, 8, 10, 10);
}

function drawJackInTheBox(g: Phaser.GameObjects.Graphics): void {
  // Large box — bright yellow, prominent
  g.fillStyle(0xffc107, 1);
  g.fillRect(-16, 0, 32, 22);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-16, 0, 32, 22);
  // Box pattern — star/diamond on front
  g.fillStyle(0xff9800, 1);
  g.fillRect(-6, 6, 12, 10);
  g.lineStyle(1, 0xe65100, 1);
  g.strokeRect(-6, 6, 12, 10);
  // Open lid — hinged at back, tilted
  g.fillStyle(0xffca28, 1);
  g.beginPath();
  g.moveTo(-16, 0);
  g.lineTo(-14, -8);
  g.lineTo(14, -8);
  g.lineTo(16, 0);
  g.closePath();
  g.fillPath();
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.beginPath();
  g.moveTo(-16, 0);
  g.lineTo(-14, -8);
  g.lineTo(14, -8);
  g.lineTo(16, 0);
  g.closePath();
  g.strokePath();
  // Jester head — big, colorful, popping out of box
  g.fillStyle(0xf44336, 1);
  g.fillCircle(0, -16, 9);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeCircle(0, -16, 9);
  // Jester hat points
  g.fillStyle(0x9c27b0, 1);
  g.fillCircle(-8, -22, 4);
  g.fillCircle(8, -22, 4);
  g.lineStyle(1, 0x000000, 1);
  g.strokeCircle(-8, -22, 4);
  g.strokeCircle(8, -22, 4);
  // Face — big googly eyes + smile
  g.fillStyle(0xffffff, 1);
  g.fillCircle(-4, -17, 3);
  g.fillCircle(4, -17, 3);
  g.fillStyle(0x000000, 1);
  g.fillCircle(-3, -16, 1.5);
  g.fillCircle(5, -16, 1.5);
  // Smile
  g.lineStyle(1.5, 0x000000, 1);
  g.beginPath();
  g.arc(0, -14, 4, 0, Math.PI, false);
  g.strokePath();
  // Crank handle on side
  g.lineStyle(2, 0x795548, 1);
  g.lineBetween(16, 10, 22, 10);
  g.fillStyle(0x795548, 1);
  g.fillCircle(24, 10, 3);
}

function drawBlockTower(g: Phaser.GameObjects.Graphics): void {
  // Bottom block — red
  g.fillStyle(0xf44336, 1);
  g.fillRect(-14, 8, 28, 12);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-14, 8, 28, 12);
  // Middle block — blue, slightly offset
  g.fillStyle(0x2196f3, 1);
  g.fillRect(-11, -4, 22, 12);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-11, -4, 22, 12);
  // Top block — yellow, smaller
  g.fillStyle(0xffc107, 1);
  g.fillRect(-8, -16, 16, 12);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-8, -16, 16, 12);
}

function drawHoneyBear(g: Phaser.GameObjects.Graphics): void {
  // Amber/golden bear body
  g.fillStyle(0xffb300, 1);
  g.fillCircle(0, 2, 14);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeCircle(0, 2, 14);
  // Ears — round bear ears
  g.fillStyle(0xffa000, 1);
  g.fillCircle(-10, -10, 6);
  g.fillCircle(10, -10, 6);
  g.lineStyle(1, 0x000000, 1);
  g.strokeCircle(-10, -10, 6);
  g.strokeCircle(10, -10, 6);
  // Inner ears
  g.fillStyle(0xffe082, 1);
  g.fillCircle(-10, -10, 3);
  g.fillCircle(10, -10, 3);
  // Belly — lighter golden patch
  g.fillStyle(0xffe082, 1);
  g.fillEllipse(0, 5, 14, 10);
  // Snout
  g.fillStyle(0xffd54f, 1);
  g.fillEllipse(0, 2, 8, 6);
  // Nose — dark amber
  g.fillStyle(0x795548, 1);
  g.fillCircle(0, 0, 3);
  // Eyes — friendly dots
  g.fillStyle(0x000000, 1);
  g.fillCircle(-5, -4, 2);
  g.fillCircle(5, -4, 2);
  // Honey drip on paw
  g.fillStyle(0xffb300, 0.7);
  g.fillCircle(10, 10, 4);
  g.fillCircle(10, 14, 3);
}

function drawWaterCannon(g: Phaser.GameObjects.Graphics): void {
  // Chunky toy water blaster — big barrel, playful proportions
  // Tank/reservoir — wide rounded body (cyan)
  g.fillStyle(0x00bcd4, 1);
  g.fillRect(-14, -4, 28, 18);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-14, -4, 28, 18);
  // Tank fill window — lighter blue stripe
  g.fillStyle(0x4dd0e1, 1);
  g.fillRect(-10, 0, 20, 8);
  // Barrel — thick nozzle extending right (darker blue)
  g.fillStyle(0x0097a7, 1);
  g.fillRect(14, -2, 14, 12);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(14, -2, 14, 12);
  // Barrel tip — flared nozzle
  g.fillStyle(0x00838f, 1);
  g.fillRect(26, -5, 6, 18);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(26, -5, 6, 18);
  // Pressure gauge — small circle on body
  g.fillStyle(0xffeb3b, 1);
  g.fillCircle(-6, 4, 4);
  g.lineStyle(1, 0x000000, 0.6);
  g.strokeCircle(-6, 4, 4);
  // Gauge needle
  g.lineStyle(1.5, 0xf44336, 1);
  g.lineBetween(-6, 4, -4, 2);
  // Handle/grip — below body (orange, playful)
  g.fillStyle(0xff9800, 1);
  g.fillRect(-4, 14, 12, 10);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-4, 14, 12, 10);
  // Pump handle — on top
  g.fillStyle(0xff9800, 1);
  g.fillRect(-2, -12, 8, 8);
  g.lineStyle(OUTLINE, 0x000000, 1);
  g.strokeRect(-2, -12, 8, 8);
  // Pump rod
  g.lineStyle(2, 0x795548, 1);
  g.lineBetween(2, -12, 2, -18);
  g.fillStyle(0x795548, 1);
  g.fillCircle(2, -19, 3);
}

function drawMarbleMine(g: Phaser.GameObjects.Graphics): void {
  // Cluster of coloured marbles
  const marbles = [
    { x: -6, y: -4, r: 7, color: 0x4caf50 },
    { x: 6, y: -4, r: 7, color: 0x2196f3 },
    { x: 0, y: 5, r: 7, color: 0xf44336 },
    { x: -4, y: -10, r: 5, color: 0xffeb3b },
    { x: 7, y: 4, r: 5, color: 0x9c27b0 },
  ];
  for (const m of marbles) {
    g.fillStyle(m.color, 1);
    g.fillCircle(m.x, m.y, m.r);
    // Glass shine
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(m.x - m.r * 0.3, m.y - m.r * 0.3, m.r * 0.3);
    g.lineStyle(1, 0x000000, 0.5);
    g.strokeCircle(m.x, m.y, m.r);
  }
}

export const DRAW_DEFENDER: Record<string, (g: Phaser.GameObjects.Graphics) => void> = {
  shooter: drawWaterPistol,
  generator: drawJackInTheBox,
  wall: drawBlockTower,
  trapper: drawHoneyBear,
  cannon: drawWaterCannon,
  mine: drawMarbleMine,
};

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

    const shape = scene.add.graphics();
    const drawFn = DRAW_DEFENDER[key];
    if (drawFn) {
      drawFn(shape);
    } else {
      shape.fillStyle(0xffffff, 1);
      const padding = 6;
      shape.fillRect(
        -CELL_SIZE / 2 + padding,
        -CELL_SIZE / 2 + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2,
      );
    }
    this.add(shape);

    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    // Hidden at full health — drawHealthBar only renders when damaged

    scene.add.existing(this);

    // Placement bounce-in animation
    this.setScale(0.3);
    scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Per-key idle animation
    this.startIdleAnimation(scene);
  }

  private startIdleAnimation(scene: Phaser.Scene): void {
    switch (this.defenderKey) {
      case 'shooter':
        // Water Pistol — continuous gentle bob
        scene.tweens.add({
          targets: this,
          y: this.y - 3,
          duration: 1500,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      case 'generator':
        // Jack-in-the-Box — spring wiggle (rotation oscillation)
        scene.tweens.add({
          targets: this,
          angle: 3,
          duration: 800,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      case 'wall':
        // Block Tower — subtle sway
        scene.tweens.add({
          targets: this,
          angle: 1.5,
          duration: 2000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      case 'trapper':
        // Honey Bear — gentle breathing/pulse
        scene.tweens.add({
          targets: this,
          scaleX: 1.06,
          scaleY: 1.06,
          duration: 1200,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      case 'cannon':
        // Water Cannon — slow bob like Water Pistol but heavier
        scene.tweens.add({
          targets: this,
          y: this.y - 2,
          duration: 1800,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
        break;
    }
  }

  /** Projectile fire reaction — recoil for shooter/cannon, forward-lunge for trapper */
  playRecoil(): void {
    if (this.defenderKey === 'shooter') {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.85,
        scaleY: 1.1,
        duration: 80,
        ease: 'Quad.easeOut',
        yoyo: true,
      });
    } else if (this.defenderKey === 'cannon') {
      // Water Cannon — heavy forward-lunge recoil (stronger than trapper)
      this.scene.tweens.add({
        targets: this,
        x: this.x + 6,
        scaleX: 0.9,
        scaleY: 1.05,
        duration: 120,
        ease: 'Quad.easeOut',
        yoyo: true,
      });
    } else if (this.defenderType.behavior === 'trapper') {
      // Honey Bear forward-lunge — brief x push toward enemies
      this.scene.tweens.add({
        targets: this,
        x: this.x + 4,
        duration: 100,
        ease: 'Quad.easeOut',
        yoyo: true,
      });
    }
  }

  /** Jack-in-the-Box produce — body pulse on income tick */
  playProduce(): void {
    if (this.defenderKey !== 'generator') return;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 150,
      ease: 'Back.easeOut',
      yoyo: true,
    });
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
