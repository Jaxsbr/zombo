# Phase: playable

Status: draft

## Design direction

Placeholder/minimal — colored geometric shapes, no themed art. Defenders: green rectangle (generator), blue rectangle (shooter), gray rectangle (wall). Enemies: red circle (basic), purple circle (tough). Projectiles: small yellow circle. Health bars: thin colored rectangles above entities (green→red gradient). HUD: dark background with monospace text.

## Stories

### US-12 — Entity game objects

As a developer, I want Phaser game objects for defenders, enemies, and projectiles, so that the pure logic systems have a visual representation on screen.

**Acceptance criteria:**
- DefenderEntity renders a colored rectangle sized to fit a grid cell, with color based on defender type (green=generator, blue=shooter, gray=wall)
- DefenderEntity renders a thin health bar above the rectangle that shrinks as health decreases
- EnemyEntity renders a colored circle with color based on enemy type (red=basic, purple=tough) and a health bar
- ProjectileEntity renders a small yellow circle that moves rightward across the grid
- All entity classes accept their config type and grid/pixel position in the constructor

**User guidance:** N/A — internal rendering layer

**Design rationale:** Container-based game objects (rectangle + health bar as children) keep rendering self-contained per entity while allowing the scene to manage them as a group. Colored shapes are the simplest visual that distinguishes types at a glance.

### US-13 — HUD and defender selection

As a player, I want to see my resources and select which defender to place, so that I can make informed placement decisions.

**Acceptance criteria:**
- HUD area displays the current resource balance, updated in real-time as resources change
- HUD area displays the current wave number and total waves (e.g., "Wave 2/5")
- A defender selection panel shows all 3 defender types with name, cost, and a colored preview
- Clicking a panel item selects that defender type (visually highlighted)
- Clicking a grid cell while a defender is selected places it if the cell is empty and funds are sufficient
- Panel items that the player can no longer afford are visually dimmed

**Interaction model:** Player clicks a defender card in the HUD panel → card highlights to indicate selection. Player then clicks an empty grid cell → defender appears, balance decreases, card de-highlights if no longer affordable. Clicking a different card switches selection. Clicking an occupied cell or having insufficient funds does nothing (no error popup — the non-response is the feedback for the prototype).

**User guidance:**
- Discovery: Defender cards are visible in the HUD bar at the top of the screen
- Manual section: N/A (no manual — prototype)
- Key steps: (1) Click a defender card to select it, (2) Click an empty grid cell to place the defender, (3) Watch your resource balance decrease

**Design rationale:** A click-to-select-then-click-to-place two-step flow matches PvZ's seed-packet interaction and is the most intuitive pattern for grid-based placement. Dimming unaffordable cards provides passive feedback without modal dialogs.

### US-14 — Playable game loop

As a player, I want enemies to spawn, defenders to fight them, and the game to end when I win or lose, so that I have a complete gameplay experience.

**Acceptance criteria:**
- A sample level config with 5 waves of escalating difficulty is defined
- Enemies spawn from the right edge according to the wave config, rendered as EnemyEntity instances
- Enemies move leftward each frame by their speed
- Shooter defenders auto-fire projectiles at enemies in their lane; projectiles move rightward and deal damage on hit
- Wall defenders block enemies; enemies attack walls, reducing their health
- Generator defenders produce income on a timed interval
- Passive sky-drop income arrives on a timed interval
- Dead enemies and destroyed defenders are removed from the screen
- When all waves are complete and no enemies remain, the game transitions to GameOverScene with `won: true`
- When any enemy reaches column 0, the game transitions to GameOverScene with `won: false`
- Restarting from GameOverScene starts a fresh game (all systems reset, grid cleared)

**User guidance:**
- Discovery: Game starts automatically when the page loads — enemies begin spawning after a brief delay
- Manual section: N/A
- Key steps: (1) Place defenders to build your defence before enemies arrive, (2) Watch combat play out automatically, (3) Survive all 5 waves to win — or lose if any enemy reaches the left edge

**Design rationale:** Wiring happens in GameScene.create() (initialization) and GameScene.update() (per-frame loop). All game logic stays in the pure systems — the scene only translates between system state and Phaser rendering. This preserves the testable logic/rendering separation from core-loop.

## Done-when (observable)

- [ ] `src/entities/DefenderEntity.ts` exists, exports a Phaser game object that renders a colored rectangle (green=generator, blue=shooter, gray=wall) and a health bar above it; `npm run build` compiles without errors [US-12]
- [ ] `src/entities/EnemyEntity.ts` exists, exports a Phaser game object that renders a colored circle (red=basic, purple=tough) and a health bar above it; `npm run build` compiles without errors [US-12]
- [ ] `src/entities/ProjectileEntity.ts` exists, exports a Phaser game object that renders a small yellow circle; `npm run build` compiles without errors [US-12]
- [ ] Each entity file imports its corresponding config type (`DefenderType`, `EnemyType`) from `src/config/`; verified by grep [US-12]
- [ ] GameScene creates an `Economy` instance and renders the current balance as text in the HUD area; verified by grep for `Economy` instantiation and `setText` or `text` update in GameScene [US-13]
- [ ] GameScene creates a `WaveManager` instance and renders the current wave number and total waves in the HUD; verified by grep for `WaveManager` and wave text in GameScene [US-13]
- [ ] GameScene renders a defender selection panel with all 3 defender types showing name and cost; verified by grep for `DEFENDER_TYPES` iteration and text creation in GameScene [US-13]
- [ ] GameScene registers `pointerdown` handlers on both panel items (to select a defender type) and grid cells (to place the selected defender via `Placement`); verified by grep for `pointerdown` and `Placement` usage in GameScene [US-13]
- [ ] `src/config/levels.ts` exists and exports a level config with at least 5 waves; unit test verifies the exported level has `waves.length >= 5` [US-14]
- [ ] GameScene.update() calls `WaveManager.update()` and spawns `EnemyEntity` instances for each returned spawn; verified by grep for `waveManager` and `EnemyEntity` in GameScene.update or a method it calls [US-14]
- [ ] GameScene.update() runs the combat loop: calls `updateShooterCooldown`, `tryFire`, `moveProjectile`, `checkProjectileHit`, `applyDamage`, and removes dead entities; verified by grep for these function imports and calls in GameScene [US-14]
- [ ] GameScene.update() calls `GameFlow.update()` and transitions to `GameOverScene` with `{ won }` data when state is no longer `playing`; verified by grep for `gameFlow` and `scene.start('GameOverScene'` in GameScene [US-14]
- [ ] Economy generates passive income on a timed interval and generator defenders call `addIncome`; verified by grep for `time.addEvent` or equivalent timer and `addIncome` in GameScene [US-14]
- [ ] Restarting from GameOverScene produces a fresh game state; GameScene.create() initializes all systems from scratch (new Economy, Grid, Placement, WaveManager, GameFlow); verified by grep for system constructors in GameScene.create [US-14]
- [ ] All existing unit tests still pass; `npm test` reports 0 failures and >= 67 passing tests [phase]
- [ ] `npm run build` succeeds without TypeScript errors [phase]
- [ ] AGENTS.md reflects the new `src/entities/` directory and `src/config/levels.ts` [phase]

## Golden principles (phase-relevant)
- no-silent-pass (new test for level config must have real assertions, not stubs)
- no-bare-except (any try/catch in scene code must catch specific errors)
- error-path-coverage (invalid placement attempts — occupied cell, insufficient funds — must not crash)
- agents-consistency (AGENTS.md must reflect new entities directory and level config)
