import Phaser from 'phaser';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, HUD_HEIGHT } from '../config/game';
import { DEFENDER_TYPES, DefenderType } from '../config/defenders';
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
import { EnemyEntity } from '../entities/EnemyEntity';
import { ProjectileEntity } from '../entities/ProjectileEntity';

const STARTING_BALANCE = 500;
const PASSIVE_INCOME_INTERVAL = 8000; // ms
const PASSIVE_INCOME_AMOUNT = 25;
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
    this.progressDots = [];
    this.lastWaveState = 'setup';

    this.drawGrid();
    this.createHUD();
    this.createDefenderPanel();
    this.createGridClickZones();
    this.createAnnouncementText();
    this.createProgressDots();
    this.createCountdownBar();

    // Passive sky-drop income
    this.time.addEvent({
      delay: PASSIVE_INCOME_INTERVAL,
      callback: () => this.economy.addIncome(PASSIVE_INCOME_AMOUNT),
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

      bg.clear();
      if (key === this.selectedDefenderKey) {
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
      nameText.setAlpha(canAfford ? 1 : 0.4);
      costText.setAlpha(canAfford ? 1 : 0.4);
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

    const type = DEFENDER_TYPES[this.selectedDefenderKey];
    const result = this.placement.place({ row, col }, type);

    if (result.ok) {
      const entity = new DefenderEntity(this, row, col, this.selectedDefenderKey, type);
      this.defenders.push(entity);
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
    } else if (state !== 'announcing' && this.lastWaveState === 'announcing') {
      this.announcementText.setVisible(false);
    }

    this.lastWaveState = state;
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
      let blocked = false;
      for (const def of this.defenders) {
        if (!isDead(def)) {
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
          proj.destroy();
          break;
        }
      }
    }

    // Remove dead enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (isDead(this.enemies[i])) {
        this.enemies[i].destroy();
        this.enemies.splice(i, 1);
      }
    }

    // Remove dead defenders
    for (let i = this.defenders.length - 1; i >= 0; i--) {
      if (isDead(this.defenders[i])) {
        this.placement.remove({ row: this.defenders[i].gridRow, col: this.defenders[i].gridCol });
        this.defenders[i].destroy();
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

    this.updateHUDText();
    this.updatePanelHighlight();
    this.updateAnnouncement();
    this.updateProgressDots();
    this.updateCountdownBar();
  }

}
