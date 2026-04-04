import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';

const FADE_DURATION = 600;

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);

    // Background — warm brown to match bedroom theme
    this.cameras.main.setBackgroundColor('#5d4037');

    // Bedroom atmosphere — floor boards and furniture silhouettes
    const bg = this.add.graphics();
    // Floor board lines
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
    // Rug shape (oval in center)
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

    // Title text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'Toy Box Siege', {
      fontSize: '42px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Defend your fort from the mess!', {
      fontSize: '16px',
      color: '#bcaaa4',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Play button
    const playBg = this.add.graphics();
    playBg.fillStyle(0x3e2723, 1);
    playBg.fillRoundedRect(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 30, 120, 50, 8);
    playBg.lineStyle(2, 0xffc107, 1);
    playBg.strokeRoundedRect(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 30, 120, 50, 8);

    const playText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 55, 'Play', {
      fontSize: '24px',
      color: '#ffc107',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const playZone = this.add.zone(
      GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 30, 120, 50,
    ).setOrigin(0).setInteractive({ useHandCursor: true });

    playZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LevelSelectScene');
      });
    });
  }
}
