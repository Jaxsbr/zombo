# Phase: viewport-scale

Status: draft

## Design direction

Preserve existing bedroom toy-box aesthetic. This phase adds no new visual elements — the canvas border (`3px solid #5d4037`, `border-radius: 8px`, `box-shadow`), the page background (`#3e2723` with floorboard stripe pattern), and all scene layouts are unchanged. The canvas simply renders larger; its visual contents are unchanged.

## Stories

### US-39 — Viewport scaling

As a player, I want the game to scale up to fill my browser window, so that I can see all game elements clearly and comfortably without straining on large screens.

**Acceptance criteria:**
- On launch, the Phaser canvas scales to fill the available viewport (FIT mode — scales as large as possible while maintaining aspect ratio, with letterboxing if the viewport aspect ratio differs from the game's 1.44:1)
- The canvas is centred horizontally and vertically in the browser window
- The logical game resolution (GAME_WIDTH=576, GAME_HEIGHT=400) is unchanged — no scene layout code requires modification
- Scaling works at any browser window size — no scrollbars appear, canvas never overflows the viewport
- Input coordinates (mouse/touch) remain accurate after scaling

**User guidance:**
- Discovery: Automatic — takes effect on page load, transparent to the player
- Manual section: N/A — game UI, self-evident
- Key steps: 1. Open the game in a browser window. 2. The game canvas automatically fills the available screen space while maintaining proportions.

**Design rationale:** Phaser's built-in Scale Manager (FIT mode) is used rather than CSS transforms or manual canvas resizing because it automatically remaps input coordinates to logical space, requires zero scene code changes (the logical resolution is preserved), and handles letterboxing/pillarboxing correctly at any viewport size. `autoCenter: CENTER_BOTH` keeps the canvas centred without additional CSS layout work.

## Done-when (observable)

### US-39 — Viewport scaling

- [ ] `src/config/game.ts` `gameConfig` includes a `scale` property with `mode: Phaser.Scale.FIT` [US-39]
- [ ] `src/config/game.ts` `gameConfig` `scale` property includes `autoCenter: Phaser.Scale.CENTER_BOTH` [US-39]
- [ ] `GAME_WIDTH` constant in `src/config/game.ts` is 576 (unchanged) [US-39]
- [ ] `GAME_HEIGHT` constant in `src/config/game.ts` is 400 (unchanged) [US-39]
- [ ] `index.html` body CSS includes `height: 100vh` (so Phaser can measure the full viewport height) [US-39]
- [ ] `index.html` body CSS includes `overflow: hidden` (prevents scrollbars when canvas fills viewport) [US-39]
- [ ] `index.html` body background color remains `#3e2723` — page background matches the bedroom aesthetic so letterbox regions do not show a jarring contrast colour [US-39]
- [ ] `index.html` canvas CSS retains `border: 3px solid #5d4037` and `border-radius: 8px` (visual treatment preserved after scaling) [US-39]
- [ ] `npm test` passes — no existing Vitest unit tests broken [US-39]

### Structural

- [ ] AGENTS.md `Tech stack` or game config section documents the Scale Manager strategy (`Phaser.Scale.FIT`, `autoCenter: CENTER_BOTH`) introduced in this phase [phase]

### Safety criteria

N/A — this phase introduces no endpoints, user input fields, or query interpolation. Changes are config and CSS only.

### Visual verification note

This project tests game logic only (Vitest, node environment); Phaser rendering is not unit-tested. The scaling behaviour (canvas fills the viewport at runtime) is verified by the human reviewer at the review gate by loading the game in a browser. The code config criteria above ensure the correct Scale Manager mode is wired up; Phaser's FIT mode deterministically produces the expected behaviour when the config is correct.

## AGENTS.md sections affected

- **Tech stack** — add Scale Manager entry: `Phaser.Scale.FIT` with `autoCenter: CENTER_BOTH`
- **Game logic architecture** (or a new "Display" section) — document that GAME_WIDTH/GAME_HEIGHT are logical dimensions only; physical canvas size is controlled by Scale Manager at runtime

## User documentation

N/A — this is a game. Scaling behaviour is transparent to players.

## Golden principles (phase-relevant)

- Game logic separated from Phaser rendering — this change is config-only; no scene logic is affected
- agents-consistency — AGENTS.md must reflect the Scale Manager configuration after this phase
