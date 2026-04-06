import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { DEFENDER_TYPES } from '../config/defenders';
import { DRAW_DEFENDER } from '../entities/DefenderEntity';
import { loadUnlocks } from '../systems/DefenderUnlocks';

const ALWAYS_UNLOCKED = new Set(['generator', 'shooter']);

const CARD_W = 260;
const CARD_H = 280;
const CARD_CX = 288;   // GAME_WIDTH / 2 — hardcoded to avoid circular-import TDZ
const CARD_X = 158;    // CARD_CX - CARD_W / 2
const CARD_Y = 60;
const SPRITE_CY = 140; // CARD_Y + 80
const ARROW_CY = 200;  // CARD_Y + CARD_H / 2

export class ToysScene extends Phaser.Scene {
  private keys: string[] = [];
  private unlocked: string[] = [];
  private currentIndex = 0;
  private cardObjects: Phaser.GameObjects.GameObject[] = [];
  private indexText!: Phaser.GameObjects.Text;

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

    this.add.text(CARD_CX, 28, 'Your Toys', {
      fontSize: '28px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.unlocked = loadUnlocks();
    this.keys = Object.keys(DEFENDER_TYPES);

    this.indexText = this.add.text(CARD_CX, CARD_Y + CARD_H + 14, '', {
      fontSize: '13px',
      color: '#bcaaa4',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.addArrow(34, ARROW_CY, '\u25c0', () => {
      this.currentIndex = (this.currentIndex - 1 + this.keys.length) % this.keys.length;
      this.renderCard();
    });
    this.addArrow(GAME_WIDTH - 34, ARROW_CY, '\u25b6', () => {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      this.renderCard();
    });

    // Back button (top-left, hit area ≥ 48×48)
    const backBg = this.add.graphics();
    backBg.fillStyle(0x3e2723, 1);
    backBg.fillRoundedRect(8, 8, 60, 36, 6);
    backBg.lineStyle(2, 0xffc107, 1);
    backBg.strokeRoundedRect(8, 8, 60, 36, 6);
    this.add.text(38, 26, '\u2190 Back', { fontSize: '13px', color: '#ffc107', fontFamily: 'monospace' }).setOrigin(0.5);
    const backZone = this.add.zone(8, 8, 60, 48).setOrigin(0).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => this.scene.start('MainMenuScene'));

    this.renderCard();
  }

  private addArrow(cx: number, cy: number, symbol: string, onPress: () => void): void {
    const aw = 48;
    const ah = 48;
    const g = this.add.graphics();
    g.fillStyle(0x3e2723, 0.85);
    g.fillRoundedRect(cx - aw / 2, cy - ah / 2, aw, ah, 8);
    g.lineStyle(2, 0xffc107, 0.7);
    g.strokeRoundedRect(cx - aw / 2, cy - ah / 2, aw, ah, 8);
    this.add.text(cx, cy, symbol, {
      fontSize: '24px',
      color: '#ffc107',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.add.zone(cx - aw / 2, cy - ah / 2, aw, ah)
      .setOrigin(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', onPress);
  }

  private renderCard(): void {
    this.cardObjects.forEach(o => o.destroy());
    this.cardObjects = [];

    const key = this.keys[this.currentIndex];
    const defender = DEFENDER_TYPES[key];
    const isUnlocked = ALWAYS_UNLOCKED.has(key) || this.unlocked.includes(key);

    this.indexText.setText(`${this.currentIndex + 1} / ${this.keys.length}`);

    const cardGfx = this.add.graphics();
    this.cardObjects.push(cardGfx);

    if (isUnlocked) {
      cardGfx.fillStyle(0xfff8e1, 1);
      cardGfx.fillRoundedRect(CARD_X, CARD_Y, CARD_W, CARD_H, 8);
      cardGfx.lineStyle(2, 0x5d4037, 1);
      cardGfx.strokeRoundedRect(CARD_X, CARD_Y, CARD_W, CARD_H, 8);

      const spriteContainer = this.add.container(CARD_CX, SPRITE_CY);
      this.cardObjects.push(spriteContainer);
      const spriteGfx = this.add.graphics();
      const drawFn = DRAW_DEFENDER[key];
      if (drawFn) drawFn(spriteGfx);
      spriteContainer.add(spriteGfx);
      spriteContainer.setScale(2.5);

      const nameText = this.add.text(CARD_CX, CARD_Y + 163, defender.name, {
        fontSize: '22px',
        color: '#3e2723',
        fontFamily: 'monospace',
        wordWrap: { width: CARD_W - 32 },
        align: 'center',
      }).setOrigin(0.5, 0);
      this.cardObjects.push(nameText);

      const costText = this.add.text(CARD_CX, CARD_Y + 205, `${defender.cost} \u2736`, {
        fontSize: '14px',
        color: '#795548',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.cardObjects.push(costText);

      const bioText = this.add.text(CARD_CX, CARD_Y + 222, defender.bio ?? '', {
        fontSize: '12px',
        color: '#5d4037',
        fontFamily: 'monospace',
        wordWrap: { width: CARD_W - 32 },
        align: 'center',
      }).setOrigin(0.5, 0);
      this.cardObjects.push(bioText);
    } else {
      cardGfx.fillStyle(0x3e2723, 0.25);
      cardGfx.fillRoundedRect(CARD_X, CARD_Y, CARD_W, CARD_H, 8);
      cardGfx.lineStyle(1, 0x5d4037, 0.4);
      cardGfx.strokeRoundedRect(CARD_X, CARD_Y, CARD_W, CARD_H, 8);

      const silContainer = this.add.container(CARD_CX, SPRITE_CY);
      this.cardObjects.push(silContainer);
      const silGfx = this.add.graphics();
      silGfx.setAlpha(0.25);
      const drawFn = DRAW_DEFENDER[key];
      if (drawFn) drawFn(silGfx);
      silContainer.add(silGfx);
      silContainer.setScale(2.5);

      const lockText = this.add.text(CARD_CX, CARD_Y + CARD_H / 2 + 20, '???', {
        fontSize: '28px',
        color: '#8d6e63',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
      this.cardObjects.push(lockText);

      const hintText = this.add.text(CARD_CX, CARD_Y + CARD_H / 2 + 58, 'Beat more levels\nto unlock!', {
        fontSize: '11px',
        color: '#6d4c41',
        fontFamily: 'monospace',
        align: 'center',
      }).setOrigin(0.5);
      this.cardObjects.push(hintText);
    }
  }
}
