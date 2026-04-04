import { describe, it, expect } from 'vitest';
import { Mess, MESS_SMALL, MESS_MEDIUM, MESS_LARGE, MESS_THRESHOLD } from '../src/systems/Mess';

describe('Mess', () => {
  it('starts at zero', () => {
    const mess = new Mess();
    expect(mess.getMess()).toBe(0);
    expect(mess.getLevel()).toBe(0);
  });

  it('accumulates mess via addMess', () => {
    const mess = new Mess();
    mess.addMess(MESS_SMALL);
    expect(mess.getMess()).toBe(MESS_SMALL);
    mess.addMess(MESS_MEDIUM);
    expect(mess.getMess()).toBe(MESS_SMALL + MESS_MEDIUM);
  });

  it('getLevel returns ratio 0-1', () => {
    const mess = new Mess(100);
    mess.addMess(50);
    expect(mess.getLevel()).toBe(0.5);
    mess.addMess(25);
    expect(mess.getLevel()).toBe(0.75);
  });

  it('clamps at max — getLevel never exceeds 1.0', () => {
    const mess = new Mess(100);
    mess.addMess(999);
    expect(mess.getLevel()).toBe(1.0);
    expect(mess.getMess()).toBe(100);
  });

  it('reset sets mess to zero', () => {
    const mess = new Mess();
    mess.addMess(500);
    expect(mess.getMess()).toBeGreaterThan(0);
    mess.reset();
    expect(mess.getMess()).toBe(0);
    expect(mess.getLevel()).toBe(0);
  });

  it('removeMess reduces the value', () => {
    const mess = new Mess(100);
    mess.addMess(80);
    mess.removeMess(30);
    expect(mess.getMess()).toBe(50);
  });

  it('removeMess does not go below zero', () => {
    const mess = new Mess(100);
    mess.addMess(10);
    mess.removeMess(999);
    expect(mess.getMess()).toBe(0);
    expect(mess.getLevel()).toBe(0);
  });

  it('threshold constant is 0.7', () => {
    expect(MESS_THRESHOLD).toBe(0.7);
  });

  it('mess amount constants are ordered small < medium < large', () => {
    expect(MESS_SMALL).toBeLessThan(MESS_MEDIUM);
    expect(MESS_MEDIUM).toBeLessThan(MESS_LARGE);
  });

  it('multiple addMess calls accumulate correctly', () => {
    const mess = new Mess(1000);
    for (let i = 0; i < 10; i++) {
      mess.addMess(MESS_SMALL);
    }
    expect(mess.getMess()).toBe(MESS_SMALL * 10);
  });
});
