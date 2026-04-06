export interface EnemyType {
  name: string;
  health: number;
  speed: number;    // cells per second
  damage: number;   // damage dealt to defenders per second
  scale?: number;   // visual scale multiplier (default 1.0)
  jumpsRemaining?: number; // number of defender-jumps available (sock puppet)
  armorStages?: number;    // number of visual degradation stages (armored bunny)
  bio?: string;     // kid-friendly description shown on pre-round bio screen
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  basic: {
    name: 'Dust Bunny',
    health: 100,
    speed: 0.4,
    damage: 20,
    scale: 1.0,
  },
  tough: {
    name: 'Cleaning Robot',
    health: 750,
    speed: 0.25,
    damage: 30,
    scale: 1.35,
    bio: 'The Cleaning Robot is slow but very tough! Keep shooting \u2014 it takes a lot of hits to stop this one.',
  },
  armored: {
    name: 'Armored Bunny',
    health: 300, // exactly 3x basic
    speed: 0.4,  // same as basic
    damage: 20,
    scale: 1.15,
    armorStages: 3, // full → cracked → bare
    bio: 'Armored Bunny wears a tough helmet! Keep shooting \u2014 the helmet cracks and breaks off.',
  },
  jumper: {
    name: 'Sock Puppet',
    health: 150,
    speed: 0.455,
    damage: 20,
    scale: 0.85,
    jumpsRemaining: 1,
    bio: 'Watch out! The Sock Puppet jumps over the first toy it encounters. Put your shooters behind your walls!',
  },
};
