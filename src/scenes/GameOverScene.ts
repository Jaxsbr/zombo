import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';

const FADE_DURATION = 600;

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean }): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#5d4037');

    // Bedroom atmosphere background
    const bg = this.add.graphics();
    // Floor board lines
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
    // Rug
    bg.fillStyle(0x8d6e63, 0.15);
    bg.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2, 280, 100);
    // Furniture silhouettes
    bg.fillStyle(0x3e2723, 0.25);
    bg.fillRect(10, 15, 50, 70);
    bg.fillRect(GAME_WIDTH - 70, 25, 60, 45);
    // Scattered toys
    bg.fillStyle(0xffeb3b, 0.12);
    bg.fillCircle(80, GAME_HEIGHT - 35, 4);
    bg.fillStyle(0xe53935, 0.12);
    bg.fillRect(GAME_WIDTH - 120, GAME_HEIGHT - 45, 18, 5);

    const message = data.won ? 'Fort Defended!' : 'The Mess Wins!';
    const color = data.won ? '#ffc107' : '#ef4444';

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, message, {
      fontSize: '40px',
      color,
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Play Again button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x3e2723, 1);
    btnBg.fillRoundedRect(GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 + 20, 160, 50, 8);
    btnBg.lineStyle(2, 0xffc107, 1);
    btnBg.strokeRoundedRect(GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 + 20, 160, 50, 8);

    const playAgainText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45, 'Play Again', {
      fontSize: '22px',
      color: '#ffc107',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const playAgainZone = this.add.zone(
      GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 + 20, 160, 50,
    ).setOrigin(0).setInteractive({ useHandCursor: true });

    playAgainZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });
  }
}
