const STORAGE_KEY = 'zombo_progress';
const TOTAL_LEVELS = 9;

export type LevelState = 'locked' | 'unlocked' | 'completed';

export interface ProgressData {
  levels: LevelState[];
}

function defaultProgress(): ProgressData {
  const levels: LevelState[] = Array(TOTAL_LEVELS).fill('locked');
  levels[0] = 'unlocked'; // Level 1 always starts unlocked
  return { levels };
}

/** Load progress from localStorage (or return default if missing/corrupt). */
export function loadProgress(storage?: Storage): ProgressData {
  try {
    const raw = (storage ?? globalThis.localStorage)?.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const data = JSON.parse(raw) as ProgressData;
    if (!Array.isArray(data.levels)) return defaultProgress();
    // Migrate: pad shorter arrays (e.g. old 5-level saves) with 'locked'
    if (data.levels.length < TOTAL_LEVELS) {
      const padded: LevelState[] = [...data.levels];
      while (padded.length < TOTAL_LEVELS) padded.push('locked');
      return { levels: padded };
    }
    if (data.levels.length > TOTAL_LEVELS) return defaultProgress();
    return data;
  } catch {
    return defaultProgress();
  }
}

/** Save progress to localStorage. */
export function saveProgress(data: ProgressData, storage?: Storage): void {
  (storage ?? globalThis.localStorage)?.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Complete a level: mark it completed and unlock the next one. */
export function completeLevel(data: ProgressData, levelIndex: number): ProgressData {
  const updated = { levels: [...data.levels] };
  updated.levels[levelIndex] = 'completed';
  // Unlock next level if it exists and is currently locked
  if (levelIndex + 1 < TOTAL_LEVELS && updated.levels[levelIndex + 1] === 'locked') {
    updated.levels[levelIndex + 1] = 'unlocked';
  }
  return updated;
}

/** Get the state of a specific level. */
export function getLevelState(data: ProgressData, levelIndex: number): LevelState {
  return data.levels[levelIndex] ?? 'locked';
}
