import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUnlockedDefenders,
  loadUnlocks,
  saveUnlocks,
  updateUnlocksAfterLevel,
  needsLoadoutSelection,
  MAX_LOADOUT,
} from '../src/systems/DefenderUnlocks';

class MockStorage implements Storage {
  private data: Map<string, string> = new Map();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  key(_index: number): string | null { return null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(key, value); }
}

describe('DefenderUnlocks', () => {
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
  });

  it('initial defenders are generator and shooter', () => {
    const unlocked = loadUnlocks(storage);
    expect(unlocked).toEqual(['generator', 'shooter']);
    expect(needsLoadoutSelection(unlocked)).toBe(false);
  });

  it('selection cap at 4 — MAX_LOADOUT is 4', () => {
    expect(MAX_LOADOUT).toBe(4);
  });

  it('completing L3 (index 2) unlocks Block Tower', () => {
    let unlocked = loadUnlocks(storage);
    // Complete L3 (index 2) → unlocks wall (Block Tower)
    unlocked = updateUnlocksAfterLevel(unlocked, 2);
    expect(unlocked).toContain('wall');
    expect(unlocked).toHaveLength(3);
    // 3 defenders < 4 → no loadout selection needed
    expect(needsLoadoutSelection(unlocked)).toBe(false);
  });

  it('completing L1 or L2 does not unlock anything', () => {
    let unlocked = loadUnlocks(storage);
    unlocked = updateUnlocksAfterLevel(unlocked, 0);
    expect(unlocked).toHaveLength(2);
    unlocked = updateUnlocksAfterLevel(unlocked, 1);
    expect(unlocked).toHaveLength(2);
  });

  it('trapper and mine are not in initial defenders or unlock map', () => {
    let unlocked = loadUnlocks(storage);
    expect(unlocked).not.toContain('trapper');
    expect(unlocked).not.toContain('mine');
    // Complete all levels — only wall should be added
    for (let i = 0; i < 5; i++) {
      unlocked = updateUnlocksAfterLevel(unlocked, i);
    }
    expect(unlocked).not.toContain('trapper');
    expect(unlocked).not.toContain('mine');
  });

  it('loadout array persisted and restored from localStorage', () => {
    let unlocked = loadUnlocks(storage);
    unlocked = updateUnlocksAfterLevel(unlocked, 2); // +wall
    saveUnlocks(unlocked, storage);

    const restored = loadUnlocks(storage);
    expect(restored).toEqual(['generator', 'shooter', 'wall']);
  });
});
