import Phaser from 'phaser';
import { GRID_ROWS, GRID_COLS, CELL_SIZE, HUD_HEIGHT } from '../config/game';
import { DEFENDER_TYPES, DefenderType } from '../config/defenders';
import { Grid } from '../systems/Grid';
import { Economy } from '../systems/Economy';
import { Placement } from '../systems/Placement';
import { WaveManager } from '../systems/WaveManager';
import { GameFlow } from '../systems/GameFlow';
import { DefenderEntity } from '../entities/DefenderEntity';

const STARTING_BALANCE = 150;

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
  private cellZones: Phaser.GameObjects.Zone[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Initialize systems
    this.grid = new Grid(GRID_ROWS, GRID_COLS);
    this.economy = new Economy(STARTING_BALANCE);
    this.placement = new Placement(this.grid, this.economy);
    this.waveManager = new WaveManager({ waves: [] });
    this.gameFlow = new GameFlow();

    // Reset selection state
    this.selectedDefenderKey = null;
    this.panelCards = new Map();
    this.defenders = [];
    this.cellZones = [];

    this.drawGrid();
    this.createHUD();
    this.createDefenderPanel();
    this.createGridClickZones();
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

    // Colored preview square
    const previewColors: Record<string, number> = {
      generator: 0x22c55e,
      shooter: 0x3b82f6,
      wall: 0x9ca3af,
    };
    const preview = this.add.graphics();
    preview.fillStyle(previewColors[key] ?? 0xffffff, 1);
    preview.fillRect(width - 28, 8, 20, 20);
    container.add(preview);

    // Hit zone for click
    const zone = this.add.zone(0, 0, width, height).setOrigin(0).setInteractive({ useHandCursor: true });
    container.add(zone);

    zone.on('pointerdown', () => {
      if (this.economy.getBalance() >= type.cost) {
        this.selectDefender(key);
      }
    });

    // Store references for dimming
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

  update(): void {
    this.updateHUDText();
    this.updatePanelHighlight();
  }
}
