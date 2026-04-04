const DEFAULT_MAX = 1000;
const CLEANUP_VALUE = 50;

export const MESS_SMALL = 10;   // projectile hit
export const MESS_MEDIUM = 30;  // enemy death
export const MESS_LARGE = 80;   // defender destruction
export const MESS_THRESHOLD = 0.7; // Mum's anger threshold

export class Mess {
  private mess: number;
  private readonly max: number;

  constructor(max = DEFAULT_MAX) {
    this.mess = 0;
    this.max = max;
  }

  addMess(amount: number): void {
    this.mess = Math.min(this.mess + amount, this.max);
  }

  removeMess(amount: number = CLEANUP_VALUE): void {
    this.mess = Math.max(this.mess - amount, 0);
  }

  getMess(): number {
    return this.mess;
  }

  getLevel(): number {
    return this.mess / this.max;
  }

  reset(): void {
    this.mess = 0;
  }
}
