import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { loadProgress, nextUnbeatenLevel } from '../systems/LevelProgress';
import { isSfxMuted, setSfxMuted } from '../systems/SFX';

const FADE_DURATION = 600;
const BTN_W = 160;
const BTN_H = 48;
const BTN_RADIUS = 8;
const BTN_FILL = 0x5d4037;
const BTN_BORDER = 0xffc107;

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#5d4037');

    this.drawAtmosphere();
    this.drawTitle();

    const progress = loadProgress();
    const hasProgress = progress.levels.some(s => s === 'completed');
    this.drawPlayButton(hasProgress, progress);
    this.drawNavButton('Toys', 225, () => this.scene.start('ToysScene'));
    this.drawNavButton('Enemies', 273, () => this.scene.start('EnemiesScene'));
    this.drawSoundToggle();
  }

  private drawAtmosphere(): void {
    const bg = this.add.graphics();
    // Floor board lines
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
    // Rug oval
    bg.fillStyle(0x8d6e63, 0.15);
    bg.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 300, 120);
    bg.lineStyle(1, 0xa1887f, 0.2);
    bg.strokeEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 300, 120);
    // Bookshelf silhouette top-left
    bg.fillStyle(0x3e2723, 0.3);
    bg.fillRect(10, 10, 60, 80);
    bg.fillRect(15, 8, 50, 6);
    // Dresser top-right
    bg.fillRect(GAME_WIDTH - 80, 20, 70, 50);
    // Scattered toy shapes
    bg.fillStyle(0xe53935, 0.15);
    bg.fillRect(50, GAME_HEIGHT - 50, 20, 6); // crayon
    bg.fillStyle(0x42a5f5, 0.15);
    bg.fillCircle(GAME_WIDTH - 50, GAME_HEIGHT - 40, 6); // marble
    bg.fillStyle(0x66bb6a, 0.15);
    bg.fillRect(GAME_WIDTH - 150, GAME_HEIGHT - 55, 12, 8); // brick
  }

  private drawTitle(): void {
    this.add.text(GAME_WIDTH / 2, 70, 'Toy Box Siege', {
      fontSize: '42px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 105, 'Defend your fort from the mess!', {
      fontSize: '16px',
      color: '#bcaaa4',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private drawPlayButton(hasProgress: boolean, progress: ReturnType<typeof loadProgress>): void {
    const label = hasProgress ? 'Continue' : 'Play';
    const x = GAME_WIDTH / 2 - BTN_W / 2;
    const y = 165;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(BTN_FILL, 1);
    btnBg.fillRoundedRect(x, y, BTN_W, BTN_H, BTN_RADIUS);
    btnBg.lineStyle(2, BTN_BORDER, 1);
    btnBg.strokeRoundedRect(x, y, BTN_W, BTN_H, BTN_RADIUS);

    this.add.text(GAME_WIDTH / 2, y + BTN_H / 2, label, {
      fontSize: '22px',
      color: '#ffc107',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, BTN_W, BTN_H).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (hasProgress) {
          this.scene.start('LevelSelectScene', { selectedLevel: nextUnbeatenLevel(progress) });
        } else {
          this.scene.start('LevelSelectScene');
        }
      });
    });
  }

  private drawNavButton(label: string, yCenter: number, onPress: () => void): void {
    const x = GAME_WIDTH / 2 - BTN_W / 2;
    const y = yCenter - BTN_H / 2;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(BTN_FILL, 1);
    btnBg.fillRoundedRect(x, y, BTN_W, BTN_H, BTN_RADIUS);
    btnBg.lineStyle(2, BTN_BORDER, 1);
    btnBg.strokeRoundedRect(x, y, BTN_W, BTN_H, BTN_RADIUS);

    this.add.text(GAME_WIDTH / 2, yCenter, label, {
      fontSize: '20px',
      color: '#ffc107',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, BTN_W, BTN_H).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', onPress);
  }

  private drawSoundToggle(): void {
    const yCenter = 335;
    const label = (): string => (isSfxMuted() ? 'SFX \u2717' : 'SFX \u2713');

    const toggleText = this.add.text(GAME_WIDTH / 2, yCenter, label(), {
      fontSize: '16px',
      color: '#ffc107',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Hit area ≥ 48×48px centred on the toggle text
    const zoneW = 160;
    const zoneH = 48;
    const zone = this.add.zone(
      GAME_WIDTH / 2 - zoneW / 2, yCenter - zoneH / 2, zoneW, zoneH,
    ).setOrigin(0).setInteractive({ useHandCursor: true });

    zone.on('pointerdown', () => {
      setSfxMuted(!isSfxMuted());
      toggleText.setText(label());
    });
  }
}
