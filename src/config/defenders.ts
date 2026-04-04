export type DefenderBehavior = 'shooter' | 'wall' | 'generator' | 'bomb' | 'mine';

export interface DefenderType {
  name: string;
  cost: number;
  health: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second (0 = no attack)
  generatesIncome: number; // income per tick (0 = no generation)
  behavior: DefenderBehavior;
  singleUse: boolean;
  rechargeTime?: number; // ms cooldown between placements (single-use types)
}

export const DEFENDER_TYPES: Record<string, DefenderType> = {
  generator: {
    name: 'Jack-in-the-Box',
    cost: 50,
    health: 40,
    damage: 0,
    range: 0,
    fireRate: 0,
    generatesIncome: 25,
    behavior: 'generator',
    singleUse: false,
  },
  shooter: {
    name: 'Water Pistol',
    cost: 100,
    health: 40,
    damage: 25,
    range: 9, // full lane
    fireRate: 1,
    generatesIncome: 0,
    behavior: 'shooter',
    singleUse: false,
  },
  wall: {
    name: 'Block Tower',
    cost: 50,
    health: 400,
    damage: 0,
    range: 0,
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'wall',
    singleUse: false,
  },
  bomb: {
    name: 'Teddy Bomb',
    cost: 150,
    health: 1,
    damage: 9999, // lethal — exceeds any enemy health
    range: 1, // Chebyshev distance 1 (3x3 area)
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'bomb',
    singleUse: true,
    rechargeTime: 50000,
  },
  mine: {
    name: 'Marble Mine',
    cost: 25,
    health: 1,
    damage: 9999, // lethal — instant-kill on trigger
    range: 0, // same cell only
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'mine',
    singleUse: true,
    rechargeTime: 30000,
  },
};

export const MINE_ARM_DELAY = 10000; // ms before mine becomes armed
