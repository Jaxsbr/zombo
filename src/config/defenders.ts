export type DefenderBehavior = 'shooter' | 'wall' | 'generator' | 'trapper' | 'mine' | 'bomb';

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
  knockback?: number; // cells to push enemy back on hit (0 or undefined = no knockback)
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
    damage: 12,
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
    health: 120,
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
    cost: 150,
    health: 60,
    damage: 25, // AOE damage per projectile hit (matches HONEY_BEAR_AOE_DAMAGE)
    range: 9, // full lane — fires at nearest enemy like Water Pistol
    fireRate: 1 / 3, // 1 shot every 3 seconds (matches HONEY_BEAR_FIRE_INTERVAL)
    generatesIncome: 0,
    behavior: 'trapper',
    singleUse: false,
    bio: 'Shoots slow honey blobs that splash on hit! Damages nearby lanes and leaves sticky puddles.',
  },
  cannon: {
    name: 'Water Cannon',
    cost: 150,
    health: 50,
    damage: 24, // 2× Water Pistol
    range: 9,
    fireRate: 0.8, // slightly slower than Water Pistol
    generatesIncome: 0,
    behavior: 'shooter',
    singleUse: false,
    knockback: 0.3, // gentle nudge — pushes non-boss enemies back a fraction of a cell
    bio: 'KA-SPLASH! A massive water blaster that blows enemies backwards! Way stronger than the pistol.',
  },
  bomb: {
    name: 'Glitter Bomb',
    cost: 100,
    health: 1,
    damage: 9999, // lethal to non-boss enemies in AOE
    range: 0,
    fireRate: 0,
    generatesIncome: 0,
    behavior: 'bomb',
    singleUse: true,
    rechargeTime: 15000, // 15s cooldown between placements
    bio: 'SPARKLE BOOM! Place it and — pop! — glitter explodes everywhere! Clears out a whole crowd of baddies.',
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
    rechargeTime: 10000,
    bio: 'A sneaky marble that goes BOOM! Wait for it to arm, then any enemy that steps on it is gone.',
  },
};

export const MINE_ARM_DELAY = 3000; // ms before mine becomes armed
