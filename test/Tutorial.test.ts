import { describe, it, expect } from 'vitest';
import { Tutorial } from '../src/systems/Tutorial';

class MockStorage implements Storage {
  private data: Map<string, string> = new Map();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  key(_index: number): string | null { return null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(key, value); }
}

describe('Tutorial — state machine', () => {
  it('starts in PLACE_GENERATOR step', () => {
    const t = new Tutorial();
    expect(t.step).toBe('PLACE_GENERATOR');
    expect(t.isComplete).toBe(false);
  });

  it('PLACE_GENERATOR → COLLECT_SPARK on generator placement', () => {
    const t = new Tutorial();
    t.onDefenderPlaced('generator');
    expect(t.step).toBe('COLLECT_SPARK');
  });

  it('PLACE_GENERATOR does not advance on non-generator placement', () => {
    const t = new Tutorial();
    t.onDefenderPlaced('shooter');
    expect(t.step).toBe('PLACE_GENERATOR');
    t.onDefenderPlaced('wall');
    expect(t.step).toBe('PLACE_GENERATOR');
  });

  it('COLLECT_SPARK → PLACE_PISTOL when balance >= pistol cost', () => {
    const t = new Tutorial();
    t.onDefenderPlaced('generator');
    expect(t.step).toBe('COLLECT_SPARK');
    // Not enough yet
    t.onSparkCollected(75, 100);
    expect(t.step).toBe('COLLECT_SPARK');
    // Enough now
    t.onSparkCollected(100, 100);
    expect(t.step).toBe('PLACE_PISTOL');
  });

  it('PLACE_PISTOL → COMPLETE on shooter placement', () => {
    const t = new Tutorial();
    t.onDefenderPlaced('generator');
    t.onSparkCollected(100, 100);
    expect(t.step).toBe('PLACE_PISTOL');
    t.onDefenderPlaced('shooter');
    expect(t.step).toBe('COMPLETE');
    expect(t.isComplete).toBe(true);
  });

  it('full transition: PLACE_GENERATOR → COLLECT_SPARK → PLACE_PISTOL → COMPLETE', () => {
    const t = new Tutorial();
    expect(t.step).toBe('PLACE_GENERATOR');

    t.onDefenderPlaced('generator');
    expect(t.step).toBe('COLLECT_SPARK');

    t.onSparkCollected(125, 100);
    expect(t.step).toBe('PLACE_PISTOL');

    t.onDefenderPlaced('shooter');
    expect(t.step).toBe('COMPLETE');
  });

  it('spark collection in wrong step does not advance', () => {
    const t = new Tutorial();
    // In PLACE_GENERATOR step — spark collection should not advance
    t.onSparkCollected(200, 100);
    expect(t.step).toBe('PLACE_GENERATOR');
  });

  it('defender placement in COLLECT_SPARK step (non-shooter) does not advance', () => {
    const t = new Tutorial();
    t.onDefenderPlaced('generator');
    expect(t.step).toBe('COLLECT_SPARK');
    // Placing another generator should not advance
    t.onDefenderPlaced('generator');
    expect(t.step).toBe('COLLECT_SPARK');
  });
});

describe('Tutorial — localStorage persistence', () => {
  it('hasCompleted returns false when not yet completed', () => {
    const storage = new MockStorage();
    expect(Tutorial.hasCompleted(storage)).toBe(false);
  });

  it('markComplete sets localStorage, hasCompleted returns true', () => {
    const storage = new MockStorage();
    Tutorial.markComplete(storage);
    expect(Tutorial.hasCompleted(storage)).toBe(true);
  });

  it('hasCompleted tolerates missing localStorage gracefully', () => {
    // Pass undefined — should not throw
    expect(() => Tutorial.hasCompleted(undefined as unknown as Storage)).not.toThrow();
  });
});
