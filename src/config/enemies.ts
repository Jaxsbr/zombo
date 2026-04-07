export interface EnemyType {
  name: string;
  health: number;
  speed: number;    // cells per second
  damage: number;   // damage dealt to defenders per second
  scale?: number;   // visual scale multiplier (default 1.0)
  jumpsRemaining?: number; // number of defender-jumps available (sock puppet)
  armorStages?: number;    // number of visual degradation stages (armored bunny)
  bossType?: boolean;      // boss enemies: mine does chunk damage instead of instant kill
  knockbackAmount?: number; // how far this enemy is pushed by knockback (0 = immune)
  bio?: string;     // kid-friendly description shown on pre-round bio screen
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  basic: {
    name: 'Dust Bunny',
    health: 80,
    speed: 0.30,
    damage: 10,
    scale: 1.0,
    knockbackAmount: 0.6,
    bio: 'The Dust Bunny rolls in from the right! It\'s the softest enemy, but there\'s a lot of them.',
  },
  tough: {
    name: 'Cleaning Robot',
    health: 550,
    speed: 0.15,
    damage: 30,
    scale: 1.35,
    knockbackAmount: 0.1,
    bio: 'The Cleaning Robot is slow but very tough! Keep shooting \u2014 it takes a lot of hits to stop this one.',
  },
  armored: {
    name: 'Armored Bunny',
    health: 300,
    speed: 0.20,
    damage: 20,
    scale: 1.15,
    armorStages: 3, // full → cracked → bare
    knockbackAmount: 0.3,
    bio: 'Armored Bunny wears a tough helmet! Keep shooting \u2014 the helmet cracks and breaks off.',
  },
  jumper: {
    name: 'Sock Puppet',
    health: 150,
    speed: 0.36,
    damage: 10,
    scale: 0.85,
    jumpsRemaining: 1,
    knockbackAmount: 0.5,
    bio: 'Watch out! The Sock Puppet jumps over the first toy it encounters. Put your shooters behind your walls!',
  },
  boss: {
    name: 'Mega Mop',
    health: 5500,
    speed: 0.08,
    damage: 40,
    scale: 1.6,
    bossType: true,
    knockbackAmount: 0,
    bio: 'The Mega Mop is HUGE and TOUGH! It takes forever to bring down — use everything you have!',
  },
};
