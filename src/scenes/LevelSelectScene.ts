import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game';
import { DEFENDER_TYPES } from '../config/defenders';
import { ENEMY_TYPES } from '../config/enemies';
import { DRAW_DEFENDER } from '../entities/DefenderEntity';
import { DRAW_ENEMY } from '../entities/EnemyEntity';
import { ALL_LEVELS } from '../config/levels';
import { loadProgress, saveProgress, completeLevel, getLevelState, ProgressData } from '../systems/LevelProgress';
import { loadUnlocks, saveUnlocks, updateUnlocksAfterLevel, needsLoadoutSelection, MAX_LOADOUT } from '../systems/DefenderUnlocks';

const BIO_SHOWN_ENEMY_PREFIX = 'bio_shown_enemy_';

const FADE_DURATION = 600;

export class LevelSelectScene extends Phaser.Scene {
  private progress!: ProgressData;
  private unlocked!: string[];
  private pendingLevelIndex: number = 0;
  private loadoutMode: boolean = false;
  private selectedLoadout: Set<string> = new Set();
  private loadoutCards: Map<string, { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics }> = new Map();
  private loadoutCardWidth: number = 100;
  private loadoutCardHeight: number = 120;
  private goButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(data?: { completedLevel?: number; won?: boolean; selectedLevel?: number }): void {
    this.cameras.main.fadeIn(FADE_DURATION, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#5d4037');
    this.loadoutMode = false;
    this.selectedLoadout = new Set();
    this.loadoutCards = new Map();

    // Handle level completion from GameOverScene
    this.progress = loadProgress();
    this.unlocked = loadUnlocks();
    if (data?.completedLevel !== undefined && data.won) {
      this.progress = completeLevel(this.progress, data.completedLevel);
      saveProgress(this.progress);
      this.unlocked = updateUnlocksAfterLevel(this.unlocked, data.completedLevel);
      saveUnlocks(this.unlocked);
    }

    this.drawBackground();
    this.drawTitle();
    const selectedLevel = (this.scene.settings.data as { selectedLevel?: number })?.selectedLevel;
    this.drawLevelEntries(selectedLevel);
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.lineStyle(1, 0x4e342e, 0.3);
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
    bg.fillStyle(0x8d6e63, 0.15);
    bg.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 350, 140);
    bg.fillStyle(0x3e2723, 0.25);
    bg.fillRect(8, 8, 55, 70);
    bg.fillRect(GAME_WIDTH - 65, 15, 55, 55);
  }

  private drawTitle(): void {
    this.add.text(GAME_WIDTH / 2, 35, 'Choose a Level', {
      fontSize: '28px',
      color: '#ffc107',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Back button (top-left, hit area ≥ 48×48)
    const backBg = this.add.graphics();
    backBg.fillStyle(0x3e2723, 1);
    backBg.fillRoundedRect(8, 8, 60, 36, 6);
    backBg.lineStyle(2, 0xffc107, 1);
    backBg.strokeRoundedRect(8, 8, 60, 36, 6);
    this.add.text(38, 26, '\u2190 Back', { fontSize: '13px', color: '#ffc107', fontFamily: 'monospace' }).setOrigin(0.5);
    const backZone = this.add.zone(8, 8, 60, 48).setOrigin(0).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }

  private drawLevelEntries(selectedLevel?: number): void {
    const entryWidth = 90;
    const entryHeight = 100;
    const gap = 16;
    const totalWidth = 5 * entryWidth + 4 * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const totalRowsHeight = 2 * entryHeight + gap;
    const startY = (GAME_HEIGHT - totalRowsHeight) / 2;

    // Row 1: levels 1-5 (indices 0-4)
    for (let i = 0; i < 5; i++) {
      const x = startX + i * (entryWidth + gap);
      const state = getLevelState(this.progress, i);
      this.drawLevelEntry(x, startY, entryWidth, entryHeight, i, state);
      if (selectedLevel === i) {
        this.drawSelectionHighlight(x, startY, entryWidth, entryHeight);
      }
    }

    // Row 2: levels 6-10 (indices 5-9)
    const row2Y = startY + entryHeight + gap;
    for (let i = 5; i < 10; i++) {
      const x = startX + (i - 5) * (entryWidth + gap);
      const state = getLevelState(this.progress, i);
      this.drawLevelEntry(x, row2Y, entryWidth, entryHeight, i, state);
      if (selectedLevel === i) {
        this.drawSelectionHighlight(x, row2Y, entryWidth, entryHeight);
      }
    }
  }

  private drawSelectionHighlight(x: number, y: number, width: number, height: number): void {
    const highlight = this.add.graphics();
    highlight.lineStyle(3, 0xffffff, 0.9);
    highlight.strokeRoundedRect(x - 3, y - 3, width + 6, height + 6, 10);
    highlight.lineStyle(1, 0xffc107, 0.6);
    highlight.strokeRoundedRect(x - 6, y - 6, width + 12, height + 12, 12);
  }

  private drawLevelEntry(
    x: number, y: number, width: number, height: number,
    levelIndex: number, state: 'locked' | 'unlocked' | 'completed',
  ): void {
    const g = this.add.graphics();

    if (state === 'locked') {
      g.fillStyle(0x3e2723, 0.5);
      g.fillRoundedRect(x, y, width, height, 8);
      g.lineStyle(1, 0x5d4037, 0.3);
      g.strokeRoundedRect(x, y, width, height, 8);
      g.fillStyle(0x795548, 0.4);
      g.fillCircle(x + width / 2, y + 40, 10);
      g.fillRect(x + width / 2 - 8, y + 45, 16, 12);
      this.add.text(x + width / 2, y + height - 18, `${levelIndex + 1}`, {
        fontSize: '18px', color: '#5d4037', fontFamily: 'monospace',
      }).setOrigin(0.5);
    } else {
      const boxColor = state === 'completed' ? 0x4caf50 : 0xffc107;
      const borderColor = state === 'completed' ? 0x388e3c : 0xff9800;

      g.fillStyle(boxColor, 1);
      g.fillRoundedRect(x, y, width, height, 8);
      g.lineStyle(2, borderColor, 1);
      g.strokeRoundedRect(x, y, width, height, 8);
      g.lineStyle(1, borderColor, 0.5);
      g.lineBetween(x + 4, y + 20, x + width - 4, y + 20);

      this.add.text(x + width / 2, y + 50, `${levelIndex + 1}`, {
        fontSize: '32px', color: '#3e2723', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5);

      if (state === 'completed') {
        this.add.text(x + width / 2, y + height - 16, '\u2605', {
          fontSize: '16px', color: '#ffeb3b', fontFamily: 'monospace',
        }).setOrigin(0.5);
      }

      const zone = this.add.zone(x, y, width, height)
        .setOrigin(0).setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.startLevel(levelIndex);
      });
    }
  }

  private startLevel(levelIndex: number): void {
    this.pendingLevelIndex = levelIndex;
    const levelConfig = ALL_LEVELS[levelIndex];

    // Check for enemy bio overlay before starting
    if (levelConfig?.enemyBio) {
      const enemyKey = levelConfig.enemyBio.enemyKey;
      if (!this.hasShownEnemyBio(enemyKey)) {
        this.showEnemyBio(enemyKey, () => {
          this.proceedToGame();
        });
        return;
      }
    }

    this.proceedToGame();
  }

  private proceedToGame(): void {
    if (needsLoadoutSelection(this.unlocked)) {
      this.showLoadoutSelection();
    } else {
      this.launchGame(this.unlocked);
    }
  }

  private hasShownEnemyBio(key: string): boolean {
    try {
      return localStorage.getItem(`${BIO_SHOWN_ENEMY_PREFIX}${key}`) === 'true';
    } catch {
      return false;
    }
  }

  private showEnemyBio(enemyKey: string, onDismiss: () => void): void {
    const enemyType = ENEMY_TYPES[enemyKey];
    if (!enemyType || !enemyType.bio) {
      onDismiss();
      return;
    }

    // Dimmed background overlay — interactive to block clicks on lower-depth objects
    const dimBg = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7,
    );
    dimBg.setDepth(199);
    dimBg.setInteractive();

    // Card dimensions — tall enough to fit header, visual, name, bio, and button inside border
    const cardWidth = 250;
    const cardHeight = 370;
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

    // "Watch Out!" header
    const headerText = this.add.text(GAME_WIDTH / 2, cardY + 18, 'Watch Out!', {
      fontSize: '20px',
      color: '#c62828',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    cardContainer.add(headerText);

    // Enemy visual at >= 1.5x scale
    const previewY = cardY + 100;
    const previewContainer = this.add.container(GAME_WIDTH / 2, previewY);
    const previewGfx = this.add.graphics();
    const drawFn = DRAW_ENEMY[enemyKey];
    if (drawFn) {
      drawFn(previewGfx);
    }
    previewContainer.add(previewGfx);
    previewContainer.setScale(2.0); // >= 1.5x scale
    cardContainer.add(previewContainer);

    // Enemy name — >= 18px monospace
    const nameText = this.add.text(GAME_WIDTH / 2, cardY + 175, enemyType.name, {
      fontSize: '20px',
      color: '#3e2723',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    cardContainer.add(nameText);

    // Bio text — >= 14px monospace, word-wrapped
    const bioText = this.add.text(GAME_WIDTH / 2, cardY + 230, enemyType.bio, {
      fontSize: '14px',
      color: '#5d4037',
      fontFamily: 'monospace',
      wordWrap: { width: cardWidth - 30 },
      align: 'center',
    }).setOrigin(0.5);
    cardContainer.add(bioText);

    // "Continue" button inside card
    const btnWidth = 140;
    const btnHeight = 48;
    const btnX = GAME_WIDTH / 2 - btnWidth / 2;
    const btnY = cardY + cardHeight - btnHeight - 15;

    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x1565c0, 1);
    btnGfx.fillRoundedRect(btnX, btnY, btnWidth, btnHeight, 8);
    btnGfx.lineStyle(2, 0x0d47a1, 1);
    btnGfx.strokeRoundedRect(btnX, btnY, btnWidth, btnHeight, 8);
    cardContainer.add(btnGfx);

    const btnText = this.add.text(GAME_WIDTH / 2, btnY + btnHeight / 2, 'Continue', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    cardContainer.add(btnText);

    // Hit area >= 48x48 — inside card at depth 201
    const btnZone = this.add.zone(btnX, btnY, btnWidth, btnHeight)
      .setOrigin(0).setInteractive({ useHandCursor: true });
    btnZone.setDepth(201);
    cardContainer.add(btnZone);

    // Slide-in animation (300-500ms)
    this.tweens.add({
      targets: cardContainer,
      y: 0,
      duration: 400,
      ease: 'Back.easeOut',
    });

    btnZone.on('pointerdown', () => {
      btnZone.disableInteractive();
      try {
        localStorage.setItem(`${BIO_SHOWN_ENEMY_PREFIX}${enemyKey}`, 'true');
      } catch {
        // localStorage unavailable
      }
      // Clean up overlay
      dimBg.destroy();
      cardContainer.destroy();
      onDismiss();
    });
  }

  private showLoadoutSelection(): void {
    this.loadoutMode = true;
    this.selectedLoadout = new Set();
    this.loadoutCards = new Map();

    // Dim the level entries
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x3e2723, 1,
    );
    overlay.setDepth(10);

    // Title — proportional font size
    const titleSize = Math.floor(GAME_HEIGHT * 0.07);
    const title = this.add.text(GAME_WIDTH / 2, Math.floor(GAME_HEIGHT * 0.1), 'Pick Your Toys', {
      fontSize: `${titleSize}px`, color: '#ffc107', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: Math.ceil(titleSize * 0.1),
    }).setOrigin(0.5);
    title.setDepth(11);

    const subtitleSize = Math.floor(GAME_HEIGHT * 0.04);
    const subtitle = this.add.text(GAME_WIDTH / 2, Math.floor(GAME_HEIGHT * 0.17), `Choose up to ${MAX_LOADOUT} defenders`, {
      fontSize: `${subtitleSize}px`, color: '#bcaaa4', fontFamily: 'monospace',
    }).setOrigin(0.5);
    subtitle.setDepth(11);

    // Proportional card layout — derived from GAME_WIDTH and GAME_HEIGHT
    // 2-row grid when 6+ defenders; single row for ≤5
    const padding = Math.floor(GAME_WIDTH * 0.05);
    const gap = Math.floor(GAME_WIDTH * 0.02);
    const availableWidth = GAME_WIDTH - 2 * padding;
    const usesTwoRows = this.unlocked.length > 5;
    const topRowCount = usesTwoRows ? Math.ceil(this.unlocked.length / 2) : this.unlocked.length;
    const bottomRowCount = usesTwoRows ? this.unlocked.length - topRowCount : 0;
    const cardWidth = Math.floor((availableWidth - (topRowCount - 1) * gap) / topRowCount);
    const cardHeight = usesTwoRows ? Math.floor(GAME_HEIGHT * 0.28) : Math.floor(GAME_HEIGHT * 0.45);
    const rowGap = Math.floor(GAME_HEIGHT * 0.03);
    this.loadoutCardWidth = cardWidth;
    this.loadoutCardHeight = cardHeight;
    const startY = Math.floor(GAME_HEIGHT * 0.24);
    const cornerRadius = Math.floor(cardWidth * 0.08);

    // Preview scale — proportional to card size, capped by both width and height
    const previewScale = Math.max(1.2, Math.min((cardWidth / 110) * 2, (cardHeight / 90) * 1.5));

    for (let i = 0; i < this.unlocked.length; i++) {
      const key = this.unlocked[i];
      const type = DEFENDER_TYPES[key];

      // Compute row and column position
      let row: number, col: number, rowCount: number;
      if (!usesTwoRows) {
        row = 0;
        col = i;
        rowCount = this.unlocked.length;
      } else if (i < topRowCount) {
        row = 0;
        col = i;
        rowCount = topRowCount;
      } else {
        row = 1;
        col = i - topRowCount;
        rowCount = bottomRowCount;
      }

      const rowTotalWidth = rowCount * cardWidth + (rowCount - 1) * gap;
      const rowStartX = (GAME_WIDTH - rowTotalWidth) / 2;
      const x = rowStartX + col * (cardWidth + gap);
      const cardY = startY + row * (cardHeight + rowGap);

      const entryOffset = Math.floor(GAME_HEIGHT * 0.08);
      const container = this.add.container(x, cardY + entryOffset);
      container.setDepth(11);
      container.setAlpha(0);

      const bg = this.add.graphics();
      bg.fillStyle(0x334155, 1);
      bg.fillRoundedRect(0, 0, cardWidth, cardHeight, cornerRadius);
      container.add(bg);

      // Name text — proportional to card width
      const nameSize = Math.max(9, Math.floor(cardWidth * 0.12));
      const nameText = this.add.text(cardWidth / 2, Math.floor(cardHeight * 0.04), type.name, {
        fontSize: `${nameSize}px`, color: '#e2e8f0', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5, 0);
      if (nameText.width > cardWidth - Math.floor(cardWidth * 0.1)) {
        nameText.setScale((cardWidth - Math.floor(cardWidth * 0.1)) / nameText.width);
      }
      container.add(nameText);

      // Defender preview — larger, centered in card body
      const previewY = Math.floor(cardHeight * 0.42);
      const previewContainer = this.add.container(cardWidth / 2, previewY);
      const previewGfx = this.add.graphics();
      const drawFn = DRAW_DEFENDER[key];
      if (drawFn) {
        drawFn(previewGfx);
      }
      previewContainer.add(previewGfx);
      previewContainer.setScale(previewScale);
      container.add(previewContainer);

      // Idle bob animation on defender preview
      this.tweens.add({
        targets: previewContainer,
        y: previewY - Math.floor(cardHeight * 0.03),
        duration: 1200 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Cost label — proportional font
      const costSize = Math.max(12, Math.floor(cardWidth * 0.15));
      const costText = this.add.text(cardWidth / 2, cardHeight - Math.floor(cardHeight * 0.1), `${type.cost}`, {
        fontSize: `${costSize}px`, color: '#ffc107', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 1,
      }).setOrigin(0.5);
      container.add(costText);

      const zone = this.add.zone(0, 0, cardWidth, cardHeight)
        .setOrigin(0).setInteractive({ useHandCursor: true });
      container.add(zone);

      zone.on('pointerdown', () => {
        this.toggleLoadoutCard(key);
      });

      this.loadoutCards.set(key, { container, bg });

      // Staggered entry animation — cards slide up and fade in
      this.tweens.add({
        targets: container,
        alpha: 1,
        y: cardY,
        duration: 400,
        delay: i * 120,
        ease: 'Back.easeOut',
      });
    }

    // Go button — proportional sizing
    const btnWidth = Math.floor(GAME_WIDTH * 0.18);
    const btnHeight = Math.floor(GAME_HEIGHT * 0.1);
    this.goButton = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - Math.floor(GAME_HEIGHT * 0.12));
    this.goButton.setDepth(11);

    const goBg = this.add.graphics();
    goBg.fillStyle(0x3e2723, 0.8);
    goBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, cornerRadius);
    this.goButton.add(goBg);

    const goFontSize = Math.floor(btnHeight * 0.55);
    const goText = this.add.text(0, 0, 'Go!', {
      fontSize: `${goFontSize}px`, color: '#5d4037', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.goButton.add(goText);
    this.goButton.setData('bg', goBg);
    this.goButton.setData('text', goText);
    this.goButton.setData('btnWidth', btnWidth);
    this.goButton.setData('btnHeight', btnHeight);
    this.goButton.setData('cornerRadius', cornerRadius);

    const goZone = this.add.zone(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight)
      .setOrigin(0).setInteractive({ useHandCursor: true });
    this.goButton.add(goZone);

    goZone.on('pointerdown', () => {
      if (this.selectedLoadout.size >= 1) {
        this.launchGame([...this.selectedLoadout]);
      }
    });

    this.updateLoadoutVisuals();
  }

  private toggleLoadoutCard(key: string): void {
    if (this.selectedLoadout.has(key)) {
      this.selectedLoadout.delete(key);
    } else if (this.selectedLoadout.size < MAX_LOADOUT) {
      this.selectedLoadout.add(key);
    }
    // If already at max, don't add — selection cap enforced
    this.updateLoadoutVisuals();

    // Selection bounce animation on the toggled card
    const card = this.loadoutCards.get(key);
    if (card) {
      this.tweens.add({
        targets: card.container,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }
  }

  private updateLoadoutVisuals(): void {
    const cw = this.loadoutCardWidth;
    const ch = this.loadoutCardHeight;
    const cr = Math.floor(cw * 0.08);
    for (const [key, { bg }] of this.loadoutCards) {
      bg.clear();
      if (this.selectedLoadout.has(key)) {
        bg.fillStyle(0x475569, 1);
        bg.fillRoundedRect(0, 0, cw, ch, cr);
        bg.lineStyle(3, 0xffc107, 1);
        bg.strokeRoundedRect(0, 0, cw, ch, cr);
      } else {
        bg.fillStyle(0x334155, 1);
        bg.fillRoundedRect(0, 0, cw, ch, cr);
      }
    }

    // Update Go button state
    const goBg = this.goButton.getData('bg') as Phaser.GameObjects.Graphics;
    const goText = this.goButton.getData('text') as Phaser.GameObjects.Text;
    const btnW = this.goButton.getData('btnWidth') as number;
    const btnH = this.goButton.getData('btnHeight') as number;
    const btnCr = this.goButton.getData('cornerRadius') as number;
    const active = this.selectedLoadout.size >= 1;
    goBg.clear();
    goBg.fillStyle(active ? 0x4caf50 : 0x3e2723, active ? 1 : 0.8);
    goBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, btnCr);
    if (active) {
      goBg.lineStyle(2, 0x388e3c, 1);
      goBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, btnCr);
    }
    goText.setColor(active ? '#ffffff' : '#5d4037');
  }

  private launchGame(loadout: string[]): void {
    this.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', {
        levelConfig: ALL_LEVELS[this.pendingLevelIndex],
        levelIndex: this.pendingLevelIndex,
        loadout,
      });
    });
  }
}
