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
import { mineTriggerCheck, MineState, createMineState, updateMineState } from '../systems/SingleUse';
import { HoneyPot, createHoneyPot, updateHoneyPots, getSpeedModifier, HONEY_TOSS_INTERVAL, HONEY_TOSS_RANGE, HONEY_POT_DURATION } from '../systems/HoneyTrap';
import { EnemyEntity } from '../entities/EnemyEntity';
import { ProjectileEntity } from '../entities/ProjectileEntity';
import { attemptJump } from '../systems/EnemyMovement';
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

const DEFAULT_STARTING_BALANCE = 500;
const SPARK_SPAWN_INTERVAL = 12000; // ms between spark spawns
const SPARK_VALUE = 50; // sparks balance added per collection
const SPARK_FALL_SPEED = 30; // pixels per second
const GENERATOR_INCOME_INTERVAL = 8000; // ms between generator spark spawns
const GENERATOR_SPARK_EXPIRY = 5000; // ms before uncollected generator sparks despawn
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
  private honeyPots: HoneyPot[] = [];
  private honeyPotSprites: Map<HoneyPot, Phaser.GameObjects.Graphics> = new Map();
  private generatorTimers: Map<DefenderEntity, number> = new Map(); // ms until next spark
  private trapperTimers: Map<DefenderEntity, number> = new Map(); // ms since last toss
  private rechargeTimers: Map<string, number> = new Map(); // defenderKey → remaining ms
  private currentLevelIndex: number = 0;
  private activeLoadout: string[] = [];
  private activeLanes: number[] = [];
  private transitioning = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { levelConfig?: import('../systems/WaveManager').LevelConfig; levelIndex?: number; loadout?: string[] }): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);
    this.transitioning = false;
    this.currentLevelIndex = data?.levelIndex ?? 0;
    this.activeLoadout = data?.loadout ?? Object.keys(DEFENDER_TYPES);

    // Initialize systems
    const levelConfig = data?.levelConfig ?? LEVEL_1;
    this.activeLanes = levelConfig.activeLanes ?? Array.from({ length: GRID_ROWS }, (_, i) => i);
    this.grid = new Grid(GRID_ROWS, GRID_COLS);
    this.economy = new Economy(levelConfig.startingBalance ?? DEFAULT_STARTING_BALANCE);
    this.placement = new Placement(this.grid, this.economy);
    this.waveManager = new WaveManager(levelConfig);
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

  }

  private randomGeneratorDelay(): number {
    // Randomize ±30% around GENERATOR_INCOME_INTERVAL
    const jitter = GENERATOR_INCOME_INTERVAL * 0.3;
    return GENERATOR_INCOME_INTERVAL + (Math.random() - 0.5) * 2 * jitter;
  }

  private spawnGeneratorSpark(defX: number, defY: number): void {
    // Slight random offset so sparks don't stack exactly
    const x = defX + (Math.random() - 0.5) * 20;
    const y = defY - 15;

    const spark = this.add.container(x, y);
    spark.setDepth(10);

    // Same multi-layer diamond shape as floating sparks
    const gfx = this.add.graphics();
    gfx.fillStyle(0x81d4fa, 0.3);
    gfx.fillCircle(0, 0, 22);
    gfx.fillStyle(0x4fc3f7, 0.4);
    gfx.fillCircle(0, 0, 16);
    gfx.fillStyle(0x4fc3f7, 0.9);
    gfx.beginPath();
    gfx.moveTo(0, -16);
    gfx.lineTo(12, 0);
    gfx.lineTo(0, 16);
    gfx.lineTo(-12, 0);
    gfx.closePath();
    gfx.fillPath();
    gfx.fillStyle(0xb3e5fc, 0.6);
    gfx.beginPath();
    gfx.moveTo(0, -12);
    gfx.lineTo(4, 0);
    gfx.lineTo(0, 12);
    gfx.lineTo(-4, 0);
    gfx.closePath();
    gfx.fillPath();
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(0, 0, 5);
    spark.add(gfx);

    const zone = this.add.zone(0, 0, 48, 48).setInteractive({ useHandCursor: true });
    spark.add(zone);

    zone.on('pointerdown', () => {
      this.collectSpark(spark);
    });

    // Mark as generator spark so updateSparks skips downward movement
    spark.setData('generatorSpark', true);
    this.sparks.push(spark);

    // Oscillate in place (gentle bob)
    this.tweens.add({
      targets: spark,
      y: y - 8,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Auto-expire after GENERATOR_SPARK_EXPIRY
    this.time.delayedCall(GENERATOR_SPARK_EXPIRY, () => {
      if (spark.active) {
        spark.destroy();
        this.sparks = this.sparks.filter(s => s !== spark);
      }
    });
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * CELL_SIZE;
        const y = HUD_HEIGHT + row * CELL_SIZE;
        const isActive = this.activeLanes.includes(row);

        const shade = (row + col) % 2 === 0 ? 0xc4a882 : 0xb0956e;
        graphics.fillStyle(shade, isActive ? 1 : 0.25);
        graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        graphics.lineStyle(1, 0x8b7355, isActive ? 0.3 : 0.1);
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

    // Decorative toy details on random active lane cells (3-5 pieces)
    const toyPositions: { row: number; col: number }[] = [];
    const maxToys = Math.min(4, this.activeLanes.length * GRID_COLS);
    while (toyPositions.length < maxToys) {
      const r = this.activeLanes[Math.floor(Math.random() * this.activeLanes.length)];
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

  private cardWidth = 130;
  private cardHeight = 60;

  private createDefenderPanel(): void {
    const keys = this.activeLoadout;
    const panelStartX = 140;
    const muteButtonSpace = 50;
    const availableWidth = GRID_COLS * CELL_SIZE - panelStartX - muteButtonSpace;
    const cardGap = 6;
    // Dynamic card width: shrink to fit when many cards
    this.cardWidth = Math.min(130, Math.floor((availableWidth - (keys.length - 1) * cardGap) / keys.length));
    this.cardHeight = 60;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const type = DEFENDER_TYPES[key];
      const x = panelStartX + i * (this.cardWidth + cardGap);
      const y = 10;

      const card = this.createDefenderCard(x, y, this.cardWidth, this.cardHeight, key, type);
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

      const cw = this.cardWidth;
      const ch = this.cardHeight;
      bg.clear();
      if (onCooldown) {
        bg.fillStyle(0x1e293b, 0.8);
        bg.fillRoundedRect(0, 0, cw, ch, 6);
        const rechargeTime = type.rechargeTime ?? 1;
        const progress = 1 - rechargeRemaining / rechargeTime;
        bg.fillStyle(0xffc107, 0.4);
        bg.fillRoundedRect(0, ch - 8, cw * progress, 8, 3);
      } else if (key === this.selectedDefenderKey) {
        bg.fillStyle(0x475569, 1);
        bg.fillRoundedRect(0, 0, cw, ch, 6);
        bg.lineStyle(3, 0xffc107, 1);
        bg.strokeRoundedRect(0, 0, cw, ch, 6);
      } else if (!canAfford) {
        bg.fillStyle(0x1e293b, 0.6);
        bg.fillRoundedRect(0, 0, cw, ch, 6);
      } else {
        bg.fillStyle(0x334155, 1);
        bg.fillRoundedRect(0, 0, cw, ch, 6);
      }

      const nameText = card.getData('nameText') as Phaser.GameObjects.Text;
      const costText = card.getData('costText') as Phaser.GameObjects.Text;
      const available = canAfford && !onCooldown;
      nameText.setAlpha(available ? 1 : 0.4);
      costText.setAlpha(available ? 1 : 0.4);
    }
  }

  private createGridClickZones(): void {
    for (const row of this.activeLanes) {
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

      if (type.behavior === 'trapper') {
        // Honey Bear — register for periodic honey pot tossing
        this.trapperTimers.set(entity, 0);
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

    // Draw spark shape — multi-layer diamond/star glow (distinct from ambient dust motes and projectile impacts)
    const gfx = this.add.graphics();
    // Outer glow
    gfx.fillStyle(0x81d4fa, 0.3);
    gfx.fillCircle(0, 0, 22);
    // Mid glow ring
    gfx.fillStyle(0x4fc3f7, 0.4);
    gfx.fillCircle(0, 0, 16);
    // Inner diamond
    gfx.fillStyle(0x4fc3f7, 0.9);
    gfx.beginPath();
    gfx.moveTo(0, -16);
    gfx.lineTo(12, 0);
    gfx.lineTo(0, 16);
    gfx.lineTo(-12, 0);
    gfx.closePath();
    gfx.fillPath();
    // Star cross overlay
    gfx.fillStyle(0xb3e5fc, 0.6);
    gfx.beginPath();
    gfx.moveTo(0, -12);
    gfx.lineTo(4, 0);
    gfx.lineTo(0, 12);
    gfx.lineTo(-4, 0);
    gfx.closePath();
    gfx.fillPath();
    // Center bright spot
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(0, 0, 5);
    spark.add(gfx);

    // Clickable zone — large target for easy collection
    const zone = this.add.zone(0, 0, 48, 48).setInteractive({ useHandCursor: true });
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
      // Generator sparks oscillate in place (handled by tween) — skip downward movement
      if (spark.getData('generatorSpark')) continue;
      spark.y += SPARK_FALL_SPEED * dt;
      // Remove uncollected sparks past grid bottom
      if (spark.y > gridBottom) {
        spark.destroy();
        this.sparks.splice(i, 1);
      }
    }
  }

  private spawnHoneyPotSprite(pot: HoneyPot): void {
    const x = pot.col * CELL_SIZE + CELL_SIZE / 2;
    const y = HUD_HEIGHT + pot.row * CELL_SIZE + CELL_SIZE / 2;
    const gfx = this.add.graphics();
    gfx.setDepth(5);
    // Amber/golden puddle — reads as sticky slow zone
    gfx.fillStyle(0xffb300, 0.6);
    gfx.fillEllipse(x, y, CELL_SIZE * 0.7, CELL_SIZE * 0.4);
    gfx.fillStyle(0xffd54f, 0.4);
    gfx.fillEllipse(x, y, CELL_SIZE * 0.5, CELL_SIZE * 0.25);
    // Shine highlight
    gfx.fillStyle(0xfff8e1, 0.5);
    gfx.fillCircle(x - 5, y - 3, 4);
    this.honeyPotSprites.set(pot, gfx);
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

    // Wave spawning — only spawn enemies in active lanes
    const spawns = this.waveManager.update(dt);
    for (const spawn of spawns) {
      if (!this.activeLanes.includes(spawn.lane)) continue;
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
      let blockingDef: DefenderEntity | null = null;
      for (const def of this.defenders) {
        if (!isDead(def) && def.defenderType.behavior !== 'mine') {
          if (wallBlocks(def, enemy, dt)) {
            blocked = true;
            blockingDef = def;
            def.drawHealthBar();
            break;
          }
        }
      }

      // Sock Puppet jump: if blocked and has jumps remaining, jump over
      if (blocked && blockingDef && enemy.jumpsRemaining > 0) {
        const result = attemptJump(enemy.col, blockingDef.gridCol, enemy.jumpsRemaining);
        if (result.jumped) {
          enemy.col = result.newCol;
          enemy.jumpsRemaining = result.newJumps;
          enemy.playJumpArc();
          blocked = false;
        }
      }

      if (!blocked) {
        const enemyRow = enemy.lane;
        const enemyCol = Math.round(enemy.col);
        const speedMod = getSpeedModifier(this.honeyPots, enemyRow, enemyCol);
        enemy.col -= enemy.enemyType.speed * speedMod * dt;
      }
      enemy.updatePosition();
    }

    // Generator spark spawning — per-defender randomized timers
    for (const def of this.defenders) {
      if (isDead(def) || def.defenderType.behavior !== 'generator') continue;
      if (!this.generatorTimers.has(def)) {
        this.generatorTimers.set(def, this.randomGeneratorDelay());
      }
      const remaining = (this.generatorTimers.get(def) ?? 0) - delta;
      if (remaining <= 0) {
        def.playProduce();
        this.spawnGeneratorSpark(def.x, def.y);
        this.generatorTimers.set(def, this.randomGeneratorDelay());
      } else {
        this.generatorTimers.set(def, remaining);
      }
    }

    // Honey Bear trapper — toss honey pots
    for (const def of this.defenders) {
      if (isDead(def) || def.defenderType.behavior !== 'trapper') continue;
      const elapsed = (this.trapperTimers.get(def) ?? 0) + delta;
      if (elapsed >= HONEY_TOSS_INTERVAL) {
        this.trapperTimers.set(def, 0);
        // Toss honey pot to a random cell ahead in the same lane
        const targetCol = def.gridCol + 1 + Math.floor(Math.random() * Math.min(HONEY_TOSS_RANGE, GRID_COLS - def.gridCol - 1));
        if (targetCol < GRID_COLS) {
          const pot = createHoneyPot(def.gridRow, targetCol, HONEY_POT_DURATION);
          this.honeyPots.push(pot);
          this.spawnHoneyPotSprite(pot);
        }
      } else {
        this.trapperTimers.set(def, elapsed);
      }
    }

    // Update honey pots — expire old ones
    const prevPots = new Set(this.honeyPots);
    this.honeyPots = updateHoneyPots(this.honeyPots, delta);
    for (const pot of prevPots) {
      if (!this.honeyPots.includes(pot)) {
        const sprite = this.honeyPotSprites.get(pot);
        if (sprite) {
          sprite.destroy();
          this.honeyPotSprites.delete(pot);
        }
      }
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
            ent.updateHelmet();
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
          enemy.updateHelmet();
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
        const deathColors: Record<string, number> = {
          basic: 0xf48fb1, tough: 0xb388ff, armored: 0xf48fb1, jumper: 0xff8a65,
        };
        const deathColor = deathColors[e.enemyKey] ?? 0xffffff;
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
        this.trapperTimers.delete(d); // cleanup if trapper
        this.generatorTimers.delete(d); // cleanup if generator
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
        this.scene.start('GameOverScene', { won, levelIndex: this.currentLevelIndex });
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
