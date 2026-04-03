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
  setupDelay?: number;       // seconds before first wave (default 25)
  interWaveDelay?: number;   // seconds between waves (default 18)
  announceDuration?: number; // seconds to show announcement (default 2.5)
}

export type WaveState = 'setup' | 'announcing' | 'spawning' | 'waiting' | 'complete';

const DEFAULT_SETUP_DELAY = 25;
const DEFAULT_INTER_WAVE_DELAY = 18;
const DEFAULT_ANNOUNCE_DURATION = 2.5;

export class WaveManager {
  private readonly level: LevelConfig;
  private readonly setupDelay: number;
  private readonly interWaveDelay: number;
  private readonly announceDuration: number;

  private currentWave: number;
  private waveTimer: number;
  private spawnIndex: number;
  private _waveState: WaveState;

  constructor(level: LevelConfig) {
    this.level = level;
    this.setupDelay = level.setupDelay ?? DEFAULT_SETUP_DELAY;
    this.interWaveDelay = level.interWaveDelay ?? DEFAULT_INTER_WAVE_DELAY;
    this.announceDuration = level.announceDuration ?? DEFAULT_ANNOUNCE_DURATION;

    this.currentWave = 0;
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this._waveState = this.setupDelay > 0 ? 'setup' : 'announcing';
  }

  get totalWaves(): number {
    return this.level.waves.length;
  }

  get currentWaveNumber(): number {
    return this.currentWave + 1;
  }

  get isComplete(): boolean {
    return this._waveState === 'complete';
  }

  get waveState(): WaveState {
    return this._waveState;
  }

  /** Progress through the current delay state (0→1). Returns 0 during spawning/complete. */
  get delayProgress(): number {
    if (this._waveState === 'setup' && this.setupDelay > 0) {
      return Math.min(1, this.waveTimer / this.setupDelay);
    }
    if (this._waveState === 'announcing' && this.announceDuration > 0) {
      return Math.min(1, this.waveTimer / this.announceDuration);
    }
    if (this._waveState === 'waiting' && this.interWaveDelay > 0) {
      return Math.min(1, this.waveTimer / this.interWaveDelay);
    }
    return 0;
  }

  update(deltaSeconds: number): EnemySpawn[] {
    if (this._waveState === 'complete') {
      return [];
    }

    this.waveTimer += deltaSeconds;

    // Process pre-spawn delay states. These can chain through zero-duration
    // states within a single tick (e.g. setup=0 + announce=0 → spawning).
    let guard = 0;
    while (guard++ < 5) {
      if (this._waveState === 'setup') {
        if (this.waveTimer >= this.setupDelay) {
          this.waveTimer -= this.setupDelay;
          this._waveState = 'announcing';
          continue;
        }
        return [];
      }
      if (this._waveState === 'announcing') {
        if (this.waveTimer >= this.announceDuration) {
          this.waveTimer -= this.announceDuration;
          this._waveState = 'spawning';
          this.spawnIndex = 0;
          break; // fall through to spawning below
        }
        return [];
      }
      if (this._waveState === 'waiting') {
        if (this.waveTimer >= this.interWaveDelay) {
          this.waveTimer -= this.interWaveDelay;
          this._waveState = 'announcing';
          continue;
        }
        return [];
      }
      break;
    }

    // State: spawning — process enemy spawns for this tick
    if (this._waveState !== 'spawning') {
      return [];
    }

    const wave = this.level.waves[this.currentWave];
    if (!wave) {
      this._waveState = 'complete';
      return [];
    }

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

    // All spawns in current wave consumed — advance
    if (this.spawnIndex >= wave.spawns.length) {
      this.currentWave++;
      this.waveTimer = 0;
      if (this.currentWave >= this.level.waves.length) {
        this._waveState = 'complete';
      } else if (this.interWaveDelay > 0) {
        this._waveState = 'waiting';
      } else if (this.announceDuration > 0) {
        this._waveState = 'announcing';
      } else {
        // Zero delays — stay in spawning for next wave, reset index
        this.spawnIndex = 0;
      }
    }

    return spawned;
  }

  reset(): void {
    this.currentWave = 0;
    this.waveTimer = 0;
    this.spawnIndex = 0;
    this._waveState = this.setupDelay > 0 ? 'setup' : 'announcing';
  }
}
