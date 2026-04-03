import Phaser from 'phaser';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, HUD_HEIGHT } from '../config/game';
import { DEFENDER_TYPES, DefenderType } from '../config/defenders';
import { LEVEL_1 } from '../config/levels';
import { Grid } from '../systems/Grid';
import { Economy } from '../systems/Economy';
import { Placement } from '../systems/Placement';
import { WaveManager } from '../systems/WaveManager';
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
import { DefenderEntity } from '../entities/DefenderEntity';
import { EnemyEntity } from '../entities/EnemyEntity';
import { ProjectileEntity } from '../entities/ProjectileEntity';

const STARTING_BALANCE = 150;
const PASSIVE_INCOME_INTERVAL = 8000; // ms
const PASSIVE_INCOME_AMOUNT = 25;
const GENERATOR_INCOME_INTERVAL = 5000; // ms

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private economy!: Economy;
  private placement!: Placement;
  private waveManager!: WaveManager;
  private gameFlow!: GameFlow;

  private balanceText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private selectedDefenderKey: string | null = null;
  private panelCards: Map<string, Phaser.GameObjects.Container> = new Map();
  private defenders: DefenderEntity[] = [];
  private enemies: EnemyEntity[] = [];
  private projectiles: ProjectileEntity[] = [];
  private cellZones: Phaser.GameObjects.Zone[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
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

    this.drawGrid();
    this.createHUD();
    this.createDefenderPanel();
    this.createGridClickZones();

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

        const shade = (row + col) % 2 === 0 ? 0x3a7d32 : 0x2d6b27;
        graphics.fillStyle(shade, 1);
        graphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        graphics.lineStyle(1, 0x1a5c14, 0.3);
        graphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    // HUD background
    graphics.fillStyle(0x1a1a2e, 1);
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
    this.balanceText.setText(`Energy: ${this.economy.getBalance()}`);
    this.waveText.setText(
      `Wave ${this.waveManager.currentWaveNumber}/${this.waveManager.totalWaves}`,
    );
  }

  private createDefenderPanel(): void {
    const keys = Object.keys(DEFENDER_TYPES);
    const panelStartX = 180;
    const cardWidth = 110;
    const cardHeight = 60;
    const cardGap = 8;

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

    const nameText = this.add.text(8, 6, type.name, {
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'monospace',
    });
    container.add(nameText);

    const costText = this.add.text(8, 24, `Cost: ${type.cost}`, {
      fontSize: '11px',
      color: '#94a3b8',
      fontFamily: 'monospace',
    });
    container.add(costText);

    const previewColors: Record<string, number> = {
      generator: 0x22c55e,
      shooter: 0x3b82f6,
      wall: 0x9ca3af,
    };
    const preview = this.add.graphics();
    preview.fillStyle(previewColors[key] ?? 0xffffff, 1);
    preview.fillRect(width - 28, 8, 20, 20);
    container.add(preview);

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
      } else if (!canAfford) {
        bg.fillStyle(0x1e293b, 0.6);
      } else {
        bg.fillStyle(0x334155, 1);
      }
      bg.fillRoundedRect(0, 0, 110, 60, 6);

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

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // Wave spawning
    const spawns = this.waveManager.update(dt);
    for (const spawn of spawns) {
      const spawnCol = GRID_COLS; // right edge
      const enemy = new EnemyEntity(this, spawn.lane, spawnCol, this.getEnemyKey(spawn.type), spawn.type);
      this.enemies.push(enemy);
    }

    // Enemy movement
    for (const enemy of this.enemies) {
      if (isDead(enemy)) continue;

      // Check wall blocking
      let blocked = false;
      for (const def of this.defenders) {
        if (def.defenderKey === 'wall' && !isDead(def)) {
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
    if (state !== 'playing') {
      this.scene.start('GameOverScene', { won: state === 'won' });
      return;
    }

    this.updateHUDText();
    this.updatePanelHighlight();
  }

  private getEnemyKey(type: { name: string }): string {
    return type.name.toLowerCase();
  }
}
