# Phase: mess-meter

Status: draft

## Design direction

Same Toy Box aesthetic — playful, bouncy, procedural Graphics API art. Mess debris should look cute and funny (toy parts, water puddles, dust puffs), not gross. Cleanup taps should feel like popping bubble wrap — satisfying pop animations and sounds. Mum's speech bubble is oversized and dramatic for comedic effect. The mess bar uses warm reds/oranges to convey "danger" as it fills. All procedural — zero external assets.

## Stories

### US-24 — Mess accumulation during combat

As a player, I want to see mess building up on the battlefield as my toys fight, so that combat has visible consequences and I feel the stakes rising as the room gets messier.

**Acceptance criteria:**
- A mess meter bar is visible in the HUD, showing the current mess level from 0% to 100%
- Combat events generate mess: projectile hits (small), enemy deaths (medium), defender destruction (large)
- Semi-transparent debris shapes (puddles, scattered parts, dust puffs) appear on grid cells when mess events occur
- Debris is subtle during combat — low alpha, behind gameplay entities, no pointer interaction
- Mess level persists across waves within a round (does not reset between waves)
- Mess system logic lives in a pure TypeScript module with no Phaser dependency

**User guidance:**
- Discovery: Mess bar visible in HUD area during gameplay
- Key steps: 1. Watch the mess bar fill as combat happens. 2. More fighting = more mess on the grid.

**Design rationale:** The mess bar creates a second axis of tension beyond "are my defenders alive?" — even winning a wave has a cost. Visible debris on the grid makes combat feel impactful and sets up the cleanup mini-game. Pure TS module keeps logic testable.

**Interaction model:** No new input during combat — mess bar and debris are passive visual feedback on existing combat events. Players read the bar to gauge how urgent cleanup will be.

### US-25 — Round structure and extended waves

As a player, I want more waves organized into rounds, so that the game lasts longer and has natural rhythm with escalating difficulty.

**Acceptance criteria:**
- Level contains 7 waves with escalating enemy count and type variety
- Waves are grouped into rounds: Round 1 (waves 1-3), Round 2 (waves 4-6), Final (wave 7)
- WaveManager tracks round boundaries (after wave 3 and wave 6)
- Wave announcements reference round transitions at round starts
- Progress dots in HUD show round grouping (visual gap or separator every 3 dots)

**User guidance:**
- Discovery: Progress dots in HUD show wave/round progression
- Key steps: 1. Play through 3 waves to complete a round. 2. Rounds get harder — more enemies, tougher types. 3. Survive all 7 waves to win.

**Design rationale:** 3 waves ends in 2 minutes — too short to feel like a real game. PvZ levels run 8-20 waves grouped by flag markers. 7 waves in 2 rounds + a final wave gives ~8-10 minutes of play with natural escalation points. Round boundaries are where Mum checks the mess (US-27).

**Interaction model:** Same as existing wave progression — no new input. Round structure is expressed through wave announcements and HUD dots.

### US-26 — Cleanup mini-game between waves

As a player, I want a frantic cleanup phase between waves where I tap mess debris to tidy up, so that I have something exciting to do between waves instead of just waiting.

**Acceptance criteria:**
- When a wave ends, the game enters a "cleanup" state before the inter-wave delay
- "TIDY UP!" text appears in the announcement area with a countdown bar showing remaining cleanup time
- Debris pieces gain glowing borders and a bob animation, becoming visually prominent
- Debris pieces become clickable — tapping one removes it with a pop animation and reduces the mess meter
- A pop/sweep SFX plays on each debris tap
- When the countdown expires, cleanup state ends and the next wave begins normally
- Debris that was not tapped remains on the grid (still subtle) for future cleanup windows

**User guidance:**
- Discovery: "TIDY UP!" announcement appears between waves, debris lights up and bobs
- Key steps: 1. When "TIDY UP!" appears, tap the glowing debris on the grid as fast as you can. 2. Each tap clears a piece and drops the mess bar. 3. When the timer runs out, the next wave starts — whatever you didn't clean stays.

**Design rationale:** This is the core engagement fix — the dead "waiting" state between waves becomes an active mini-game. Frantic tapping is inherently fun for kids (same appeal as whack-a-mole). The time pressure means you can never clean everything, so the mess accumulates across a round, building toward Mum's check.

**Interaction model:** New input pattern — tapping debris objects on the grid during cleanup phase. Different from spark collection (sparks float and are always clickable) and defender placement (click empty cell). Debris sits on occupied or empty cells, has glowing highlight to signal "tap me", and only responds to clicks during cleanup state. Grid cell placement clicks are disabled during cleanup to prevent accidental defender placement.

### US-27 — Mum's ultimatum

As a player, I want Mum to show up at the end of each round to judge how messy the room is, rewarding me for keeping it clean or punishing me if I let it get out of control, so that the mess meter has real consequences and I feel tension building toward each round end.

**Acceptance criteria:**
- After cleanup at round boundaries (after wave 3 and wave 6), Mum's evaluation triggers
- If mess level exceeds threshold: speech bubble "This room is a DISASTER!" appears, a random placed defender is removed with a dramatic poof/confiscation animation
- If mess level is below threshold: speech bubble "Not bad!" appears, a free random-type defender is placed on a random empty grid cell
- Mess bar resets to 0 after Mum's evaluation completes
- Wave 7 (final wave) has no Mum check or cleanup phase — pure survival to the end
- Confiscation removes the defender from both visual scene and placement/grid tracking
- Reward defender placement triggers the standard placement bounce-in animation and SFX

**User guidance:**
- Discovery: Mum's speech bubble appears automatically at round end
- Key steps: 1. After wave 3 (and wave 6), Mum checks the room. 2. If the mess bar is too high, she takes one of your toys at random — poof, it's gone! 3. If you kept it clean, she gives you a free toy. 4. The mess bar resets after her visit.

**Design rationale:** Without consequences, the mess meter is decorative. Mum's ultimatum makes it load-bearing — players actively care about keeping mess low because losing a random defender could break their defense. The reward creates a positive feedback loop for good play. Random confiscation (not "most expensive") is scarier and fairer — any toy could go. Final wave 7 skips Mum to keep the climax pure combat.

**Interaction model:** No player input during Mum's evaluation — it's a brief cinematic moment (speech bubble + animation, ~3 seconds). Plays automatically at round boundaries. Player watches and reacts.

## Done-when (observable)

- [ ] `src/systems/Mess.ts` exists and exports a Mess class with `addMess(amount)`, `getMess()`, `getLevel()` (returns 0-1 ratio), and `reset()` methods [US-24]
- [ ] Projectile-hit code path calls `Mess.addMess()` with a small value — `Mess.getMess()` increases after a projectile hit event [US-24]
- [ ] Enemy-death code path calls `Mess.addMess()` with a medium value — `Mess.getMess()` increases after an enemy death event [US-24]
- [ ] Defender-destruction code path calls `Mess.addMess()` with a large value — `Mess.getMess()` increases after a defender is destroyed [US-24]
- [ ] A mess meter bar is rendered in the HUD area, visually reflecting `Mess.getLevel()` as a fill percentage [US-24]
- [ ] Semi-transparent debris shapes (alpha <= 0.4) appear on grid cells when mess events fire, at depth below defenders/enemies [US-24]
- [ ] Debris shapes do not receive pointer input during combat (no `setInteractive` during wave states) [US-24]
- [ ] `Mess.addMess()` clamps the internal value so `getLevel()` never exceeds 1.0 — calling `addMess(999)` results in `getLevel() === 1.0` [US-24]
- [ ] `test/Mess.test.ts` exists and passes with tests covering addMess accumulation, getLevel ratio, reset to zero, threshold checks, and overflow clamping [US-24]
- [ ] `LEVEL_1` in `src/config/levels.ts` contains 7 waves with escalating enemy count (wave 1: 2 enemies, wave 7: 8+ enemies) [US-25]
- [ ] `WaveManager` exposes a `currentRound` property returning the round number (1 for waves 1-3, 2 for waves 4-6, 0 for wave 7) [US-25]
- [ ] `WaveManager` exposes an `isRoundBoundary` property that returns true when the current wave is the last in a round (wave 3, wave 6) and the wave has completed [US-25]
- [ ] Progress dots in HUD show a visual gap or separator between round groups (dots 1-3, gap, dots 4-6, gap, dot 7) [US-25]
- [ ] `test/WaveManager.test.ts` includes test cases verifying `currentRound` and `isRoundBoundary` for waves 1-7 [US-25]
- [ ] When a wave's enemies are all spawned and defeated/escaped, the game enters a "cleanup" state before the inter-wave delay [US-26]
- [ ] "TIDY UP!" text is displayed in the announcement text area when cleanup state begins [US-26]
- [ ] A countdown bar is visible during cleanup state, showing remaining cleanup time (default ~5 seconds) [US-26]
- [ ] Debris pieces gain a stroke (2px, alpha >= 0.8) and a looping bob tween (vertical offset ±4px, duration 600-800ms) when cleanup state begins [US-26]
- [ ] Debris pieces become interactive (clickable) during cleanup state — clicking one destroys it with a scale-to-zero animation (1.0 → 0 over 150-250ms, alpha fade to 0) [US-26]
- [ ] Each debris tap reduces `Mess.getMess()` by a defined amount [US-26]
- [ ] A pop/sweep SFX plays on each debris tap (new function in `src/systems/SFX.ts`) [US-26]
- [ ] Grid cell placement clicks are disabled during cleanup state (clicking a cell does not place a defender) [US-26]
- [ ] During cleanup state, WaveManager does not advance — no enemies spawn, no projectiles fire, existing enemies do not move (combat is fully paused) [US-26]
- [ ] No new debris spawns and `Mess.addMess()` is not called during cleanup state — mess only decreases via taps [US-26]
- [ ] If cleanup begins with 0 debris pieces on the grid, the cleanup timer still runs to completion and transitions to the next wave normally [US-26]
- [ ] Cleanup duration replaces the inter-wave delay — after cleanup ends, the next wave begins with the announcing state (no additional waiting period stacked on top) [US-26]
- [ ] When the cleanup countdown expires, debris pieces lose interactivity and glow (stroke removed, alpha reverts to <= 0.4), and the next wave announcing state begins [US-26]
- [ ] Untapped debris remains on the grid (reverts to subtle alpha <= 0.4) after cleanup ends [US-26]
- [ ] After wave 3 cleanup and wave 6 cleanup, Mum's evaluation triggers (does not trigger after other waves or wave 7) [US-27]
- [ ] If `Mess.getLevel()` > 0.7 at Mum check: a speech bubble with "This room is a DISASTER!" is displayed for 2500-3500ms [US-27]
- [ ] During a high-mess Mum check: one random defender from the `defenders` array is removed — entity destroyed, grid cell freed via `Placement.remove()` — with a poof animation (scale 1.0 → 1.5 → 0 over 300-500ms, alpha fade to 0) [US-27]
- [ ] If `Mess.getLevel()` > 0.7 but 0 defenders are placed, confiscation is skipped — speech bubble still displays, no error thrown [US-27]
- [ ] If `Mess.getLevel()` <= 0.7 at Mum check: a speech bubble with "Not bad!" is displayed for 2500-3500ms and a random defender type is placed on a random empty grid cell with the standard bounce-in animation and placement SFX [US-27]
- [ ] If `Mess.getLevel()` <= 0.7 but 0 empty grid cells exist, reward placement is skipped — speech bubble still displays, no error thrown [US-27]
- [ ] `Mess.reset()` is called after Mum's evaluation completes — mess bar returns to 0 [US-27]
- [ ] Wave 7 transitions directly to the game-over flow with no cleanup or Mum check [US-27]
- [ ] Reward defender placement updates both the visual scene and `Placement`/`Grid` occupancy tracking [US-27]
- [ ] All cleanup tweens, debris objects, speech bubbles, and countdown timers are cleaned up on scene transition — no orphaned objects persist after GameScene ends [phase]
- [ ] AGENTS.md reflects new Mess system module, round structure, cleanup mechanic, and Mum's ultimatum [phase]
- [ ] All existing tests pass after all changes (`npm test` exits 0) [phase]

## Auto-added safety criteria

No new API endpoints, user text input fields, or query interpolation introduced in this phase. All interactions are click-based game mechanics (debris tapping, existing grid placement). No safety criteria required.

## Golden principles (phase-relevant)
- **Game logic separated from Phaser rendering** — Mess.ts is pure TS logic (accumulation, thresholds, reset), testable without Phaser. Cleanup state management in GameScene, rendering separate from logic
- **Config-driven entities** — mess amounts per event, cleanup duration, Mum threshold, wave composition defined as named constants or config, not magic numbers inline
- **Tests run without Phaser** — Mess module and WaveManager round logic testable in Node-based Vitest environment

## AGENTS.md sections affected by this phase
- Directory layout (`src/systems/Mess.ts` new module)
- Game logic architecture (Mess system, round structure, cleanup mechanic, Mum's ultimatum)
- Game config (`levels.ts` expanded to 7 waves)
- Scene flow (new cleanup state between waves, Mum evaluation at round boundaries)

## User documentation impact
No user manual exists for this project. Skip justified: game for kids, interactions are self-evident (tap glowing debris, watch Mum's speech bubble). The game teaches itself through visual cues.
