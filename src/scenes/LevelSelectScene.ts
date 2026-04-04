import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { DEFENDER_TYPES } from '../config/defenders';
import { ALL_LEVELS } from '../config/levels';
import { loadProgress, saveProgress, completeLevel, getLevelState, ProgressData } from '../systems/LevelProgress';
import { loadUnlocks, saveUnlocks, updateUnlocksAfterLevel, needsLoadoutSelection, MAX_LOADOUT } from '../systems/DefenderUnlocks';

const FADE_DURATION = 600;

export class LevelSelectScene extends Phaser.Scene {
  private progress!: ProgressData;
  private unlocked!: string[];
  private pendingLevelIndex: number = 0;
  private loadoutMode: boolean = false;
  private selectedLoadout: Set<string> = new Set();
  private loadoutCards: Map<string, { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics }> = new Map();
  private goButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(data?: { completedLevel?: number; won?: boolean }): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#5d4037');
    this.loadoutMode = false;
    this.selectedLoadout = new Set();
    this.loadoutCards = new Map();

    // Handle level completion from GameOverScene
    this.progress = loadProgress();
    this.unlocked = loadUnlocks();
    if (data?.completedLevel !== undefined && data.won) {
      this.progress = completeLevel(this.progress, data.completedLevel);
      saveProgress(this.progress);
      this.unlocked = updateUnlocksAfterLevel(this.unlocked, data.completedLevel);
      saveUnlocks(this.unlocked);
    }

    this.drawBackground();
    this.drawTitle();
    this.drawLevelEntries();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
    bg.fillStyle(0x8d6e63, 0.15);
    bg.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 350, 140);
    bg.fillStyle(0x3e2723, 0.25);
    bg.fillRect(8, 8, 55, 70);
    bg.fillRect(GAME_WIDTH - 65, 15, 55, 55);
  }

  private drawTitle(): void {
    this.add.text(GAME_WIDTH / 2, 35, 'Choose a Level', {
      fontSize: '28px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  private drawLevelEntries(): void {
    const entryWidth = 90;
    const entryHeight = 100;
    const gap = 16;
    const totalWidth = 5 * entryWidth + 4 * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const startY = (GAME_HEIGHT - entryHeight) / 2 + 10;

    for (let i = 0; i < 5; i++) {
      const x = startX + i * (entryWidth + gap);
      const state = getLevelState(this.progress, i);
      this.drawLevelEntry(x, startY, entryWidth, entryHeight, i, state);
    }
  }

  private drawLevelEntry(
    x: number, y: number, width: number, height: number,
    levelIndex: number, state: 'locked' | 'unlocked' | 'completed',
  ): void {
    const g = this.add.graphics();

    if (state === 'locked') {
      g.fillStyle(0x3e2723, 0.5);
      g.fillRoundedRect(x, y, width, height, 8);
      g.lineStyle(1, 0x5d4037, 0.3);
      g.strokeRoundedRect(x, y, width, height, 8);
      g.fillStyle(0x795548, 0.4);
      g.fillCircle(x + width / 2, y + 40, 10);
      g.fillRect(x + width / 2 - 8, y + 45, 16, 12);
      this.add.text(x + width / 2, y + height - 18, `${levelIndex + 1}`, {
        fontSize: '18px', color: '#5d4037', fontFamily: 'monospace',
      }).setOrigin(0.5);
    } else {
      const boxColor = state === 'completed' ? 0x4caf50 : 0xffc107;
      const borderColor = state === 'completed' ? 0x388e3c : 0xff9800;

      g.fillStyle(boxColor, 1);
      g.fillRoundedRect(x, y, width, height, 8);
      g.lineStyle(2, borderColor, 1);
      g.strokeRoundedRect(x, y, width, height, 8);
      g.lineStyle(1, borderColor, 0.5);
      g.lineBetween(x + 4, y + 20, x + width - 4, y + 20);

      this.add.text(x + width / 2, y + 50, `${levelIndex + 1}`, {
        fontSize: '32px', color: '#3e2723', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5);

      if (state === 'completed') {
        this.add.text(x + width / 2, y + height - 16, '\u2605', {
          fontSize: '16px', color: '#ffeb3b', fontFamily: 'monospace',
        }).setOrigin(0.5);
      }

      const zone = this.add.zone(x, y, width, height)
        .setOrigin(0).setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.startLevel(levelIndex);
      });
    }
  }

  private startLevel(levelIndex: number): void {
    this.pendingLevelIndex = levelIndex;

    if (needsLoadoutSelection(this.unlocked)) {
      this.showLoadoutSelection();
    } else {
      // Auto-fill with all unlocked defenders
      this.launchGame(this.unlocked);
    }
  }

  private showLoadoutSelection(): void {
    this.loadoutMode = true;
    this.selectedLoadout = new Set();
    this.loadoutCards = new Map();

    // Dim the level entries
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6,
    );
    overlay.setDepth(10);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 60, 'Pick Your Toys', {
      fontSize: '24px', color: '#ffc107', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
    title.setDepth(11);

    const subtitle = this.add.text(GAME_WIDTH / 2, 85, `Choose up to ${MAX_LOADOUT} defenders`, {
      fontSize: '14px', color: '#bcaaa4', fontFamily: 'monospace',
    }).setOrigin(0.5);
    subtitle.setDepth(11);

    // Defender cards
    const cardWidth = 90;
    const cardHeight = 100;
    const gap = 10;
    const totalWidth = this.unlocked.length * cardWidth + (this.unlocked.length - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const startY = 120;

    for (let i = 0; i < this.unlocked.length; i++) {
      const key = this.unlocked[i];
      const type = DEFENDER_TYPES[key];
      const x = startX + i * (cardWidth + gap);

      const container = this.add.container(x, startY);
      container.setDepth(11);

      const bg = this.add.graphics();
      bg.fillStyle(0x334155, 1);
      bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 6);
      container.add(bg);

      const nameText = this.add.text(cardWidth / 2, 8, type.name, {
        fontSize: '10px', color: '#e2e8f0', fontFamily: 'monospace',
      }).setOrigin(0.5, 0);
      if (nameText.width > cardWidth - 8) nameText.setScale((cardWidth - 8) / nameText.width);
      container.add(nameText);

      const costText = this.add.text(cardWidth / 2, cardHeight - 14, `${type.cost}`, {
        fontSize: '14px', color: '#ffc107', fontFamily: 'monospace',
      }).setOrigin(0.5);
      container.add(costText);

      const zone = this.add.zone(0, 0, cardWidth, cardHeight)
        .setOrigin(0).setInteractive({ useHandCursor: true });
      container.add(zone);

      zone.on('pointerdown', () => {
        this.toggleLoadoutCard(key);
      });

      this.loadoutCards.set(key, { container, bg });
    }

    // Go button
    this.goButton = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 60);
    this.goButton.setDepth(11);

    const goBg = this.add.graphics();
    goBg.fillStyle(0x3e2723, 0.8);
    goBg.fillRoundedRect(-50, -20, 100, 40, 6);
    this.goButton.add(goBg);

    const goText = this.add.text(0, 0, 'Go!', {
      fontSize: '22px', color: '#5d4037', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.goButton.add(goText);
    this.goButton.setData('bg', goBg);
    this.goButton.setData('text', goText);

    const goZone = this.add.zone(-50, -20, 100, 40)
      .setOrigin(0).setInteractive({ useHandCursor: true });
    this.goButton.add(goZone);

    goZone.on('pointerdown', () => {
      if (this.selectedLoadout.size >= 1) {
        this.launchGame([...this.selectedLoadout]);
      }
    });

    this.updateLoadoutVisuals();
  }

  private toggleLoadoutCard(key: string): void {
    if (this.selectedLoadout.has(key)) {
      this.selectedLoadout.delete(key);
    } else if (this.selectedLoadout.size < MAX_LOADOUT) {
      this.selectedLoadout.add(key);
    }
    // If already at max, don't add — selection cap enforced
    this.updateLoadoutVisuals();
  }

  private updateLoadoutVisuals(): void {
    for (const [key, { bg }] of this.loadoutCards) {
      bg.clear();
      if (this.selectedLoadout.has(key)) {
        bg.fillStyle(0x475569, 1);
        bg.fillRoundedRect(0, 0, 90, 100, 6);
        bg.lineStyle(3, 0xffc107, 1);
        bg.strokeRoundedRect(0, 0, 90, 100, 6);
      } else {
        bg.fillStyle(0x334155, 1);
        bg.fillRoundedRect(0, 0, 90, 100, 6);
      }
    }

    // Update Go button state
    const goBg = this.goButton.getData('bg') as Phaser.GameObjects.Graphics;
    const goText = this.goButton.getData('text') as Phaser.GameObjects.Text;
    const active = this.selectedLoadout.size >= 1;
    goBg.clear();
    goBg.fillStyle(active ? 0x4caf50 : 0x3e2723, active ? 1 : 0.8);
    goBg.fillRoundedRect(-50, -20, 100, 40, 6);
    if (active) {
      goBg.lineStyle(2, 0x388e3c, 1);
      goBg.strokeRoundedRect(-50, -20, 100, 40, 6);
    }
    goText.setColor(active ? '#ffffff' : '#5d4037');
  }

  private launchGame(loadout: string[]): void {
    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', {
        levelConfig: ALL_LEVELS[this.pendingLevelIndex],
        levelIndex: this.pendingLevelIndex,
        loadout,
      });
    });
  }
}
