import { EnemyType } from '../config/enemies';

export interface EnemySpawn {
  type: EnemyType;
  lane: number;
  delay: number; // seconds after wave start
}

export interface WaveConfig {
  spawns: EnemySpawn[];
}

export interface LevelConfig {
  waves: WaveConfig[];
}

export class WaveManager {
  private readonly level: LevelConfig;
  private currentWave: number;
  private waveTimer: number;
  private spawnIndex: number;
  private allWavesSpawned: boolean;

  constructor(level: LevelConfig) {
    this.level = level;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this.allWavesSpawned = false;
  }

  get totalWaves(): number {
    return this.level.waves.length;
  }

  get currentWaveNumber(): number {
    return this.currentWave + 1;
  }

  get isComplete(): boolean {
    return this.allWavesSpawned;
  }

  update(deltaSeconds: number): EnemySpawn[] {
    if (this.allWavesSpawned) {
      return [];
    }

    const wave = this.level.waves[this.currentWave];
    if (!wave) {
      this.allWavesSpawned = true;
      return [];
    }

    this.waveTimer += deltaSeconds;

    const spawned: EnemySpawn[] = [];
    while (this.spawnIndex < wave.spawns.length) {
      const spawn = wave.spawns[this.spawnIndex];
      if (this.waveTimer >= spawn.delay) {
        spawned.push(spawn);
        this.spawnIndex++;
      } else {
        break;
      }
    }

    if (this.spawnIndex >= wave.spawns.length) {
      this.currentWave++;
      this.waveTimer = 0;
      this.spawnIndex = 0;
      if (this.currentWave >= this.level.waves.length) {
        this.allWavesSpawned = true;
      }
    }

    return spawned;
  }

  reset(): void {
    this.currentWave = 0;
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this.allWavesSpawned = false;
  }
}
