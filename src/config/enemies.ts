export interface EnemyType {
  name: string;
  health: number;
  speed: number;    // cells per second
  damage: number;   // damage dealt to defenders per second
  jumpsRemaining?: number; // number of defender-jumps available (sock puppet)
  armorStages?: number;    // number of visual degradation stages (armored bunny)
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  basic: {
    name: 'Dust Bunny',
    health: 100,
    speed: 0.5,
    damage: 20,
  },
  tough: {
    name: 'Cleaning Robot',
    health: 300,
    speed: 0.25,
    damage: 30,
  },
  armored: {
    name: 'Armored Bunny',
    health: 300, // exactly 3x basic
    speed: 0.5,  // same as basic
    damage: 20,
    armorStages: 3, // full → cracked → bare
  },
  jumper: {
    name: 'Sock Puppet',
    health: 150,
    speed: 0.35,
    damage: 20,
    jumpsRemaining: 1,
  },
};
