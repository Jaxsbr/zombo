import { describe, it, expect } from 'vitest';
import { Economy } from '../src/systems/Economy';

describe('Economy', () => {
  it('starts with configurable balance', () => {
    const eco = new Economy(200);
    expect(eco.getBalance()).toBe(200);
  });

  it('adds income to balance', () => {
    const eco = new Economy(50);
    eco.addIncome(25);
    expect(eco.getBalance()).toBe(75);
  });

  it('spends when sufficient funds', () => {
    const eco = new Economy(100);
    const result = eco.spend(50);
    expect(result).toBe(true);
    expect(eco.getBalance()).toBe(50);
  });

  it('rejects spend when insufficient funds', () => {
    const eco = new Economy(30);
    const result = eco.spend(50);
    expect(result).toBe(false);
    expect(eco.getBalance()).toBe(30);
  });

  it('allows spending exact balance', () => {
    const eco = new Economy(100);
    const result = eco.spend(100);
    expect(result).toBe(true);
    expect(eco.getBalance()).toBe(0);
  });

  it('rejects negative income', () => {
    const eco = new Economy(100);
    expect(() => eco.addIncome(-10)).toThrow(RangeError);
  });

  it('rejects negative spend', () => {
    const eco = new Economy(100);
    expect(() => eco.spend(-10)).toThrow(RangeError);
  });

  it('resets balance', () => {
    const eco = new Economy(100);
    eco.spend(50);
    eco.reset(200);
    expect(eco.getBalance()).toBe(200);
  });
});
