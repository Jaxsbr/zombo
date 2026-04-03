import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean }): void {
    const message = data.won ? 'You Win!' : 'Game Over';
    const color = data.won ? '#4ade80' : '#ef4444';

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, message, {
      fontSize: '48px',
      color,
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const restartText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'Click to Restart', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    restartText.setInteractive({ useHandCursor: true });
    restartText.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
