import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { ALL_LEVELS } from '../config/levels';
import { loadProgress, saveProgress, completeLevel, getLevelState, ProgressData } from '../systems/LevelProgress';

const FADE_DURATION = 600;

export class LevelSelectScene extends Phaser.Scene {
  private progress!: ProgressData;

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(data?: { completedLevel?: number; won?: boolean }): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#5d4037');

    // Handle level completion from GameOverScene
    this.progress = loadProgress();
    if (data?.completedLevel !== undefined && data.won) {
      this.progress = completeLevel(this.progress, data.completedLevel);
      saveProgress(this.progress);
    }

    this.drawBackground();
    this.drawTitle();
    this.drawLevelEntries();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    // Floor boards
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
    // Rug
    bg.fillStyle(0x8d6e63, 0.15);
    bg.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 350, 140);
    // Furniture silhouettes
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
    x: number,
    y: number,
    width: number,
    height: number,
    levelIndex: number,
    state: 'locked' | 'unlocked' | 'completed',
  ): void {
    const g = this.add.graphics();

    if (state === 'locked') {
      // Muted, non-interactive toy box
      g.fillStyle(0x3e2723, 0.5);
      g.fillRoundedRect(x, y, width, height, 8);
      g.lineStyle(1, 0x5d4037, 0.3);
      g.strokeRoundedRect(x, y, width, height, 8);

      // Lock icon (simple padlock)
      g.fillStyle(0x795548, 0.4);
      g.fillCircle(x + width / 2, y + 40, 10);
      g.fillRect(x + width / 2 - 8, y + 45, 16, 12);

      // Level number — dimmed
      this.add.text(x + width / 2, y + height - 18, `${levelIndex + 1}`, {
        fontSize: '18px',
        color: '#5d4037',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
    } else {
      // Active toy box — themed as numbered block
      const boxColor = state === 'completed' ? 0x4caf50 : 0xffc107;
      const borderColor = state === 'completed' ? 0x388e3c : 0xff9800;

      g.fillStyle(boxColor, 1);
      g.fillRoundedRect(x, y, width, height, 8);
      g.lineStyle(2, borderColor, 1);
      g.strokeRoundedRect(x, y, width, height, 8);

      // Decorative lid line
      g.lineStyle(1, borderColor, 0.5);
      g.lineBetween(x + 4, y + 20, x + width - 4, y + 20);

      // Level number — big and bold
      this.add.text(x + width / 2, y + 50, `${levelIndex + 1}`, {
        fontSize: '32px',
        color: '#3e2723',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 1,
      }).setOrigin(0.5);

      // Completion star
      if (state === 'completed') {
        this.add.text(x + width / 2, y + height - 16, '\u2605', {
          fontSize: '16px',
          color: '#ffeb3b',
          fontFamily: 'monospace',
        }).setOrigin(0.5);
      }

      // Clickable zone
      const zone = this.add.zone(x, y, width, height)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', {
            levelConfig: ALL_LEVELS[levelIndex],
            levelIndex,
          });
        });
      });
    }
  }
}
