## Phase goal

Tune spark economy for less clicking (slower spawn, higher value) and overhaul the loadout selection screen with large, animated defender previews using proportional sizing derived from game viewport dimensions.

### Stories in scope
- US-37 — Spark economy rebalance
- US-38 — Loadout selection visual overhaul

### Done-when (observable)

#### US-37 — Spark economy rebalance
- [x] `SPARK_SPAWN_INTERVAL` is 12000 (doubled from 6000) in `src/scenes/GameScene.ts` [US-37]
- [x] `SPARK_VALUE` is 50 (doubled from 25) in `src/scenes/GameScene.ts` [US-37]
- [x] `GENERATOR_INCOME_INTERVAL` is unchanged at 8000 in `src/scenes/GameScene.ts` [US-37]
- [x] `npm test` passes with no test changes required (no tests reference spark constants directly) [US-37]

#### US-38 — Loadout selection visual overhaul
- [x] Card dimensions in `showLoadoutSelection()` are computed proportionally from `GAME_WIDTH` and `GAME_HEIGHT` — no hardcoded pixel values for card width, card height, padding, or gap [US-38]
- [x] Defender preview scale is >= 0.75 (up from 0.55), computed proportionally to card size [US-38]
- [x] Cards have a staggered entry animation when the loadout screen appears (each card appears with a delay offset, not all at once) [US-38]
- [x] Selecting a card triggers a visible scale or bounce tween (not just a colour change) [US-38]
- [x] Defender preview containers have a gentle idle animation (bob or sway tween loop) [US-38]
- [x] Card layout uses the full available vertical space — cards occupy at least 40% of GAME_HEIGHT [US-38]
- [x] Loadout cards read as a toy catalogue — each defender preview is large enough to see its distinctive shape details (verified by: preview bounding box is at least 50x50px at the current 576x400 viewport, scaling up proportionally with larger viewports) [US-38]
- [x] `npm test` passes — no existing tests broken by loadout visual changes [US-38]

#### Structural
- [ ] AGENTS.md reflects updated spark economy constants (SPARK_SPAWN_INTERVAL, SPARK_VALUE) and loadout proportional sizing approach introduced in this phase [phase]

#### Safety criteria
N/A — this phase introduces no endpoints, user input fields, or query interpolation. Changes are constant-value tuning and visual presentation only.

### Golden principles (phase-relevant)
- Game logic separated from Phaser rendering — spark economy is a constant-only change, no rendering logic affected
- Config-driven entities — defender previews already use DRAW_DEFENDER registry; this phase changes presentation, not data
- no-silent-pass — any new test cases must have unconditional assertions
- agents-consistency — AGENTS.md must reflect shipped code state after this phase
