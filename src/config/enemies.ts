export interface EnemyType {
  name: string;
  health: number;
  speed: number;    // cells per second
  damage: number;   // damage dealt to defenders per second
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  basic: {
    name: 'Basic',
    health: 100,
    speed: 0.5,
    damage: 20,
  },
  tough: {
    name: 'Tough',
    health: 300,
    speed: 0.25,
    damage: 30,
  },
};
