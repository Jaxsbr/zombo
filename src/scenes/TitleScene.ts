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
        this.scene.start('GameScene');
      });
    });
  }
}
