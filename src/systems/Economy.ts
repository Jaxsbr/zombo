export class Economy {
  private balance: number;

  constructor(startingBalance: number) {
    this.balance = startingBalance;
  }

  getBalance(): number {
    return this.balance;
  }

  addIncome(amount: number): void {
    if (amount < 0) {
      throw new RangeError('Income amount must be non-negative');
    }
    this.balance += amount;
  }

  spend(amount: number): boolean {
    if (amount < 0) {
      throw new RangeError('Spend amount must be non-negative');
    }
    if (amount > this.balance) {
      return false;
    }
    this.balance -= amount;
    return true;
  }

  reset(startingBalance: number): void {
    this.balance = startingBalance;
  }
}
