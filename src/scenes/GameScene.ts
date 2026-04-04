import Phaser from 'phaser';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, HUD_HEIGHT } from '../config/game';
import { DEFENDER_TYPES, DefenderType, MINE_ARM_DELAY } from '../config/defenders';
import { ENEMY_TYPES } from '../config/enemies';
import { LEVEL_1 } from '../config/levels';
import { Grid } from '../systems/Grid';
import { Economy } from '../systems/Economy';
import { Placement } from '../systems/Placement';
import { WaveManager, WaveState } from '../systems/WaveManager';
import { GameFlow } from '../systems/GameFlow';
import {
  ShooterEntity as ShooterState,
  ProjectileState,
  updateShooterCooldown,
  tryFire,
  moveProjectile,
  checkProjectileHit,
  applyDamage,
  isDead,
  wallBlocks,
} from '../systems/Combat';
import { DefenderEntity, DRAW_DEFENDER } from '../entities/DefenderEntity';
import { bombDetonate, mineTriggerCheck, MineState, createMineState, updateMineState } from '../systems/SingleUse';
import { EnemyEntity } from '../entities/EnemyEntity';
import { ProjectileEntity } from '../entities/ProjectileEntity';
import {
  playSfxPlace,
  playSfxFire,
  playSfxHit,
  playSfxDeath,
  playSfxAnnounce,
  playSfxCollect,
  setSfxMuted,
  isSfxMuted,
} from '../systems/SFX';

const STARTING_BALANCE = 500;
const SPARK_SPAWN_INTERVAL = 8000; // ms between spark spawns
const SPARK_VALUE = 25; // sparks balance added per collection
const SPARK_FALL_SPEED = 30; // pixels per second
const GENERATOR_INCOME_INTERVAL = 5000; // ms
const FADE_DURATION = 600;

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private economy!: Economy;
  private placement!: Placement;
  private waveManager!: WaveManager;
  private gameFlow!: GameFlow;

  private balanceText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private announcementText!: Phaser.GameObjects.Text;
  private countdownBar!: Phaser.GameObjects.Graphics;
  private countdownLabel!: Phaser.GameObjects.Text;
  private progressDots: Phaser.GameObjects.Graphics[] = [];
  private lastWaveState: WaveState = 'setup';
  private selectedDefenderKey: string | null = null;
  private panelCards: Map<string, Phaser.GameObjects.Container> = new Map();
  private defenders: DefenderEntity[] = [];
  private enemies: EnemyEntity[] = [];
  private projectiles: ProjectileEntity[] = [];
  private cellZones: Phaser.GameObjects.Zone[] = [];
  private sparks: Phaser.GameObjects.Container[] = [];
  private mineStates: Map<DefenderEntity, MineState> = new Map();
  private rechargeTimers: Map<string, number> = new Map(); // defenderKey → remaining ms
  private transitioning = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);
    this.transitioning = false;

    // Initialize systems
    this.grid = new Grid(GRID_ROWS, GRID_COLS);
    this.economy = new Economy(STARTING_BALANCE);
    this.placement = new Placement(this.grid, this.economy);
    this.waveManager = new WaveManager(LEVEL_1);
    this.gameFlow = new GameFlow();

    // Reset state
    this.selectedDefenderKey = null;
    this.panelCards = new Map();
    this.defenders = [];
    this.enemies = [];
    this.projectiles = [];
    this.cellZones = [];
    this.sparks = [];
    this.mineStates = new Map();
    this.rechargeTimers = new Map();
    this.progressDots = [];
    this.lastWaveState = 'setup';

    this.drawGrid();
    this.createAtmosphere();
    this.createHUD();
    this.createDefenderPanel();
    this.createGridClickZones();
    this.createAnnouncementText();
    this.createProgressDots();
    this.createCountdownBar();

    // Spark spawner (replaces passive income timer)
    this.time.addEvent({
      delay: SPARK_SPAWN_INTERVAL,
      callback: () => this.spawnSpark(),
      loop: true,
    });

    // Generator income
    this.time.addEvent({
      delay: GENERATOR_INCOME_INTERVAL,
      callback: () => this.tickGeneratorIncome(),
      loop: true,
    });
  }

  private tickGeneratorIncome(): void {
    for (const def of this.defenders) {
      if (def.defenderType.generatesIncome > 0 && !isDead(def)) {
        this.economy.addIncome(def.defenderType.generatesIncome);
        def.playProduce();
      }
    }
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * CELL_SIZE;
        const y = HUD_HEIGHT + row * CELL_SIZE;

        const shade = (row + col) % 2 === 0 ? 0xc4a882 : 0xb0956e;
        graphics.fillStyle(shade, 1);
        graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        graphics.lineStyle(1, 0x8b7355, 0.3);
        graphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    // HUD background
    graphics.fillStyle(0x3e2723, 1);
    graphics.fillRect(0, 0, GRID_COLS * CELL_SIZE, HUD_HEIGHT);
  }

  private createAtmosphere(): void {
    const ATMO_DEPTH = -10; // behind all gameplay entities

    // Furniture silhouettes along top edge of play area
    const fg = this.add.graphics();
    fg.setDepth(ATMO_DEPTH);
    // Bookshelf silhouette
    fg.fillStyle(0x3e2723, 0.6);
    fg.fillRect(20, HUD_HEIGHT + 2, 60, 35);
    fg.fillRect(25, HUD_HEIGHT - 8, 50, 12);
    fg.fillRect(30, HUD_HEIGHT - 16, 40, 10);
    // Dresser silhouette
    fg.fillRect(GRID_COLS * CELL_SIZE - 120, HUD_HEIGHT + 2, 80, 30);
    fg.fillRect(GRID_COLS * CELL_SIZE - 115, HUD_HEIGHT - 5, 70, 10);
    // Drawer lines
    fg.lineStyle(1, 0x2e1b0e, 0.4);
    fg.lineBetween(GRID_COLS * CELL_SIZE - 115, HUD_HEIGHT + 14, GRID_COLS * CELL_SIZE - 45, HUD_HEIGHT + 14);
    fg.lineBetween(GRID_COLS * CELL_SIZE - 115, HUD_HEIGHT + 24, GRID_COLS * CELL_SIZE - 45, HUD_HEIGHT + 24);

    // Decorative toy details on random grid cells (3-5 pieces)
    const toyPositions: { row: number; col: number }[] = [];
    while (toyPositions.length < 4) {
      const r = Math.floor(Math.random() * GRID_ROWS);
      const c = Math.floor(Math.random() * GRID_COLS);
      if (!toyPositions.some(p => p.row === r && p.col === c)) {
        toyPositions.push({ row: r, col: c });
      }
    }
    const tg = this.add.graphics();
    tg.setDepth(ATMO_DEPTH);
    const toyDrawers = [
      // Crayon
      (cx: number, cy: number) => {
        tg.fillStyle(0xe53935, 0.3);
        tg.fillRect(cx - 8, cy + 12, 16, 4);
        tg.fillStyle(0xffcdd2, 0.3);
        tg.fillTriangle(cx + 8, cy + 14, cx + 12, cy + 12, cx + 12, cy + 16);
      },
      // Marble
      (cx: number, cy: number) => {
        tg.fillStyle(0x42a5f5, 0.25);
        tg.fillCircle(cx + 10, cy - 8, 5);
      },
      // Building brick
      (cx: number, cy: number) => {
        tg.fillStyle(0x66bb6a, 0.3);
        tg.fillRect(cx - 14, cy + 8, 10, 6);
      },
      // Small star
      (cx: number, cy: number) => {
        tg.fillStyle(0xffeb3b, 0.25);
        tg.fillCircle(cx - 10, cy - 10, 3);
      },
    ];
    toyPositions.forEach((pos, i) => {
      const cx = pos.col * CELL_SIZE + CELL_SIZE / 2;
      const cy = HUD_HEIGHT + pos.row * CELL_SIZE + CELL_SIZE / 2;
      toyDrawers[i](cx, cy);
    });

    // Floating dust mote particles (15 semi-transparent dots drifting)
    for (let i = 0; i < 15; i++) {
      const mote = this.add.circle(
        Math.random() * GRID_COLS * CELL_SIZE,
        HUD_HEIGHT + Math.random() * GRID_ROWS * CELL_SIZE,
        Math.random() * 1.5 + 1,
        0xffffff,
        Math.random() * 0.15 + 0.05,
      );
      mote.setDepth(ATMO_DEPTH);
      // Slow drift across play area
      this.tweens.add({
        targets: mote,
        x: mote.x + (Math.random() - 0.5) * 200,
        y: mote.y + (Math.random() - 0.5) * 100,
        duration: 8000 + Math.random() * 6000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createHUD(): void {
    this.balanceText = this.add.text(10, 8, '', {
      fontSize: '16px',
      color: '#fbbf24',
      fontFamily: 'monospace',
    });

    this.waveText = this.add.text(10, 30, '', {
      fontSize: '14px',
      color: '#94a3b8',
      fontFamily: 'monospace',
    });

    // Mute toggle
    const muteBtn = this.add.text(GRID_COLS * CELL_SIZE - 10, 8, isSfxMuted() ? 'MUTE' : 'SFX', {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      backgroundColor: '#1e293b',
      padding: { x: 6, y: 3 },
    });
    muteBtn.setOrigin(1, 0);
    muteBtn.setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      setSfxMuted(!isSfxMuted());
      muteBtn.setText(isSfxMuted() ? 'MUTE' : 'SFX');
      muteBtn.setColor(isSfxMuted() ? '#ef4444' : '#94a3b8');
    });

    this.updateHUDText();
  }

  private updateHUDText(): void {
    this.balanceText.setText(`Sparks: ${this.economy.getBalance()}`);
    this.waveText.setText(
      `Wave ${this.waveManager.currentWaveNumber}/${this.waveManager.totalWaves}`,
    );
  }

  private createDefenderPanel(): void {
    const keys = Object.keys(DEFENDER_TYPES);
    const panelStartX = 140;
    const cardWidth = 130;
    const cardHeight = 60;
    const cardGap = 6;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const type = DEFENDER_TYPES[key];
      const x = panelStartX + i * (cardWidth + cardGap);
      const y = 10;

      const card = this.createDefenderCard(x, y, cardWidth, cardHeight, key, type);
      this.panelCards.set(key, card);
    }
  }

  private createDefenderCard(
    x: number,
    y: number,
    width: number,
    height: number,
    key: string,
    type: DefenderType,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x334155, 1);
    bg.fillRoundedRect(0, 0, width, height, 6);
    container.add(bg);

    // Name — centered at top
    const nameText = this.add.text(width / 2, 3, type.name, {
      fontSize: '10px',
      color: '#e2e8f0',
      fontFamily: 'monospace',
    });
    nameText.setOrigin(0.5, 0);
    if (nameText.width > width - 8) {
      nameText.setScale((width - 8) / nameText.width);
    }
    container.add(nameText);

    // Bottom row: sprite (left) + cost (right), side by side
    const bottomY = 36;

    const previewContainer = this.add.container(width / 3, bottomY);
    const previewGfx = this.add.graphics();
    const drawFn = DRAW_DEFENDER[key];
    if (drawFn) {
      drawFn(previewGfx);
    }
    previewContainer.add(previewGfx);
    previewContainer.setScale(0.5);
    container.add(previewContainer);

    const costText = this.add.text(width * 2 / 3, bottomY, `${type.cost}`, {
      fontSize: '14px',
      color: '#ffc107',
      fontFamily: 'monospace',
    });
    costText.setOrigin(0.5, 0.5);
    container.add(costText);

    const zone = this.add.zone(0, 0, width, height).setOrigin(0).setInteractive({ useHandCursor: true });
    container.add(zone);

    zone.on('pointerdown', () => {
      if (this.economy.getBalance() >= type.cost) {
        this.selectDefender(key);
      }
    });

    container.setData('nameText', nameText);
    container.setData('costText', costText);
    container.setData('bg', bg);
    container.setData('key', key);

    return container;
  }

  private selectDefender(key: string): void {
    this.selectedDefenderKey = key;
    this.updatePanelHighlight();
  }

  private updatePanelHighlight(): void {
    for (const [key, card] of this.panelCards) {
      const bg = card.getData('bg') as Phaser.GameObjects.Graphics;
      const type = DEFENDER_TYPES[key];
      const canAfford = this.economy.getBalance() >= type.cost;
      const rechargeRemaining = this.rechargeTimers.get(key) ?? 0;
      const onCooldown = rechargeRemaining > 0;

      bg.clear();
      if (onCooldown) {
        // Cooldown overlay — dark with progress fill
        bg.fillStyle(0x1e293b, 0.8);
        bg.fillRoundedRect(0, 0, 130, 60, 6);
        // Cooldown progress bar at bottom of card
        const rechargeTime = type.rechargeTime ?? 1;
        const progress = 1 - rechargeRemaining / rechargeTime;
        bg.fillStyle(0xffc107, 0.4);
        bg.fillRoundedRect(0, 52, 130 * progress, 8, 3);
      } else if (key === this.selectedDefenderKey) {
        bg.fillStyle(0x475569, 1);
        bg.fillRoundedRect(0, 0, 130, 60, 6);
        bg.lineStyle(3, 0xffc107, 1);
        bg.strokeRoundedRect(0, 0, 130, 60, 6);
      } else if (!canAfford) {
        bg.fillStyle(0x1e293b, 0.6);
        bg.fillRoundedRect(0, 0, 130, 60, 6);
      } else {
        bg.fillStyle(0x334155, 1);
        bg.fillRoundedRect(0, 0, 130, 60, 6);
      }

      const nameText = card.getData('nameText') as Phaser.GameObjects.Text;
      const costText = card.getData('costText') as Phaser.GameObjects.Text;
      const available = canAfford && !onCooldown;
      nameText.setAlpha(available ? 1 : 0.4);
      costText.setAlpha(available ? 1 : 0.4);
    }
  }

  private createGridClickZones(): void {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * CELL_SIZE;
        const y = HUD_HEIGHT + row * CELL_SIZE;

        const zone = this.add.zone(x, y, CELL_SIZE, CELL_SIZE)
          .setOrigin(0)
          .setInteractive({ useHandCursor: true });

        zone.on('pointerdown', () => {
          this.handleGridClick(row, col);
        });

        this.cellZones.push(zone);
      }
    }
  }

  private handleGridClick(row: number, col: number): void {
    if (!this.selectedDefenderKey) return;

    const key = this.selectedDefenderKey;
    const type = DEFENDER_TYPES[key];

    // Check recharge cooldown for single-use types
    if (type.singleUse && (this.rechargeTimers.get(key) ?? 0) > 0) return;

    const result = this.placement.place({ row, col }, type);

    if (result.ok) {
      playSfxPlace();
      const entity = new DefenderEntity(this, row, col, key, type);
      this.defenders.push(entity);

      if (type.behavior === 'bomb') {
        // Bomb detonates immediately on placement
        const hit = bombDetonate(row, col, this.enemies, type.damage);
        for (const enemy of hit) {
          const ent = this.enemies.find(e => e === enemy);
          if (ent) {
            ent.drawHealthBar();
            ent.playHitFlash();
            playSfxHit();
          }
        }
        // Burst animation — expanding circle
        this.spawnBombBurst(entity.x, entity.y);
        // Self-destruct
        this.placement.remove({ row, col });
        entity.destroy();
        this.defenders = this.defenders.filter(d => d !== entity);
      } else if (type.behavior === 'mine') {
        // Mine starts dormant — grey/muted appearance
        entity.setAlpha(0.5);
        entity.setData('mineArmed', false);
        this.mineStates.set(entity, createMineState(MINE_ARM_DELAY));
      }

      // Start recharge cooldown for single-use types
      if (type.singleUse && type.rechargeTime) {
        this.rechargeTimers.set(key, type.rechargeTime);
      }

      this.updateHUDText();
      this.updatePanelHighlight();
    }
  }

  private createAnnouncementText(): void {
    const centerX = (GRID_COLS * CELL_SIZE) / 2;
    const centerY = HUD_HEIGHT + (GRID_ROWS * CELL_SIZE) / 2;

    this.announcementText = this.add.text(centerX, centerY, '', {
      fontSize: '28px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    });
    this.announcementText.setOrigin(0.5);
    this.announcementText.setDepth(100);
    this.announcementText.setVisible(false);
  }

  private createProgressDots(): void {
    const totalWaves = this.waveManager.totalWaves;
    const dotSize = 8;
    const gap = 6;
    const totalWidth = totalWaves * dotSize + (totalWaves - 1) * gap;
    const startX = (GRID_COLS * CELL_SIZE) - totalWidth - 10;
    const y = 56;

    for (let i = 0; i < totalWaves; i++) {
      const dot = this.add.graphics();
      dot.x = startX + i * (dotSize + gap);
      dot.y = y;
      dot.fillStyle(0x5d4037, 1);
      dot.fillCircle(dotSize / 2, dotSize / 2, dotSize / 2);
      dot.lineStyle(1, 0x8d6e63, 1);
      dot.strokeCircle(dotSize / 2, dotSize / 2, dotSize / 2);
      this.progressDots.push(dot);
    }
  }

  private updateProgressDots(): void {
    const currentWave = this.waveManager.currentWaveNumber;
    const dotSize = 8;

    for (let i = 0; i < this.progressDots.length; i++) {
      const dot = this.progressDots[i];
      dot.clear();
      if (i < currentWave - 1) {
        // Completed wave — bright gold
        dot.fillStyle(0xffc107, 1);
        dot.fillCircle(dotSize / 2, dotSize / 2, dotSize / 2);
      } else if (i === currentWave - 1) {
        // Current wave — pulsing white
        dot.fillStyle(0xffffff, 1);
        dot.fillCircle(dotSize / 2, dotSize / 2, dotSize / 2);
      } else {
        // Future wave — dim
        dot.fillStyle(0x5d4037, 1);
        dot.fillCircle(dotSize / 2, dotSize / 2, dotSize / 2);
        dot.lineStyle(1, 0x8d6e63, 1);
        dot.strokeCircle(dotSize / 2, dotSize / 2, dotSize / 2);
      }
    }
  }

  private getWaveAnnouncement(): string {
    const wave = this.waveManager.currentWaveNumber;
    const total = this.waveManager.totalWaves;

    if (wave === total) {
      return 'A HUGE mess is coming!';
    }

    const messages = [
      'Dust bunnies incoming!',
      'Here comes trouble!',
      'More mess approaching!',
    ];
    return messages[(wave - 1) % messages.length];
  }

  private createCountdownBar(): void {
    this.countdownBar = this.add.graphics();
    this.countdownLabel = this.add.text(10, 52, '', {
      fontSize: '10px',
      color: '#8d6e63',
      fontFamily: 'monospace',
    });
  }

  private updateCountdownBar(): void {
    this.countdownBar.clear();
    const state = this.waveManager.waveState;
    const progress = this.waveManager.delayProgress;

    if (state === 'setup' || state === 'waiting') {
      const barX = 10;
      const barY = 64;
      const barWidth = 115;
      const barHeight = 6;

      // Track background (visible full width)
      this.countdownBar.fillStyle(0x1a1a1a, 0.6);
      this.countdownBar.fillRoundedRect(barX, barY, barWidth, barHeight, 2);
      this.countdownBar.lineStyle(1, 0x8d6e63, 0.5);
      this.countdownBar.strokeRoundedRect(barX, barY, barWidth, barHeight, 2);
      // Fill (progress)
      if (progress > 0.01) {
        this.countdownBar.fillStyle(0xffc107, 0.8);
        this.countdownBar.fillRoundedRect(barX, barY, barWidth * progress, barHeight, 2);
      }

      const label = state === 'setup' ? 'Get ready...' : 'Next wave...';
      this.countdownLabel.setText(label);
      this.countdownLabel.setVisible(true);
    } else {
      this.countdownLabel.setVisible(false);
    }
  }

  private updateAnnouncement(): void {
    const state = this.waveManager.waveState;

    if (state === 'announcing' && this.lastWaveState !== 'announcing') {
      this.announcementText.setText(this.getWaveAnnouncement());
      this.announcementText.setVisible(true);
      playSfxAnnounce();
      // Camera shake on final wave
      if (this.waveManager.currentWaveNumber === this.waveManager.totalWaves) {
        this.cameras.main.shake(400, 0.003);
      }
    } else if (state !== 'announcing' && this.lastWaveState === 'announcing') {
      this.announcementText.setVisible(false);
    }

    this.lastWaveState = state;
  }

  private spawnSpark(): void {
    const x = Math.random() * (GRID_COLS * CELL_SIZE - 40) + 20;
    const y = HUD_HEIGHT - 10; // just above the grid

    const spark = this.add.container(x, y);
    spark.setDepth(10);

    // Draw spark shape — diamond/star glow (distinct from yellow circle projectiles)
    const gfx = this.add.graphics();
    // Outer glow
    gfx.fillStyle(0x81d4fa, 0.4);
    gfx.fillCircle(0, 0, 12);
    // Inner diamond
    gfx.fillStyle(0x4fc3f7, 0.9);
    gfx.beginPath();
    gfx.moveTo(0, -8);
    gfx.lineTo(6, 0);
    gfx.lineTo(0, 8);
    gfx.lineTo(-6, 0);
    gfx.closePath();
    gfx.fillPath();
    // Center bright spot
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(0, 0, 3);
    spark.add(gfx);

    // Clickable zone
    const zone = this.add.zone(0, 0, 24, 24).setInteractive({ useHandCursor: true });
    spark.add(zone);

    zone.on('pointerdown', () => {
      this.collectSpark(spark);
    });

    this.sparks.push(spark);
  }

  private collectSpark(spark: Phaser.GameObjects.Container): void {
    this.economy.addIncome(SPARK_VALUE);
    playSfxCollect();
    this.updateHUDText();

    // Collection animation — burst outward and fade
    const x = spark.x;
    const y = spark.y;
    spark.destroy();
    this.sparks = this.sparks.filter(s => s !== spark);

    // Particle burst effect
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dot = this.add.circle(x, y, 2, 0x4fc3f7, 0.8);
      dot.setDepth(50);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * 25,
        y: y + Math.sin(angle) * 25,
        alpha: 0,
        duration: 250,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  private updateSparks(dt: number): void {
    const gridBottom = HUD_HEIGHT + GRID_ROWS * CELL_SIZE;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];
      spark.y += SPARK_FALL_SPEED * dt;
      // Remove uncollected sparks past grid bottom
      if (spark.y > gridBottom) {
        spark.destroy();
        this.sparks.splice(i, 1);
      }
    }
  }

  private spawnBombBurst(x: number, y: number): void {
    // Expanding red-orange burst
    const burst = this.add.circle(x, y, 10, 0xf44336, 0.9);
    burst.setDepth(50);
    this.tweens.add({
      targets: burst,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => burst.destroy(),
    });
    // Secondary flash ring
    const ring = this.add.circle(x, y, 8, 0xffeb3b, 0.7);
    ring.setDepth(51);
    this.tweens.add({
      targets: ring,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  private spawnDeathParticles(x: number, y: number, color: number): void {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const particle = this.add.circle(x, y, 3, color, 1);
      particle.setDepth(50);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private spawnDestructionEffect(x: number, y: number): void {
    const ghost = this.add.circle(x, y, 16, 0x888888, 0.6);
    ghost.setDepth(50);
    this.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 350,
      ease: 'Quad.easeIn',
      onComplete: () => ghost.destroy(),
    });
  }

  private spawnImpactBurst(x: number, y: number): void {
    const burst = this.add.circle(x, y, 4, 0xffffff, 0.8);
    burst.setDepth(50);
    this.tweens.add({
      targets: burst,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => burst.destroy(),
    });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // Wave spawning
    const spawns = this.waveManager.update(dt);
    for (const spawn of spawns) {
      const spawnCol = GRID_COLS; // right edge
      const enemyKey = Object.entries(ENEMY_TYPES).find(([, v]) => v === spawn.type)?.[0] ?? 'basic';
      const enemy = new EnemyEntity(this, spawn.lane, spawnCol, enemyKey, spawn.type);
      this.enemies.push(enemy);
    }

    // Enemy movement
    for (const enemy of this.enemies) {
      if (isDead(enemy)) continue;

      // Check defender blocking — enemies attack any defender they reach
      // Mines don't block movement — enemies walk through them
      let blocked = false;
      for (const def of this.defenders) {
        if (!isDead(def) && def.defenderType.behavior !== 'mine') {
          if (wallBlocks(def, enemy, dt)) {
            blocked = true;
            def.drawHealthBar();
            break;
          }
        }
      }

      if (!blocked) {
        enemy.col -= enemy.enemyType.speed * dt;
      }
      enemy.updatePosition();
    }

    // Mine arm timer + trigger check
    for (const [def, mineState] of this.mineStates) {
      if (isDead(def)) continue;
      updateMineState(mineState, delta);
      // Update visual state: dormant → armed
      if (mineState.armed && !def.getData('mineArmed')) {
        def.setData('mineArmed', true);
        def.setAlpha(1);
        // Pulse tween for armed state
        this.tweens.add({
          targets: def,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 600,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      }
      if (mineState.armed) {
        const target = mineTriggerCheck(def.gridRow, def.gridCol, this.enemies);
        if (target) {
          applyDamage(target, def.defenderType.damage);
          const ent = this.enemies.find(e => e === target);
          if (ent) {
            ent.drawHealthBar();
            ent.playHitFlash();
          }
          playSfxHit();
          // Mine self-destructs
          this.spawnDestructionEffect(def.x, def.y);
          this.placement.remove({ row: def.gridRow, col: def.gridCol });
          this.mineStates.delete(def);
          def.destroy();
          this.defenders = this.defenders.filter(d => d !== def);
        }
      }
    }

    // Recharge timer countdown
    for (const [key, remaining] of this.rechargeTimers) {
      const updated = remaining - delta;
      if (updated <= 0) {
        this.rechargeTimers.delete(key);
      } else {
        this.rechargeTimers.set(key, updated);
      }
    }

    // Shooter cooldowns and firing
    for (const def of this.defenders) {
      if (def.defenderKey !== 'shooter' || isDead(def)) continue;

      const shooter: ShooterState = {
        health: def.health,
        lane: def.gridRow,
        col: def.gridCol,
        damage: def.defenderType.damage,
        range: def.defenderType.range,
        fireRate: def.defenderType.fireRate,
        fireCooldown: (def.getData('fireCooldown') as number) ?? 0,
      };

      updateShooterCooldown(shooter, dt);

      const laneEnemies = this.enemies.filter(
        (e) => e.lane === def.gridRow && !isDead(e),
      );
      const proj = tryFire(shooter, laneEnemies);

      def.setData('fireCooldown', shooter.fireCooldown);

      if (proj) {
        def.playRecoil();
        playSfxFire();
        const projEntity = new ProjectileEntity(this, proj.lane, proj.x, proj.damage, proj.speed);
        this.projectiles.push(projEntity);
      }
    }

    // Move projectiles and check hits
    for (const proj of this.projectiles) {
      const projState: ProjectileState = {
        lane: proj.lane,
        x: proj.col,
        damage: proj.damage,
        speed: proj.speed,
      };

      moveProjectile(projState, dt);
      proj.col = projState.x;
      proj.updatePosition();

      // Check hits
      for (const enemy of this.enemies) {
        if (isDead(enemy)) continue;
        if (checkProjectileHit(projState, enemy)) {
          applyDamage(enemy, proj.damage);
          enemy.drawHealthBar();
          enemy.playHitFlash();
          playSfxHit();
          this.spawnImpactBurst(proj.x, proj.y);
          proj.destroy();
          break;
        }
      }
    }

    // Remove dead enemies (with death particles)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (isDead(this.enemies[i])) {
        const e = this.enemies[i];
        const deathColor = e.enemyKey === 'basic' ? 0xf48fb1 : 0xb388ff;
        this.spawnDeathParticles(e.x, e.y, deathColor);
        playSfxDeath(e.enemyKey);
        e.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // Remove dead defenders (with destruction effect)
    for (let i = this.defenders.length - 1; i >= 0; i--) {
      if (isDead(this.defenders[i])) {
        const d = this.defenders[i];
        this.spawnDestructionEffect(d.x, d.y);
        this.placement.remove({ row: d.gridRow, col: d.gridCol });
        this.mineStates.delete(d); // cleanup if mine
        d.destroy();
        this.defenders.splice(i, 1);
      }
    }

    // Remove off-screen or destroyed projectiles
    this.projectiles = this.projectiles.filter((p) => {
      if (p.col > GRID_COLS + 1 || !p.active) {
        if (p.active) p.destroy();
        return false;
      }
      return true;
    });

    // Game flow check
    const flowEnemies = this.enemies.map((e) => ({ x: e.col, health: e.health }));
    this.gameFlow.update(flowEnemies, this.waveManager.isComplete);

    const state = this.gameFlow.getState();
    if (state !== 'playing' && !this.transitioning) {
      this.transitioning = true;
      const won = state === 'won';
      this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene', { won });
      });
      return;
    }

    this.updateSparks(dt);
    this.updateHUDText();
    this.updatePanelHighlight();
    this.updateAnnouncement();
    this.updateProgressDots();
    this.updateCountdownBar();
  }

}
