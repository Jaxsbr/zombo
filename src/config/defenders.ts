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
  bio: string; // kid-friendly description shown on unlock card
}

export const DEFENDER_TYPES: Record<string, DefenderType> = {
  generator: {
    name: 'Jack-in-the-Box',
    cost: 30,
    health: 40,
    damage: 0,
    range: 0,
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'generator',
    singleUse: false,
    bio: 'Wind it up and sparks pop out! Click the sparks to collect them and buy more toys.',
  },
  shooter: {
    name: 'Water Pistol',
    cost: 75,
    health: 40,
    damage: 20,
    range: 9, // full lane
    fireRate: 1,
    generatesIncome: 0,
    behavior: 'shooter',
    singleUse: false,
    bio: 'Squirt! Shoots water drops at enemies coming down the lane. Your main weapon!',
  },
  wall: {
    name: 'Block Tower',
    cost: 20,
    health: 65,
    damage: 0,
    range: 0,
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'wall',
    singleUse: false,
    bio: 'Tough as bricks! Enemies can\'t get past a Block Tower. Put it in front to protect your toys.',
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
    bio: 'Throws sticky honey pots that slow enemies down. Great for buying time!',
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
    bio: 'A sneaky marble that goes BOOM! Wait for it to arm, then any enemy that steps on it is gone.',
  },
};

export const MINE_ARM_DELAY = 6000; // ms before mine becomes armed
