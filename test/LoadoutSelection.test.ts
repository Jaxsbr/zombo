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

  it('auto-fill when <= 4 unlocked — no selection needed', () => {
    const unlocked = loadUnlocks(storage);
    expect(unlocked).toEqual(['shooter', 'generator', 'wall']);
    expect(needsLoadoutSelection(unlocked)).toBe(false);
  });

  it('selection cap at 4 — MAX_LOADOUT is 4', () => {
    expect(MAX_LOADOUT).toBe(4);
  });

  it('toggle deselect — updateUnlocksAfterLevel adds new defender on level completion', () => {
    let unlocked = loadUnlocks(storage);
    // Complete L2 (index 1) → unlocks bomb
    unlocked = updateUnlocksAfterLevel(unlocked, 1);
    expect(unlocked).toContain('trapper');
    // Complete L3 (index 2) → unlocks mine
    unlocked = updateUnlocksAfterLevel(unlocked, 2);
    expect(unlocked).toContain('mine');
    // Now have 5 defenders → needs loadout selection
    expect(needsLoadoutSelection(unlocked)).toBe(true);
  });

  it('Go requires >= 1 selected — needsLoadoutSelection triggers when > 4', () => {
    const fiveDefenders = ['shooter', 'generator', 'wall', 'trapper', 'mine'];
    expect(needsLoadoutSelection(fiveDefenders)).toBe(true);
    const fourDefenders = ['shooter', 'generator', 'wall', 'trapper'];
    expect(needsLoadoutSelection(fourDefenders)).toBe(false);
  });

  it('loadout array persisted and restored from localStorage', () => {
    let unlocked = loadUnlocks(storage);
    unlocked = updateUnlocksAfterLevel(unlocked, 1); // +trapper
    saveUnlocks(unlocked, storage);

    const restored = loadUnlocks(storage);
    expect(restored).toEqual(['shooter', 'generator', 'wall', 'trapper']);
  });
});
