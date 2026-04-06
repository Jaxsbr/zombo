import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { ENEMY_TYPES } from '../config/enemies';
import { DRAW_ENEMY } from '../entities/EnemyEntity';

const BIO_SHOWN_ENEMY_PREFIX = 'bio_shown_enemy_';
const ALWAYS_DISCOVERED = new Set(['basic']);

export class EnemiesScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EnemiesScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#5d4037');

    const bg = this.add.graphics();
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    this.add.text(GAME_WIDTH / 2, 28, 'Enemies', {
      fontSize: '28px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const keys = Object.keys(ENEMY_TYPES);
    const cardW = 110;
    const cardH = 190;
    const gap = 12;
    const totalW = keys.length * cardW + (keys.length - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;
    const cardY = 70;

    keys.forEach((key, i) => {
      const enemy = ENEMY_TYPES[key];
      const cx = startX + i * (cardW + gap);
      const isDiscovered = ALWAYS_DISCOVERED.has(key) ||
        !!localStorage.getItem(`${BIO_SHOWN_ENEMY_PREFIX}${key}`);
      this.drawEnemyCard(cx, cardY, cardW, cardH, key, enemy, isDiscovered);
    });

    // Back button (top-left, hit area ≥ 48×48)
    const backBg = this.add.graphics();
    backBg.fillStyle(0x3e2723, 1);
    backBg.fillRoundedRect(8, 8, 60, 36, 6);
    backBg.lineStyle(2, 0xffc107, 1);
    backBg.strokeRoundedRect(8, 8, 60, 36, 6);
    this.add.text(38, 26, '← Back', { fontSize: '13px', color: '#ffc107', fontFamily: 'monospace' }).setOrigin(0.5);
    const backZone = this.add.zone(8, 8, 60, 48).setOrigin(0).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }

  private drawEnemyCard(
    x: number, y: number, w: number, h: number,
    key: string, enemy: (typeof ENEMY_TYPES)[string], isDiscovered: boolean,
  ): void {
    const card = this.add.graphics();

    if (isDiscovered) {
      card.fillStyle(0xfff8e1, 1);
      card.fillRoundedRect(x, y, w, h, 6);
      card.lineStyle(2, 0x5d4037, 1);
      card.strokeRoundedRect(x, y, w, h, 6);

      // Enemy visual at scale ≥ 1.5 (top of card)
      const enemyContainer = this.add.container(x + w / 2, y + 50);
      const enemyGraphics = this.add.graphics();
      const drawEnemyFn = DRAW_ENEMY[key];
      if (drawEnemyFn) drawEnemyFn(enemyGraphics);
      enemyContainer.add(enemyGraphics);
      enemyContainer.setScale(1.6);

      this.add.text(x + w / 2, y + 100, enemy.name, {
        fontSize: '18px',
        color: '#3e2723',
        fontFamily: 'monospace',
        wordWrap: { width: w - 8 },
        align: 'center',
      }).setOrigin(0.5, 0);

      const bio = enemy.bio ?? '';
      this.add.text(x + w / 2, y + 148, bio, {
        fontSize: '7px',
        color: '#5d4037',
        fontFamily: 'monospace',
        wordWrap: { width: w - 8 },
        align: 'center',
      }).setOrigin(0.5, 0);
    } else {
      // Silhouette card — darkened, not interactive
      card.fillStyle(0x3e2723, 0.25);
      card.fillRoundedRect(x, y, w, h, 6);
      card.lineStyle(1, 0x5d4037, 0.4);
      card.strokeRoundedRect(x, y, w, h, 6);

      const silEnemyContainer = this.add.container(x + w / 2, y + 50);
      const silhouette = this.add.graphics();
      silhouette.setAlpha(0.25);
      const drawSilEnemyFn = DRAW_ENEMY[key];
      if (drawSilEnemyFn) drawSilEnemyFn(silhouette);
      silEnemyContainer.add(silhouette);
      silEnemyContainer.setScale(1.6);

      this.add.text(x + w / 2, y + h / 2 + 10, '???', {
        fontSize: '14px',
        color: '#8d6e63',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
    }
  }
}
