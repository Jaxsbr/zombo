## Phase goal

Enable Phaser's built-in Scale Manager so the game canvas fills the available browser viewport at any window size, while preserving the logical game resolution (576×400), bedroom aesthetic, and accurate input coordinate mapping. Changes are config and CSS only — no scene logic requires modification.

### Stories in scope
- US-39 — Viewport scaling

### Done-when (observable)
- [x] `src/config/game.ts` `gameConfig` includes a `scale` property with `mode: Phaser.Scale.FIT` [US-39]
- [x] `src/config/game.ts` `gameConfig` `scale` property includes `autoCenter: Phaser.Scale.CENTER_BOTH` [US-39]
- [x] `GAME_WIDTH` constant in `src/config/game.ts` is 576 (unchanged) [US-39]
- [x] `GAME_HEIGHT` constant in `src/config/game.ts` is 400 (unchanged) [US-39]
- [x] `index.html` body CSS includes `height: 100vh` (so Phaser can measure the full viewport height) [US-39]
- [x] `index.html` body CSS includes `overflow: hidden` (prevents scrollbars when canvas fills viewport) [US-39]
- [x] `index.html` body background color remains `#3e2723` — page background matches the bedroom aesthetic so letterbox regions do not show a jarring contrast colour [US-39]
- [x] `index.html` canvas CSS retains `border: 3px solid #5d4037` and `border-radius: 8px` (visual treatment preserved after scaling) [US-39]
- [x] `npm test` passes — no existing Vitest unit tests broken [US-39]
- [x] AGENTS.md `Tech stack` or game config section documents the Scale Manager strategy (`Phaser.Scale.FIT`, `autoCenter: CENTER_BOTH`) introduced in this phase [phase]

### Golden principles (phase-relevant)
- Game logic separated from Phaser rendering — this change is config-only; no scene logic is affected
- agents-consistency — AGENTS.md must reflect the Scale Manager configuration after this phase
