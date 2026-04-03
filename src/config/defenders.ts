export interface DefenderType {
  name: string;
  cost: number;
  health: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second (0 = no attack)
  generatesIncome: number; // income per tick (0 = no generation)
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
  },
  shooter: {
    name: 'Water Pistol',
    cost: 100,
    health: 40,
    damage: 25,
    range: 9, // full lane
    fireRate: 1,
    generatesIncome: 0,
  },
  wall: {
    name: 'Block Tower',
    cost: 50,
    health: 400,
    damage: 0,
    range: 0,
    fireRate: 0,
    generatesIncome: 0,
  },
};
