import Phaser from 'phaser';
import { TitleScene } from '../scenes/TitleScene';
import { LevelSelectScene } from '../scenes/LevelSelectScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';

export const GRID_ROWS = 5;
export const GRID_COLS = 9;
export const CELL_SIZE = 64;
export const HUD_HEIGHT = 80;

export const GAME_WIDTH = GRID_COLS * CELL_SIZE;
export const GAME_HEIGHT = GRID_ROWS * CELL_SIZE + HUD_HEIGHT;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#5d4037',
  scene: [TitleScene, LevelSelectScene, GameScene, GameOverScene],
};
