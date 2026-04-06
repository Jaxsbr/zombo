import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadProgress,
  saveProgress,
  completeLevel,
  getLevelState,
  nextUnbeatenLevel,
  ProgressData,
} from '../src/systems/LevelProgress';

// Simple in-memory Storage mock
class MockStorage implements Storage {
  private data: Map<string, string> = new Map();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  key(_index: number): string | null { return null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(key, value); }
}

describe('LevelProgress', () => {
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
  });

  it('initial state: L1 unlocked, rest locked', () => {
    const progress = loadProgress(storage);
    expect(getLevelState(progress, 0)).toBe('unlocked');
    expect(getLevelState(progress, 1)).toBe('locked');
    expect(getLevelState(progress, 2)).toBe('locked');
    expect(getLevelState(progress, 3)).toBe('locked');
    expect(getLevelState(progress, 4)).toBe('locked');
  });

  it('completing L1 unlocks L2', () => {
    let progress = loadProgress(storage);
    progress = completeLevel(progress, 0);
    expect(getLevelState(progress, 0)).toBe('completed');
    expect(getLevelState(progress, 1)).toBe('unlocked');
  });

  it('completing L5 = all completed', () => {
    let progress = loadProgress(storage);
    for (let i = 0; i < 5; i++) {
      progress = completeLevel(progress, i);
    }
    for (let i = 0; i < 5; i++) {
      expect(getLevelState(progress, i)).toBe('completed');
    }
  });

  it('localStorage round-trip persistence', () => {
    let progress = loadProgress(storage);
    progress = completeLevel(progress, 0);
    progress = completeLevel(progress, 1);
    saveProgress(progress, storage);

    // Reload from same storage
    const restored = loadProgress(storage);
    expect(getLevelState(restored, 0)).toBe('completed');
    expect(getLevelState(restored, 1)).toBe('completed');
    expect(getLevelState(restored, 2)).toBe('unlocked');
    expect(getLevelState(restored, 3)).toBe('locked');
  });

  it('nextUnbeatenLevel: no completions returns 0 (L1 is unlocked by default)', () => {
    const progress = loadProgress(storage);
    expect(nextUnbeatenLevel(progress)).toBe(0);
  });

  it('nextUnbeatenLevel: levels 0–3 completed returns 4', () => {
    let progress = loadProgress(storage);
    for (let i = 0; i < 4; i++) progress = completeLevel(progress, i);
    expect(nextUnbeatenLevel(progress)).toBe(4);
  });

  it('nextUnbeatenLevel: all 9 completed returns 8 (last index)', () => {
    let progress = loadProgress(storage);
    for (let i = 0; i < 9; i++) progress = completeLevel(progress, i);
    expect(nextUnbeatenLevel(progress)).toBe(8);
  });

  it('replaying completed level does not change unlock state', () => {
    let progress = loadProgress(storage);
    progress = completeLevel(progress, 0);
    progress = completeLevel(progress, 1);
    // Replay L1
    progress = completeLevel(progress, 0);
    // L2 should still be completed, not reverted
    expect(getLevelState(progress, 0)).toBe('completed');
    expect(getLevelState(progress, 1)).toBe('completed');
    expect(getLevelState(progress, 2)).toBe('unlocked');
  });
});
