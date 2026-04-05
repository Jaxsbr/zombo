# Phase: economy-polish

Status: shipped

## Design direction

Same bedroom toy-box aesthetic. Loadout cards should feel like toy catalogue entries — bold, chunky, inviting. Proportional sizing throughout so the UI scales naturally with future viewport increases. Animations should be playful (bouncy easing, slight overshoot).

## Stories

### US-37 — Spark economy rebalance

As a player, I want sparks to appear less often but be worth more, so that I spend less time clicking and more time strategising during waves.

**Acceptance criteria:**
- Floating spark spawn interval doubled (slower drops, less clicking)
- Floating spark collection value doubled (same economy throughput over time)
- Generator sparks (Jack-in-the-Box) unchanged
- No changes to spark visual size or click zone

**User guidance:** N/A — tuning change to existing mechanic, self-evident.

**Design rationale:** At 6s/25 sparks, players click ~10 times per minute for 250 sparks/min income. At 12s/50 sparks, they click ~5 times per minute for the same 250 sparks/min. Less click spam, same economy, but delayed first purchase (12s instead of 6s to get the first spark).

### US-38 — Loadout selection visual overhaul

As a player, I want the toy selection screen to show large, animated defender previews, so that picking my loadout feels exciting and I can clearly see what each toy looks like.

**Acceptance criteria:**
- Defender preview images significantly larger than current (current scale 0.55)
- Cards use proportional sizing derived from game viewport dimensions (GAME_WIDTH, GAME_HEIGHT), not hardcoded pixel values — so they scale with future viewport changes
- Cards have entry animation when the loadout screen appears (staggered appearance)
- Selected cards have a distinct animated response (scale bounce or highlight pulse)
- Defender previews have a gentle idle animation (bob or sway)
- Card layout fills more of the available screen space than the current compact row

**User guidance:**
- Discovery: Loadout screen appears automatically before levels when player has > 4 unlocked defenders
- Manual section: N/A — game UI, self-evident
- Key steps: 1. Start a level (after unlocking 5+ defenders). 2. See the enlarged toy selection with animated previews. 3. Tap cards to select — selected cards animate. 4. Press Go.

**Design rationale:** Current cards are 100x120px with 0.55x preview scale — the defender shapes are tiny and hard to appreciate. The loadout screen is the player's "shop window" moment; larger previews and animation make it feel like browsing a toy catalogue. Proportional sizing (derived from GAME_WIDTH/GAME_HEIGHT rather than hardcoded px) ensures the layout scales naturally when the game viewport is eventually enlarged.

**Interaction model:** Same click-to-select/deselect as current. No new input mechanism. Visual changes only — larger cards, animations, proportional layout.

## Done-when (observable)

### US-37 — Spark economy rebalance

- [ ] `SPARK_SPAWN_INTERVAL` is 12000 (doubled from 6000) in `src/scenes/GameScene.ts` [US-37]
- [ ] `SPARK_VALUE` is 50 (doubled from 25) in `src/scenes/GameScene.ts` [US-37]
- [ ] `GENERATOR_INCOME_INTERVAL` is unchanged at 8000 in `src/scenes/GameScene.ts` [US-37]
- [ ] `npm test` passes with no test changes required (no tests reference spark constants directly) [US-37]

### US-38 — Loadout selection visual overhaul

- [ ] Card dimensions in `showLoadoutSelection()` are computed proportionally from `GAME_WIDTH` and `GAME_HEIGHT` — no hardcoded pixel values for card width, card height, padding, or gap [US-38]
- [ ] Defender preview scale is >= 0.75 (up from 0.55), computed proportionally to card size [US-38]
- [ ] Cards have a staggered entry animation when the loadout screen appears (each card appears with a delay offset, not all at once) [US-38]
- [ ] Selecting a card triggers a visible scale or bounce tween (not just a colour change) [US-38]
- [ ] Defender preview containers have a gentle idle animation (bob or sway tween loop) [US-38]
- [ ] Card layout uses the full available vertical space — cards occupy at least 40% of GAME_HEIGHT [US-38]
- [ ] Loadout cards read as a toy catalogue — each defender preview is large enough to see its distinctive shape details (verified by: preview bounding box is at least 50x50px at the current 576x400 viewport, scaling up proportionally with larger viewports) [US-38]
- [ ] `npm test` passes — no existing tests broken by loadout visual changes [US-38]

### Structural

- [ ] AGENTS.md reflects updated spark economy constants (SPARK_SPAWN_INTERVAL, SPARK_VALUE) and loadout proportional sizing approach introduced in this phase [phase]

### Safety criteria

N/A — this phase introduces no endpoints, user input fields, or query interpolation. Changes are constant-value tuning and visual presentation only.

## AGENTS.md sections affected

- **Spark collection** — updated SPARK_SPAWN_INTERVAL (6000 → 12000) and SPARK_VALUE (25 → 50) constants
- **Scene flow** — loadout selection uses proportional sizing derived from GAME_WIDTH/GAME_HEIGHT

## User documentation

N/A — this is a game. Mechanics are communicated through in-game UI.

## Golden principles (phase-relevant)

- Game logic separated from Phaser rendering — spark economy is a constant-only change, no rendering logic affected
- Config-driven entities — defender previews already use DRAW_DEFENDER registry; this phase changes presentation, not data
- no-silent-pass — any new test cases must have unconditional assertions
- agents-consistency — AGENTS.md must reflect shipped code state after this phase
