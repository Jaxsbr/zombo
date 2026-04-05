export type DefenderBehavior = 'shooter' | 'wall' | 'generator' | 'trapper' | 'mine';

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
    generatesIncome: 0,
    behavior: 'generator',
    singleUse: false,
  },
  shooter: {
    name: 'Water Pistol',
    cost: 100,
    health: 40,
    damage: 15,
    range: 9, // full lane
    fireRate: 1,
    generatesIncome: 0,
    behavior: 'shooter',
    singleUse: false,
  },
  wall: {
    name: 'Block Tower',
    cost: 25,
    health: 90,
    damage: 0,
    range: 0,
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'wall',
    singleUse: false,
  },
  trapper: {
    name: 'Honey Bear',
    cost: 75,
    health: 60,
    damage: 0,
    range: 5, // cells ahead for honey pot tossing
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'trapper',
    singleUse: false,
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
    rechargeTime: 20000,
  },
};

export const MINE_ARM_DELAY = 6000; // ms before mine becomes armed
