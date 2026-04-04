## Phase goal

Add mess meter, round structure, cleanup mini-game, and Mum's ultimatum — transforming combat from consequence-free into a tension loop where fighting creates mess, mess threatens your defenses, and cleaning up between waves is a frantic mini-game.

### Stories in scope
- US-24 — Mess accumulation during combat
- US-25 — Round structure and extended waves
- US-26 — Cleanup mini-game between waves
- US-27 — Mum's ultimatum

### Done-when (observable)
- [x] `src/systems/Mess.ts` exists and exports a Mess class with `addMess(amount)`, `getMess()`, `getLevel()` (returns 0-1 ratio), and `reset()` methods [US-24]
- [x] Projectile-hit code path calls `Mess.addMess()` with a small value — `Mess.getMess()` increases after a projectile hit event [US-24]
- [x] Enemy-death code path calls `Mess.addMess()` with a medium value — `Mess.getMess()` increases after an enemy death event [US-24]
- [x] Defender-destruction code path calls `Mess.addMess()` with a large value — `Mess.getMess()` increases after a defender is destroyed [US-24]
- [x] A mess meter bar is rendered in the HUD area, visually reflecting `Mess.getLevel()` as a fill percentage [US-24]
- [x] Semi-transparent debris shapes (alpha <= 0.4) appear on grid cells when mess events fire, at depth below defenders/enemies [US-24]
- [x] Debris shapes do not receive pointer input during combat (no `setInteractive` during wave states) [US-24]
- [x] `Mess.addMess()` clamps the internal value so `getLevel()` never exceeds 1.0 — calling `addMess(999)` results in `getLevel() === 1.0` [US-24]
- [x] `test/Mess.test.ts` exists and passes with tests covering addMess accumulation, getLevel ratio, reset to zero, threshold checks, and overflow clamping [US-24]
- [x] `LEVEL_1` in `src/config/levels.ts` contains 7 waves with escalating enemy count (wave 1: 2 enemies, wave 7: 8+ enemies) [US-25]
- [x] `WaveManager` exposes a `currentRound` property returning the round number (1 for waves 1-3, 2 for waves 4-6, 0 for wave 7) [US-25]
- [x] `WaveManager` exposes an `isRoundBoundary` property that returns true when the current wave is the last in a round (wave 3, wave 6) and the wave has completed [US-25]
- [x] Progress dots in HUD show a visual gap or separator between round groups (dots 1-3, gap, dots 4-6, gap, dot 7) [US-25]
- [x] `test/WaveManager.test.ts` includes test cases verifying `currentRound` and `isRoundBoundary` for waves 1-7 [US-25]
- [x] When a wave's enemies are all spawned and defeated/escaped, the game enters a "cleanup" state before the inter-wave delay [US-26]
- [x] "TIDY UP!" text is displayed in the announcement text area when cleanup state begins [US-26]
- [x] A countdown bar is visible during cleanup state, showing remaining cleanup time (default ~5 seconds) [US-26]
- [x] Debris pieces gain a stroke (2px, alpha >= 0.8) and a looping bob tween (vertical offset ±4px, duration 600-800ms) when cleanup state begins [US-26]
- [x] Debris pieces become interactive (clickable) during cleanup state — clicking one destroys it with a scale-to-zero animation (1.0 → 0 over 150-250ms, alpha fade to 0) [US-26]
- [x] Each debris tap reduces `Mess.getMess()` by a defined amount [US-26]
- [x] A pop/sweep SFX plays on each debris tap (new function in `src/systems/SFX.ts`) [US-26]
- [x] Grid cell placement clicks are disabled during cleanup state (clicking a cell does not place a defender) [US-26]
- [x] During cleanup state, WaveManager does not advance — no enemies spawn, no projectiles fire, existing enemies do not move (combat is fully paused) [US-26]
- [x] No new debris spawns and `Mess.addMess()` is not called during cleanup state — mess only decreases via taps [US-26]
- [x] If cleanup begins with 0 debris pieces on the grid, the cleanup timer still runs to completion and transitions to the next wave normally [US-26]
- [x] Cleanup duration replaces the inter-wave delay — after cleanup ends, the next wave begins with the announcing state (no additional waiting period stacked on top) [US-26]
- [x] When the cleanup countdown expires, debris pieces lose interactivity and glow (stroke removed, alpha reverts to <= 0.4), and the next wave announcing state begins [US-26]
- [x] Untapped debris remains on the grid (reverts to subtle alpha <= 0.4) after cleanup ends [US-26]
- [x] After wave 3 cleanup and wave 6 cleanup, Mum's evaluation triggers (does not trigger after other waves or wave 7) [US-27]
- [x] If `Mess.getLevel()` > 0.7 at Mum check: a speech bubble with "This room is a DISASTER!" is displayed for 2500-3500ms [US-27]
- [x] During a high-mess Mum check: one random defender from the `defenders` array is removed — entity destroyed, grid cell freed via `Placement.remove()` — with a poof animation (scale 1.0 → 1.5 → 0 over 300-500ms, alpha fade to 0) [US-27]
- [x] If `Mess.getLevel()` > 0.7 but 0 defenders are placed, confiscation is skipped — speech bubble still displays, no error thrown [US-27]
- [x] If `Mess.getLevel()` <= 0.7 at Mum check: a speech bubble with "Not bad!" is displayed for 2500-3500ms and a random defender type is placed on a random empty grid cell with the standard bounce-in animation and placement SFX [US-27]
- [x] If `Mess.getLevel()` <= 0.7 but 0 empty grid cells exist, reward placement is skipped — speech bubble still displays, no error thrown [US-27]
- [x] `Mess.reset()` is called after Mum's evaluation completes — mess bar returns to 0 [US-27]
- [x] Wave 7 transitions directly to the game-over flow with no cleanup or Mum check [US-27]
- [x] Reward defender placement updates both the visual scene and `Placement`/`Grid` occupancy tracking [US-27]
- [x] All cleanup tweens, debris objects, speech bubbles, and countdown timers are cleaned up on scene transition — no orphaned objects persist after GameScene ends [phase]
- [x] AGENTS.md reflects new Mess system module, round structure, cleanup mechanic, and Mum's ultimatum [phase]
- [x] All existing tests pass after all changes (`npm test` exits 0) [phase]

### Golden principles (phase-relevant)
- **Game logic separated from Phaser rendering** — Mess.ts is pure TS logic (accumulation, thresholds, reset), testable without Phaser. Cleanup state management in GameScene, rendering separate from logic
- **Config-driven entities** — mess amounts per event, cleanup duration, Mum threshold, wave composition defined as named constants or config, not magic numbers inline
- **Tests run without Phaser** — Mess module and WaveManager round logic testable in Node-based Vitest environment
