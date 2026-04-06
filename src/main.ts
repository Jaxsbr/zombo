import Phaser from 'phaser';
import { gameConfig } from './config/game';

const game = new Phaser.Game(gameConfig);

// QA helper — call zomboReset() in browser console to wipe all save data and restart
(window as unknown as Record<string, unknown>).zomboReset = () => {
  const keys = Object.keys(localStorage).filter(
    k => k === 'zombo_progress' || k === 'zombo_unlocks' || k === 'tutorial_complete'
      || k.startsWith('bio_shown_defender_') || k.startsWith('bio_shown_enemy_'),
  );
  keys.forEach(k => localStorage.removeItem(k));
  console.log(`zomboReset: cleared ${keys.length} keys — ${keys.join(', ')}`);
  game.scene.start('TitleScene');
};

export { game };
