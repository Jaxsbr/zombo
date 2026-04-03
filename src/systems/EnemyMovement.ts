export interface MovingEnemy {
  x: number;    // current column position (float)
  lane: number;
  speed: number; // cells per second
}

export function moveEnemy(enemy: MovingEnemy, deltaSeconds: number): void {
  enemy.x -= enemy.speed * deltaSeconds;
}
