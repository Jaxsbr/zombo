## Phase goal

Transform the game from a functional prototype with colored shapes into "Toy Box Siege" — a bedroom-themed tower defense game with developer art, PvZ-style wave pacing, progress feedback, and a complete scene flow (title → gameplay → game over → restart).

### Stories in scope
- US-15 — Toy Box Siege developer art
- US-16 — Wave pacing and escalation
- US-17 — Wave progress and announcements
- US-18 — Scene flow and transitions

### Done-when (observable)
- [x] `src/config/defenders.ts` exports defender types with Toy Box Siege names: "Water Pistol", "Jack-in-the-Box", "Block Tower" [US-15]
- [x] `src/config/enemies.ts` exports enemy types with Toy Box Siege names: "Dust Bunny", "Cleaning Robot" [US-15]
- [x] DefenderEntity contains distinct rendering code paths per defender key — each key draws a different shape composition (not just a color variation of the same fillRect) [US-15]
- [x] EnemyEntity contains distinct rendering code paths per enemy key — each key draws a different shape composition (not just a color variation of the same fillCircle) [US-15]
- [x] Grid `drawGrid()` uses bedroom carpet palette — fillStyle hex values are in the brown/tan range, not green [US-15]
- [x] HUD displays "Sparks" label instead of "Energy" [US-15]
- [x] All existing tests pass after theme renaming (`npm test` exits 0) [US-15]
- [x] WaveManager accepts a `setupDelay` config parameter (seconds before first wave) with default >= 20 [US-16]
- [x] WaveManager accepts an `interWaveDelay` config parameter (seconds between waves) with default >= 15 [US-16]
- [x] WaveManager.update() returns no spawns during setup and inter-wave delay periods [US-16]
- [x] WaveManager exposes a `waveState` property with values from set: setup, announcing, spawning, waiting, complete [US-16]
- [x] LEVEL_1 config wave 1 has <= 2 spawns, all basic (Dust Bunny) type [US-16]
- [x] LEVEL_1 config wave 2 has 3-4 spawns with mixed enemy types [US-16]
- [x] LEVEL_1 config wave 3 has 5-6 spawns including >= 2 tough (Cleaning Robot) across >= 3 different lanes [US-16]
- [x] Unit tests verify: setup delay holds spawns, inter-wave delay holds spawns, wave state transitions through all states correctly (`npm test` exits 0) [US-16]
- [x] GameScene renders a wave progress indicator showing current wave number and total waves [US-17]
- [x] A text announcement (themed, e.g. "Dust bunnies incoming!") appears on screen during the announcing wave state, displayed for >= 2 seconds before spawning begins [US-17]
- [x] The final wave announcement uses distinct text different from earlier waves (e.g., "A HUGE mess is coming!") [US-17]
- [x] Wave progress indicator updates to reflect current wave number after each wave completes [US-17]
- [x] `src/scenes/TitleScene.ts` exists and is registered as the first scene in the Phaser game config [US-18]
- [x] TitleScene displays "Toy Box Siege" text and a clickable "Play" element [US-18]
- [x] Transitions between TitleScene -> GameScene and GameScene -> GameOverScene use Phaser camera fade (or equivalent visual effect), not bare `scene.start()` [US-18]
- [x] GameOverScene displays themed text ("Fort Defended!" on win, "The Mess Wins!" on loss) and a "Play Again" button with transition [US-18]
- [x] Restarting via "Play Again" resets all game state — a second playthrough behaves identically to the first (no stale defenders, enemies, or timers) [US-18]
- [x] AGENTS.md reflects Toy Box Siege theme, new TitleScene, WaveManager wave-state system, and updated entity rendering descriptions [phase]

### Golden principles (phase-relevant)
- **Game logic separated from Phaser rendering** — wave state logic (setup delay, inter-wave delay, state machine) lives in WaveManager (pure TS, testable), visual announcements and progress bar live in GameScene
- **Config-driven entities** — Toy Box Siege theme names and properties defined in config registries, entity rendering dispatches on config keys
- **Tests run without Phaser** — wave state tests use Vitest with node environment, no browser required for logic tests
