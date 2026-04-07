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
  applyAOEDamage,
  getAOETargetRows,
  isDead,
  wallBlocks,
  applyKnockback,
  HONEY_BEAR_PROJECTILE_SPEED,
} from '../systems/Combat';
import { DefenderEntity, DRAW_DEFENDER } from '../entities/DefenderEntity';
import { mineTriggerCheck, MineState, createMineState, updateMineState, bombDetonate, MINE_BOSS_DAMAGE, MINE_HEAVY_DAMAGE } from '../systems/SingleUse';
import { HoneyPot, createHoneyPot, updateHoneyPots, getSpeedModifier, HONEY_POT_DURATION } from '../systems/HoneyTrap';
import { EnemyEntity } from '../entities/EnemyEntity';
import { ProjectileEntity } from '../entities/ProjectileEntity';
import { attemptJump } from '../systems/EnemyMovement';
import { Tutorial, TutorialStep } from '../systems/Tutorial';
import {
  playSfxPlace,
  playSfxFire,
  playSfxHit,
  playSfxDeath,
  playSfxAnnounce,
  playSfxCollect,
  playSfxReject,
  setSfxMuted,
  isSfxMuted,
} from '../systems/SFX';

const DEFAULT_STARTING_BALANCE = 50;
const SPARK_SPAWN_INTERVAL = 12000; // ms between spark spawns
const SPARK_VALUE = 25; // sparks balance added per collection
const SPARK_FALL_SPEED = 30; // pixels per second
const GENERATOR_INCOME_INTERVAL = 10000; // ms between generator spark spawns
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
  private honeyPotGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map(); // "row,col" → visual
  private generatorTimers: Map<DefenderEntity, number> = new Map(); // ms until next spark
  private rechargeTimers: Map<string, number> = new Map(); // defenderKey → remaining ms
  private currentLevelIndex: number = 0;
  private activeLoadout: string[] = [];
  private activeLanes: number[] = [];
  private tutorial: Tutorial | null = null;
  private tutorialBubble: Phaser.GameObjects.Container | null = null;
  private tutorialPointer: Phaser.GameObjects.Graphics | null = null;
  private tutorialHighlight: Phaser.Tweens.Tween | null = null;
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

    // Spark spawner (replaces passive income timer) — suppressed during tutorial
    this.time.addEvent({
      delay: SPARK_SPAWN_INTERVAL,
      callback: () => {
        if (this.tutorial && !this.tutorial.isComplete) return;
        this.spawnSpark();
      },
      loop: true,
    });

    // Tutorial setup
    this.tutorial = null;
    this.tutorialBubble = null;
    this.tutorialPointer = null;
    if (levelConfig.tutorialMode && !Tutorial.hasCompleted()) {
      this.tutorial = new Tutorial();
      this.initTutorialStep();
    }

  }

  // --- Tutorial dream bubble methods ---

  private initTutorialStep(): void {
    this.destroyTutorialBubble();
    if (!this.tutorial || this.tutorial.isComplete) return;
    this.applyTutorialGating();
    this.showDreamBubble();
  }

  private applyTutorialGating(): void {
    if (!this.tutorial) return;
    const step = this.tutorial.step;

    if (step === 'PLACE_GENERATOR') {
      // Only generator panel card is interactive; disable other panel cards
      for (const [key, card] of this.panelCards) {
        const zone = card.list.find((c): c is Phaser.GameObjects.Zone => c instanceof Phaser.GameObjects.Zone);
        if (zone) {
          if (key === 'generator') zone.setInteractive({ useHandCursor: true });
          else zone.disableInteractive();
        }
      }
      // Grid zones stay active — player needs to click a cell after selecting generator
    } else if (step === 'COLLECT_SPARK') {
      // Disable panel cards and grid zones — only sparks are interactive
      for (const [, card] of this.panelCards) {
        const zone = card.list.find((c): c is Phaser.GameObjects.Zone => c instanceof Phaser.GameObjects.Zone);
        if (zone) zone.disableInteractive();
      }
      for (const zone of this.cellZones) {
        zone.disableInteractive();
      }
      // Spawn a spark immediately (not on timer) — guard against duplicate calls
      if (this.sparks.length === 0) {
        this.spawnSpark();
      }
    } else if (step === 'PLACE_PISTOL') {
      // Enable pistol card and grid zones
      for (const [key, card] of this.panelCards) {
        const zone = card.list.find((c): c is Phaser.GameObjects.Zone => c instanceof Phaser.GameObjects.Zone);
        if (zone) {
          if (key === 'shooter') zone.setInteractive({ useHandCursor: true });
          else zone.disableInteractive();
        }
      }
      for (const zone of this.cellZones) {
        zone.setInteractive({ useHandCursor: true });
      }
    }
  }

  private completeTutorial(): void {
    this.destroyTutorialBubble();
    Tutorial.markComplete();
    this.tutorial = null;

    // Re-enable all interactive zones
    for (const [, card] of this.panelCards) {
      const zone = card.list.find((c): c is Phaser.GameObjects.Zone => c instanceof Phaser.GameObjects.Zone);
      if (zone) zone.setInteractive({ useHandCursor: true });
    }
    for (const zone of this.cellZones) {
      zone.setInteractive({ useHandCursor: true });
    }
  }

  private showDreamBubble(): void {
    if (!this.tutorial) return;
    const step = this.tutorial.step;

    const messages: Record<TutorialStep, string> = {
      PLACE_GENERATOR: 'Place it on the carpet!',
      COLLECT_SPARK: 'Tap the spark!',
      PLACE_PISTOL: 'Place it on the carpet!',
      COMPLETE: '',
    };
    const text = messages[step];
    if (!text) return;

    // Bubble position: centered horizontally, below HUD
    const bubbleX = (GRID_COLS * CELL_SIZE) / 2;
    const bubbleY = 125;

    const bubble = this.add.container(bubbleX, bubbleY);
    bubble.setDepth(105);

    // Thought-cloud shape: wider to fit icon + text
    const bubbleW = 200;
    const bubbleH = 64;
    const gfx = this.add.graphics();
    gfx.fillStyle(0xfffde7, 1);
    gfx.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 20);
    gfx.lineStyle(2, 0xbcaaa4, 0.6);
    gfx.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 20);
    // Trailing thought circles at bottom-right
    gfx.fillStyle(0xfffde7, 1);
    gfx.fillCircle(bubbleW / 2 - 15, bubbleH / 2 + 7, 8);
    gfx.strokeCircle(bubbleW / 2 - 15, bubbleH / 2 + 7, 8);
    gfx.fillCircle(bubbleW / 2 + 2, bubbleH / 2 + 18, 5);
    gfx.strokeCircle(bubbleW / 2 + 2, bubbleH / 2 + 18, 5);
    gfx.fillCircle(bubbleW / 2 + 12, bubbleH / 2 + 26, 3);
    gfx.strokeCircle(bubbleW / 2 + 12, bubbleH / 2 + 26, 3);
    bubble.add(gfx);

    // Icon inside bubble (left side)
    const iconContainer = this.add.container(-bubbleW / 2 + 35, 0);
    const iconGfx = this.add.graphics();
    if (step === 'PLACE_GENERATOR') {
      const drawFn = DRAW_DEFENDER['generator'];
      if (drawFn) drawFn(iconGfx);
    } else if (step === 'COLLECT_SPARK') {
      // Small spark diamond
      iconGfx.fillStyle(0x4fc3f7, 0.9);
      iconGfx.beginPath();
      iconGfx.moveTo(0, -10);
      iconGfx.lineTo(8, 0);
      iconGfx.lineTo(0, 10);
      iconGfx.lineTo(-8, 0);
      iconGfx.closePath();
      iconGfx.fillPath();
      iconGfx.fillStyle(0xffffff, 0.9);
      iconGfx.fillCircle(0, 0, 3);
    } else if (step === 'PLACE_PISTOL') {
      const drawFn = DRAW_DEFENDER['shooter'];
      if (drawFn) drawFn(iconGfx);
    }
    iconContainer.add(iconGfx);
    iconContainer.setScale(0.8);
    bubble.add(iconContainer);

    // Text to the right of icon
    const bubbleText = this.add.text(15, 0, text, {
      fontSize: '14px',
      color: '#3e2723',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: bubbleW - 80 },
    }).setOrigin(0.5);
    bubble.add(bubbleText);

    this.tutorialBubble = bubble;

    // Pulsing scale on the target panel card — reuses the same scale as selection emphasis
    this.destroyTutorialHighlight();
    const highlightKey = step === 'PLACE_GENERATOR' ? 'generator' : step === 'PLACE_PISTOL' ? 'shooter' : null;
    if (highlightKey) {
      const card = this.panelCards.get(highlightKey);
      if (card) {
        this.tutorialHighlight = this.tweens.add({
          targets: card,
          scaleX: { from: 1.0, to: 1.08 },
          scaleY: { from: 1.0, to: 1.08 },
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }

    // Animated pointer arrow (no pointer for card steps — highlight is enough)
    const pointer = this.add.graphics();
    pointer.setDepth(106);

    if (step === 'COLLECT_SPARK') {
      // Point toward center of grid (spark spawn area)
      const targetX = (GRID_COLS * CELL_SIZE) / 2;
      const targetY = HUD_HEIGHT + 20;
      this.drawPointerArrow(pointer, targetX, targetY);
      this.tweens.add({
        targets: pointer,
        y: pointer.y + 6,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.tutorialPointer = pointer;
  }

  private drawPointerArrow(gfx: Phaser.GameObjects.Graphics, x: number, y: number): void {
    gfx.fillStyle(0xffc107, 0.9);
    gfx.beginPath();
    gfx.moveTo(x, y);
    gfx.lineTo(x - 8, y - 16);
    gfx.lineTo(x + 8, y - 16);
    gfx.closePath();
    gfx.fillPath();
  }

  private destroyTutorialHighlight(): void {
    if (this.tutorialHighlight) {
      // Reset scale on the card the tween was targeting
      const targets = this.tutorialHighlight.targets;
      if (targets?.length) {
        (targets[0] as Phaser.GameObjects.Container).setScale(1.0);
      }
      this.tutorialHighlight.destroy();
      this.tutorialHighlight = null;
    }
  }

  private destroyTutorialBubble(): void {
    if (this.tutorialBubble) {
      this.tutorialBubble.destroy();
      this.tutorialBubble = null;
    }
    if (this.tutorialPointer) {
      this.tutorialPointer.destroy();
      this.tutorialPointer = null;
    }
    this.destroyTutorialHighlight();
  }

  // --- End tutorial methods ---

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
    const maxCards = 6;
    const cardGap = 6;
    // Fixed card width: sized to fit max 6 cards so layout is stable regardless of loadout size
    this.cardWidth = Math.floor((availableWidth - (maxCards - 1) * cardGap) / maxCards);
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

  private selectionPulseTween: Phaser.Tweens.Tween | null = null;

  private updatePanelHighlight(): void {
    // Stop any existing selection pulse
    if (this.selectionPulseTween) {
      const prevTargets = this.selectionPulseTween.targets;
      if (prevTargets?.length) {
        (prevTargets[0] as Phaser.GameObjects.Container).setScale(1.0);
      }
      this.selectionPulseTween.destroy();
      this.selectionPulseTween = null;
    }

    for (const [key, card] of this.panelCards) {
      const bg = card.getData('bg') as Phaser.GameObjects.Graphics;
      const type = DEFENDER_TYPES[key];
      const canAfford = this.economy.getBalance() >= type.cost;
      const rechargeRemaining = this.rechargeTimers.get(key) ?? 0;
      const onCooldown = rechargeRemaining > 0;
      const isSelected = key === this.selectedDefenderKey;

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
      } else if (isSelected) {
        bg.fillStyle(0x475569, 1);
        bg.fillRoundedRect(0, 0, cw, ch, 6);
        bg.lineStyle(3, 0xffc107, 1);
        bg.strokeRoundedRect(0, 0, cw, ch, 6);
        // Red diagonal strikethrough when selected but can't afford
        if (!canAfford) {
          bg.lineStyle(3, 0xef4444, 0.8);
          bg.lineBetween(4, 4, cw - 4, ch - 4);
        }
      } else if (!canAfford) {
        bg.fillStyle(0x1e293b, 0.6);
        bg.fillRoundedRect(0, 0, cw, ch, 6);
      } else {
        bg.fillStyle(0x334155, 1);
        bg.fillRoundedRect(0, 0, cw, ch, 6);
      }

      // Reset scale for non-selected cards
      card.setScale(1.0);

      // Pulsing scale on selected card (same animation as tutorial highlight)
      if (isSelected) {
        this.selectionPulseTween = this.tweens.add({
          targets: card,
          scaleX: { from: 1.0, to: 1.08 },
          scaleY: { from: 1.0, to: 1.08 },
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
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

    if (!result.ok) {
      if (result.reason === 'insufficient_funds') {
        playSfxReject();
        // Screen shake + red flash on balance text
        this.cameras.main.shake(200, 0.008);
        const origColor = this.balanceText.style.color;
        this.balanceText.setColor('#ef4444');
        this.tweens.add({
          targets: this.balanceText,
          scaleX: 1.4,
          scaleY: 1.4,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.balanceText.setColor(origColor as string);
          },
        });
        // Refresh panel to show red diagonal on selected card
        this.updatePanelHighlight();
      }
      return;
    }

    {
      playSfxPlace();
      const entity = new DefenderEntity(this, row, col, key, type);
      this.defenders.push(entity);

      if (type.behavior === 'mine') {
        // Mine starts dormant — grey/muted appearance
        entity.setAlpha(0.5);
        entity.setData('mineArmed', false);
        this.mineStates.set(entity, createMineState(MINE_ARM_DELAY));
      } else if (type.behavior === 'bomb') {
        // Glitter Bomb — detonate immediately on placement
        if (!entity.getData('bombDetonated')) {
          entity.setData('bombDetonated', true);
          const affected = bombDetonate(row, col, this.enemies, GRID_ROWS - 1, GRID_COLS - 1);
          for (const enemy of affected) {
            const ent = this.enemies.find(e => e === enemy);
            if (ent) {
              ent.drawHealthBar();
              ent.updateHelmet();
              ent.playHitFlash();
            }
          }
          // Sparkle burst effect at bomb position
          this.spawnGlitterBurst(entity.x, entity.y);
          // Remove bomb entity from grid
          const idx = this.defenders.indexOf(entity);
          if (idx >= 0) this.defenders.splice(idx, 1);
          this.placement.remove({ row, col });
          entity.destroy();
        }
      }

      // Start recharge cooldown for single-use types
      if (type.singleUse && type.rechargeTime) {
        this.rechargeTimers.set(key, type.rechargeTime);
      }

      this.updateHUDText();
      this.updatePanelHighlight();

      // Tutorial integration — notify on defender placement
      if (this.tutorial && !this.tutorial.isComplete) {
        this.tutorial.onDefenderPlaced(key);
        if (this.tutorial.isComplete) {
          this.completeTutorial();
        } else {
          this.initTutorialStep();
        }
      }
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

    // "+50" fly-up text from spark to HUD
    const flyText = this.add.text(x, y, `+${SPARK_VALUE}`, {
      fontSize: '18px',
      color: '#fbbf24',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: flyText,
      y: this.balanceText.y + 8,
      x: this.balanceText.x + 40,
      alpha: 0,
      scale: 0.6,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => flyText.destroy(),
    });

    // Pulse the balance text to draw attention
    this.tweens.add({
      targets: this.balanceText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

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

    // Tutorial integration — notify on spark collection
    if (this.tutorial && !this.tutorial.isComplete) {
      const pistolCost = DEFENDER_TYPES.shooter?.cost ?? 100;
      this.tutorial.onSparkCollected(this.economy.getBalance(), pistolCost);
      if (this.tutorial.step === 'PLACE_PISTOL') {
        this.initTutorialStep();
      }
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

  /** Dramatic amber splash — expands across 3 lanes with droplet particles */
  private spawnHoneySplash(x: number, y: number, lane: number): void {
    // Central amber blast
    const blast = this.add.graphics();
    blast.fillStyle(0xe65100, 0.7);
    blast.fillCircle(x, y, 8);
    blast.setDepth(50);
    this.tweens.add({
      targets: blast,
      scaleX: 5,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => blast.destroy(),
    });
    // Amber ring expanding outward
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xffb300, 0.8);
    ring.strokeCircle(x, y, 10);
    ring.setDepth(50);
    this.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    // Droplet particles splashing into adjacent lanes
    const aoeRows = getAOETargetRows(lane, GRID_ROWS);
    for (const row of aoeRows) {
      const py = HUD_HEIGHT + row * CELL_SIZE + CELL_SIZE / 2;
      const drop = this.add.circle(x, y, 4, 0xffb300, 0.9);
      drop.setDepth(50);
      this.tweens.add({
        targets: drop,
        x: x + (Math.random() - 0.5) * 20,
        y: py,
        scaleX: 0.5,
        scaleY: 0.5,
        alpha: 0,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => drop.destroy(),
      });
    }
  }

  /** Glitter Bomb sparkle burst — pink/gold particle explosion at entity layer */
  private spawnGlitterBurst(x: number, y: number): void {
    // Central pink flash
    const flash = this.add.circle(x, y, 6, 0xf06292, 0.9);
    flash.setDepth(5);
    this.tweens.add({
      targets: flash,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
    // Gold ring expanding
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xffd54f, 0.8);
    ring.strokeCircle(x, y, 8);
    ring.setDepth(5);
    this.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    // Sparkle particles — pink and gold dots radiating outward
    const colors = [0xf06292, 0xffd54f, 0xffffff, 0xf48fb1, 0xffe082];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const dist = 30 + Math.random() * 20;
      const dot = this.add.circle(x, y, 2 + Math.random() * 2, colors[i % colors.length], 0.9);
      dot.setDepth(5);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // Wave spawning — paused during tutorial, only spawn enemies in active lanes
    if (!this.tutorial || this.tutorial.isComplete) {
      const spawns = this.waveManager.update(dt);
      for (const spawn of spawns) {
        if (!this.activeLanes.includes(spawn.lane)) continue;
        const spawnCol = GRID_COLS; // right edge
        const enemyKey = Object.entries(ENEMY_TYPES).find(([, v]) => v === spawn.type)?.[0] ?? 'basic';
        const enemy = new EnemyEntity(this, spawn.lane, spawnCol, enemyKey, spawn.type);
        this.enemies.push(enemy);
      }
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

    // Update honey pots — expire old ones and manage visuals
    this.honeyPots = updateHoneyPots(this.honeyPots, delta);
    // Render honey pool visuals at depth 2 (above grid tiles, below entities)
    const activePotKeys = new Set<string>();
    for (const pot of this.honeyPots) {
      const key = `${pot.row},${pot.col}`;
      activePotKeys.add(key);
      if (!this.honeyPotGraphics.has(key)) {
        const px = pot.col * CELL_SIZE + CELL_SIZE / 2;
        const py = HUD_HEIGHT + pot.row * CELL_SIZE + CELL_SIZE / 2;
        const g = this.add.graphics();
        // Outer glow
        g.fillStyle(0xffb300, 0.15);
        g.fillCircle(px, py, CELL_SIZE * 0.45);
        // Main pool
        g.fillStyle(0xe65100, 0.4);
        g.fillCircle(px, py, CELL_SIZE * 0.35);
        // Inner highlight
        g.fillStyle(0xffd54f, 0.25);
        g.fillCircle(px - 3, py - 3, CELL_SIZE * 0.15);
        g.setDepth(2);
        this.honeyPotGraphics.set(key, g);
      }
    }
    // Remove visuals for expired pots
    for (const [key, g] of this.honeyPotGraphics) {
      if (!activePotKeys.has(key)) {
        g.destroy();
        this.honeyPotGraphics.delete(key);
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
          const ent = this.enemies.find(e => e === target);
          const isBoss = ent?.enemyType.bossType === true;
          const isTough = ent?.enemyKey === 'tough' || ent?.enemyKey === 'armored';
          const mineDamage = isBoss ? MINE_BOSS_DAMAGE : isTough ? MINE_HEAVY_DAMAGE : def.defenderType.damage;
          applyDamage(target, mineDamage);
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

    // Shooter + cannon + trapper cooldowns and firing
    for (const def of this.defenders) {
      const isShooter = def.defenderKey === 'shooter';
      const isCannon = def.defenderKey === 'cannon';
      const isTrapper = def.defenderType.behavior === 'trapper';
      if ((!isShooter && !isCannon && !isTrapper) || isDead(def)) continue;

      const projectileSpeed = isTrapper ? HONEY_BEAR_PROJECTILE_SPEED : undefined;

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

      const laneEnemies = this.enemies.filter((e) => {
        if (isDead(e)) return false;
        const reach = ((e.hitboxLanes ?? 1) - 1) / 2;
        return Math.abs(e.lane - def.gridRow) <= reach;
      });
      const proj = tryFire(shooter, laneEnemies);

      def.setData('fireCooldown', shooter.fireCooldown);

      if (proj) {
        def.playRecoil();
        playSfxFire();
        const speed = projectileSpeed ?? proj.speed;
        const projEntity = new ProjectileEntity(this, proj.lane, proj.x, proj.damage, speed, isTrapper, isCannon);
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
          if (proj.isHoney) {
            // Honey projectile: AOE damage to ±1 rows + create honey pots
            const hitCol = Math.round(enemy.col);
            const hitEnemies = applyAOEDamage(proj.lane, hitCol, proj.damage, this.enemies);
            for (const he of hitEnemies) {
              const ent = this.enemies.find(e => e === he);
              if (ent) {
                ent.drawHealthBar();
                ent.updateHelmet();
                ent.playHitFlash();
              }
            }
            // Create honey pots on each affected row at the hit column
            const aoeRows = getAOETargetRows(proj.lane, GRID_ROWS);
            for (const row of aoeRows) {
              if (hitCol >= 0 && hitCol < GRID_COLS) {
                const pot = createHoneyPot(row, hitCol, HONEY_POT_DURATION);
                this.honeyPots.push(pot);
              }
            }
          } else {
            // Water Pistol / Water Cannon: single-target damage
            applyDamage(enemy, proj.damage);
            if (proj.isCannon) {
              // Water Cannon knockback — gentle nudge with slow lerp
              const oldCol = enemy.col;
              const kb = DEFENDER_TYPES.cannon.knockback ?? 0.3;
              applyKnockback(enemy, kb, GRID_COLS - 1);
              if (enemy.col !== oldCol) {
                const targetX = enemy.col * CELL_SIZE + CELL_SIZE / 2;
                this.tweens.add({
                  targets: enemy,
                  x: targetX,
                  duration: 400,
                  ease: 'Sine.easeOut',
                });
              }
            }
            enemy.drawHealthBar();
            enemy.updateHelmet();
            enemy.playHitFlash();
          }
          playSfxHit();
          if (proj.isHoney) {
            this.spawnHoneySplash(proj.x, proj.y, proj.lane);
          } else {
            this.spawnImpactBurst(proj.x, proj.y);
          }
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
          basic: 0xf48fb1, tough: 0xb388ff, armored: 0xf48fb1, jumper: 0xff8a65, boss: 0x78909c,
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
