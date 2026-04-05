import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { DEFENDER_TYPES } from '../config/defenders';
import { DRAW_DEFENDER } from '../entities/DefenderEntity';
import { loadUnlocks, updateUnlocksAfterLevel } from '../systems/DefenderUnlocks';

const FADE_DURATION = 600;
const BIO_SHOWN_PREFIX = 'bio_shown_defender_';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean; levelIndex?: number }): void {
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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45, 'Continue', {
      fontSize: '22px',
      color: '#ffc107',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const playAgainZone = this.add.zone(
      GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 + 20, 160, 50,
    ).setOrigin(0).setInteractive({ useHandCursor: true });

    playAgainZone.on('pointerdown', () => {
      playAgainZone.disableInteractive();

      // Check for unlock card before transitioning
      if (data.won && data.levelIndex !== undefined) {
        const unlockedKey = this.getNewUnlockKey(data.levelIndex);
        if (unlockedKey && !this.hasShownBio(unlockedKey)) {
          this.showUnlockCard(unlockedKey, data.levelIndex);
          return;
        }
      }

      this.transitionToLevelSelect(data);
    });
  }

  private getNewUnlockKey(levelIndex: number): string | null {
    const currentUnlocks = loadUnlocks();
    const updatedUnlocks = updateUnlocksAfterLevel(currentUnlocks, levelIndex);
    if (updatedUnlocks.length > currentUnlocks.length) {
      // Find the newly added key
      return updatedUnlocks.find(k => !currentUnlocks.includes(k)) ?? null;
    }
    return null;
  }

  private hasShownBio(key: string): boolean {
    try {
      return localStorage.getItem(`${BIO_SHOWN_PREFIX}${key}`) === 'true';
    } catch {
      return false;
    }
  }

  private markBioShown(key: string): void {
    try {
      localStorage.setItem(`${BIO_SHOWN_PREFIX}${key}`, 'true');
    } catch {
      // localStorage unavailable — silently skip
    }
  }

  private showUnlockCard(defenderKey: string, levelIndex: number): void {
    const type = DEFENDER_TYPES[defenderKey];
    if (!type) return;

    // Dimmed background overlay
    const dimBg = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7,
    );
    dimBg.setDepth(199);

    // Card dimensions
    const cardWidth = 250;
    const cardHeight = 300;
    const cardX = GAME_WIDTH / 2 - cardWidth / 2;
    const cardY = GAME_HEIGHT / 2 - cardHeight / 2;

    // Card container — starts above screen, slides down
    const cardContainer = this.add.container(0, -cardHeight - 50);
    cardContainer.setDepth(200);

    // Card background with warm brown border
    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0xfff8e1, 1); // cream background
    cardGfx.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
    cardGfx.lineStyle(4, 0x5d4037, 1); // warm brown border >= 3px
    cardGfx.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
    cardContainer.add(cardGfx);

    // "New Toy!" header
    const headerText = this.add.text(GAME_WIDTH / 2, cardY + 20, 'New Toy!', {
      fontSize: '20px',
      color: '#5d4037',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    cardContainer.add(headerText);

    // Defender visual at >= 1.5x scale — occupying >= 40% of card height
    const previewY = cardY + cardHeight * 0.38;
    const previewContainer = this.add.container(GAME_WIDTH / 2, previewY);
    const previewGfx = this.add.graphics();
    const drawFn = DRAW_DEFENDER[defenderKey];
    if (drawFn) {
      drawFn(previewGfx);
    }
    previewContainer.add(previewGfx);
    previewContainer.setScale(2.0); // >= 1.5x scale
    cardContainer.add(previewContainer);

    // Toy name — >= 18px monospace
    const nameText = this.add.text(GAME_WIDTH / 2, cardY + cardHeight * 0.62, type.name, {
      fontSize: '20px',
      color: '#3e2723',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    cardContainer.add(nameText);

    // Cost
    const costText = this.add.text(GAME_WIDTH / 2, cardY + cardHeight * 0.70, `${type.cost} sparks`, {
      fontSize: '16px',
      color: '#ff8f00',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    cardContainer.add(costText);

    // Bio text — >= 14px monospace, word-wrapped
    const bioText = this.add.text(GAME_WIDTH / 2, cardY + cardHeight * 0.80, type.bio, {
      fontSize: '14px',
      color: '#5d4037',
      fontFamily: 'monospace',
      wordWrap: { width: cardWidth - 30 },
      align: 'center',
    }).setOrigin(0.5);
    cardContainer.add(bioText);

    // Slide-in animation (300-500ms)
    this.tweens.add({
      targets: cardContainer,
      y: 0,
      duration: 400,
      ease: 'Back.easeOut',
    });

    // "Collect!" button at depth 201
    const btnWidth = 140;
    const btnHeight = 48;
    const btnX = GAME_WIDTH / 2 - btnWidth / 2;
    const btnY = cardY + cardHeight + 15;

    const btnContainer = this.add.container(0, -cardHeight - 50);
    btnContainer.setDepth(201);

    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x4caf50, 1);
    btnGfx.fillRoundedRect(btnX, btnY, btnWidth, btnHeight, 8);
    btnGfx.lineStyle(2, 0x388e3c, 1);
    btnGfx.strokeRoundedRect(btnX, btnY, btnWidth, btnHeight, 8);
    btnContainer.add(btnGfx);

    const btnText = this.add.text(GAME_WIDTH / 2, btnY + btnHeight / 2, 'Collect!', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    btnContainer.add(btnText);

    // Hit area >= 48x48
    const btnZone = this.add.zone(btnX, btnY, btnWidth, btnHeight)
      .setOrigin(0).setInteractive({ useHandCursor: true });
    btnContainer.add(btnZone);

    // Slide button in with the card
    this.tweens.add({
      targets: btnContainer,
      y: 0,
      duration: 400,
      ease: 'Back.easeOut',
    });

    btnZone.on('pointerdown', () => {
      btnZone.disableInteractive();
      this.markBioShown(defenderKey);
      this.transitionToLevelSelect({ won: true, levelIndex });
    });
  }

  private transitionToLevelSelect(data: { won: boolean; levelIndex?: number }): void {
    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LevelSelectScene', {
        completedLevel: data.won ? data.levelIndex : undefined,
        won: data.won,
      });
    });
  }
}
