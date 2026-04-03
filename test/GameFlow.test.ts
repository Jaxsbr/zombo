import { describe, it, expect } from 'vitest';
import { GameFlow, GameFlowEnemy } from '../src/systems/GameFlow';

describe('GameFlow', () => {
  it('starts in playing state', () => {
    const gf = new GameFlow();
    expect(gf.getState()).toBe('playing');
  });

  it('changes to lost when enemy reaches column 0', () => {
    const gf = new GameFlow();
    const enemies: GameFlowEnemy[] = [
      { x: 0, health: 50 },
    ];
    gf.update(enemies, false);
    expect(gf.getState()).toBe('lost');
  });

  it('changes to lost when enemy goes past column 0', () => {
    const gf = new GameFlow();
    const enemies: GameFlowEnemy[] = [
      { x: -0.5, health: 50 },
    ];
    gf.update(enemies, false);
    expect(gf.getState()).toBe('lost');
  });

  it('does not lose from dead enemy at column 0', () => {
    const gf = new GameFlow();
    const enemies: GameFlowEnemy[] = [
      { x: 0, health: 0 },
    ];
    gf.update(enemies, false);
    expect(gf.getState()).toBe('playing');
  });

  it('changes to won when all waves done and no enemies alive', () => {
    const gf = new GameFlow();
    const enemies: GameFlowEnemy[] = [
      { x: 5, health: 0 },
      { x: 3, health: 0 },
    ];
    gf.update(enemies, true);
    expect(gf.getState()).toBe('won');
  });

  it('does not win when enemies still alive', () => {
    const gf = new GameFlow();
    const enemies: GameFlowEnemy[] = [
      { x: 5, health: 10 },
    ];
    gf.update(enemies, true);
    expect(gf.getState()).toBe('playing');
  });

  it('does not win when waves not complete', () => {
    const gf = new GameFlow();
    const enemies: GameFlowEnemy[] = [];
    gf.update(enemies, false);
    expect(gf.getState()).toBe('playing');
  });

  it('wins with empty enemy list when waves complete', () => {
    const gf = new GameFlow();
    gf.update([], true);
    expect(gf.getState()).toBe('won');
  });

  it('does not change state after winning', () => {
    const gf = new GameFlow();
    gf.update([], true);
    expect(gf.getState()).toBe('won');
    // Even with a new enemy at col 0, state should stay won
    gf.update([{ x: 0, health: 50 }], true);
    expect(gf.getState()).toBe('won');
  });

  it('does not change state after losing', () => {
    const gf = new GameFlow();
    gf.update([{ x: 0, health: 50 }], false);
    expect(gf.getState()).toBe('lost');
    // Even with no enemies and waves complete, state should stay lost
    gf.update([], true);
    expect(gf.getState()).toBe('lost');
  });

  it('resets to playing state', () => {
    const gf = new GameFlow();
    gf.update([{ x: 0, health: 50 }], false);
    expect(gf.getState()).toBe('lost');
    gf.reset();
    expect(gf.getState()).toBe('playing');
  });
});
