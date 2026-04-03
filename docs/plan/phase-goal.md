## Phase goal

Bridge the pure logic systems from core-loop to a playable game — create Phaser entity game objects for defenders, enemies, and projectiles, wire up a HUD with defender selection and resource display, and integrate the full game loop (spawning, combat, win/lose) in GameScene so the game is actually playable in the browser.

### Stories in scope
- US-12 — Entity game objects
- US-13 — HUD and defender selection
- US-14 — Playable game loop

### Done-when (observable)
- [x] `src/entities/DefenderEntity.ts` exists, exports a Phaser game object that renders a colored rectangle (green=generator, blue=shooter, gray=wall) and a health bar above it; `npm run build` compiles without errors [US-12]
- [x] `src/entities/EnemyEntity.ts` exists, exports a Phaser game object that renders a colored circle (red=basic, purple=tough) and a health bar above it; `npm run build` compiles without errors [US-12]
- [x] `src/entities/ProjectileEntity.ts` exists, exports a Phaser game object that renders a small yellow circle; `npm run build` compiles without errors [US-12]
- [x] Each entity file imports its corresponding config type (`DefenderType`, `EnemyType`) from `src/config/`; verified by grep [US-12]
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

### Golden principles (phase-relevant)
- no-silent-pass (new test for level config must have real assertions, not stubs)
- no-bare-except (any try/catch in scene code must catch specific errors)
- error-path-coverage (invalid placement attempts — occupied cell, insufficient funds — must not crash)
- agents-consistency (AGENTS.md must reflect new entities directory and level config)
