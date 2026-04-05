/**
 * Tutorial state machine — pure TypeScript, no Phaser dependency.
 * Manages the 3-step L1 tutorial flow:
 *   1. PLACE_GENERATOR — player places their first generator
 *   2. COLLECT_SPARK — player clicks a spark to collect it
 *   3. PLACE_PISTOL — player places a water pistol
 *   4. COMPLETE — tutorial is done, normal gameplay resumes
 */

export type TutorialStep = 'PLACE_GENERATOR' | 'COLLECT_SPARK' | 'PLACE_PISTOL' | 'COMPLETE';

const STORAGE_KEY = 'tutorial_complete';

export class Tutorial {
  private _step: TutorialStep;

  constructor() {
    this._step = 'PLACE_GENERATOR';
  }

  get step(): TutorialStep {
    return this._step;
  }

  get isComplete(): boolean {
    return this._step === 'COMPLETE';
  }

  /** Call when a defender is placed. Advances from PLACE_GENERATOR if the placed key is 'generator'. */
  onDefenderPlaced(defenderKey: string): void {
    if (this._step === 'PLACE_GENERATOR' && defenderKey === 'generator') {
      this._step = 'COLLECT_SPARK';
    } else if (this._step === 'PLACE_PISTOL' && defenderKey === 'shooter') {
      this._step = 'COMPLETE';
    }
  }

  /** Call when a spark is collected. Advances from COLLECT_SPARK if balance meets threshold. */
  onSparkCollected(currentBalance: number, pistolCost: number): void {
    if (this._step === 'COLLECT_SPARK' && currentBalance >= pistolCost) {
      this._step = 'PLACE_PISTOL';
    }
  }

  /** Check if the tutorial has been completed before (via localStorage). */
  static hasCompleted(storage?: Storage): boolean {
    try {
      return (storage ?? globalThis.localStorage)?.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /** Mark the tutorial as completed in localStorage. */
  static markComplete(storage?: Storage): void {
    try {
      (storage ?? globalThis.localStorage)?.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage unavailable
    }
  }
}
