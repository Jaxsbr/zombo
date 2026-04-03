export type GameState = 'playing' | 'won' | 'lost';

export interface GameFlowEnemy {
  x: number;
  health: number;
}

export class GameFlow {
  private state: GameState;

  constructor() {
    this.state = 'playing';
  }

  getState(): GameState {
    return this.state;
  }

  update(enemies: GameFlowEnemy[], allWavesSpawned: boolean): void {
    if (this.state !== 'playing') {
      return;
    }

    // Lose: any enemy reaches column 0
    for (const enemy of enemies) {
      if (enemy.health > 0 && enemy.x <= 0) {
        this.state = 'lost';
        return;
      }
    }

    // Win: all waves spawned and no living enemies remain
    if (allWavesSpawned) {
      const alive = enemies.some((e) => e.health > 0);
      if (!alive) {
        this.state = 'won';
      }
    }
  }

  reset(): void {
    this.state = 'playing';
  }
}
