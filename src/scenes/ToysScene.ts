import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { DEFENDER_TYPES } from '../config/defenders';
import { DRAW_DEFENDER } from '../entities/DefenderEntity';
import { loadUnlocks } from '../systems/DefenderUnlocks';

const ALWAYS_UNLOCKED = new Set(['generator', 'shooter']);

export class ToysScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ToysScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#5d4037');

    const bg = this.add.graphics();
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    this.add.text(GAME_WIDTH / 2, 28, 'Your Toys', {
      fontSize: '28px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const unlocked = loadUnlocks();
    const keys = Object.keys(DEFENDER_TYPES);
    const cardW = 90;
    const cardH = 170;
    const gap = 10;
    const totalW = keys.length * cardW + (keys.length - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;
    const cardY = 80;

    keys.forEach((key, i) => {
      const defender = DEFENDER_TYPES[key];
      const cx = startX + i * (cardW + gap);
      const isUnlocked = ALWAYS_UNLOCKED.has(key) || unlocked.includes(key);
      this.drawDefenderCard(cx, cardY, cardW, cardH, key, defender, isUnlocked);
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

  private drawDefenderCard(
    x: number, y: number, w: number, h: number,
    key: string, defender: (typeof DEFENDER_TYPES)[string], isUnlocked: boolean,
  ): void {
    const card = this.add.graphics();

    if (isUnlocked) {
      card.fillStyle(0xfff8e1, 1);
      card.fillRoundedRect(x, y, w, h, 6);
      card.lineStyle(2, 0x5d4037, 1);
      card.strokeRoundedRect(x, y, w, h, 6);

      // Defender visual at scale ≥ 1.5 (top of card)
      const defContainer = this.add.container(x + w / 2, y + 44);
      const defGraphics = this.add.graphics();
      const drawDefFn = DRAW_DEFENDER[key];
      if (drawDefFn) drawDefFn(defGraphics);
      defContainer.add(defGraphics);
      defContainer.setScale(1.6);

      this.add.text(x + w / 2, y + 88, defender.name, {
        fontSize: '18px',
        color: '#3e2723',
        fontFamily: 'monospace',
        wordWrap: { width: w - 6 },
        align: 'center',
      }).setOrigin(0.5, 0);

      this.add.text(x + w / 2, y + 132, `${defender.cost} \u2736`, {
        fontSize: '10px',
        color: '#5d4037',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      this.add.text(x + w / 2, y + 146, defender.bio, {
        fontSize: '7px',
        color: '#5d4037',
        fontFamily: 'monospace',
        wordWrap: { width: w - 6 },
        align: 'center',
      }).setOrigin(0.5, 0);
    } else {
      // Silhouette card — darkened, not interactive
      card.fillStyle(0x3e2723, 0.25);
      card.fillRoundedRect(x, y, w, h, 6);
      card.lineStyle(1, 0x5d4037, 0.4);
      card.strokeRoundedRect(x, y, w, h, 6);

      // Darkened defender shape
      const silContainer = this.add.container(x + w / 2, y + 44);
      const silhouette = this.add.graphics();
      silhouette.setAlpha(0.25);
      const drawSilFn = DRAW_DEFENDER[key];
      if (drawSilFn) drawSilFn(silhouette);
      silContainer.add(silhouette);
      silContainer.setScale(1.6);

      this.add.text(x + w / 2, y + h / 2 + 10, '???', {
        fontSize: '14px',
        color: '#8d6e63',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
    }
  }
}
