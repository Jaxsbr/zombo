const STORAGE_KEY = 'zombo_unlocks';

// Unlock map: which defenders are available at start and which unlock on level completion
const INITIAL_DEFENDERS = ['generator', 'shooter'];
const UNLOCK_MAP: Record<number, string> = {
  3: 'wall',  // completing Level 3 unlocks Block Tower
};

/** Get the list of unlocked defender keys for a given set of completed levels. */
export function getUnlockedDefenders(completedLevels: number[]): string[] {
  const unlocked = [...INITIAL_DEFENDERS];
  for (const [level, key] of Object.entries(UNLOCK_MAP)) {
    if (completedLevels.includes(Number(level))) {
      unlocked.push(key);
    }
  }
  return unlocked;
}

/** Load unlock state from localStorage. */
export function loadUnlocks(storage?: Storage): string[] {
  try {
    const raw = (storage ?? globalThis.localStorage)?.getItem(STORAGE_KEY);
    if (!raw) return [...INITIAL_DEFENDERS];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [...INITIAL_DEFENDERS];
    return data;
  } catch {
    return [...INITIAL_DEFENDERS];
  }
}

/** Save unlock state to localStorage. */
export function saveUnlocks(unlocked: string[], storage?: Storage): void {
  (storage ?? globalThis.localStorage)?.setItem(STORAGE_KEY, JSON.stringify(unlocked));
}

/** Update unlocks after completing a level. Returns updated unlock list. */
export function updateUnlocksAfterLevel(
  currentUnlocks: string[],
  completedLevelIndex: number, // 0-based
): string[] {
  const levelNumber = completedLevelIndex + 1; // convert to 1-based
  const newKey = UNLOCK_MAP[levelNumber];
  if (newKey && !currentUnlocks.includes(newKey)) {
    return [...currentUnlocks, newKey];
  }
  return currentUnlocks;
}

/** Whether the loadout selection screen should be shown. */
export function needsLoadoutSelection(unlocked: string[]): boolean {
  return unlocked.length > 4;
}

export const MAX_LOADOUT = 4;
