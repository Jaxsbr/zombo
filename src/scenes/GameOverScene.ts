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
