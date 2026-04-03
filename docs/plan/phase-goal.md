## Phase goal

Build a playable tower defense core loop — grid-based lane map, resource economy, placeable defenders, enemy waves, combat, and win/lose conditions. All using placeholder art (colored shapes). Theme-agnostic foundation that both spin-off directions (Critter Kitchen, Toy Box Siege) can build on.

### Stories in scope
- US-07 — Project scaffolding and game grid
- US-08 — Resource economy and defender placement
- US-09 — Enemy waves and lane movement
- US-10 — Combat and health system
- US-11 — Game flow: win, lose, restart

### Done-when (observable)
- [x] `package.json` lists `phaser` (>=3.60) and `typescript` as dependencies; `npm run build` succeeds without errors [US-07]
- [x] `tsconfig.json` has `"strict": true`; `npx tsc --noEmit` completes with zero errors [US-07]
- [x] `src/main.ts` exists and creates a `Phaser.Game` instance with a configured scene list [US-07]
- [x] A grid module in `src/` defines grid dimensions (rows=5, cols=9) and provides a cell-coordinate API; unit test verifies grid cell count equals 45 [US-07]
- [x] An economy module exposes `getBalance()`, `spend(amount)`, and `addIncome(amount)` functions; unit test verifies starting balance is configurable and `spend` rejects when insufficient funds [US-08]
- [x] At least 3 defender types are defined in a config/registry, each with `name`, `cost`, `health` properties; unit test verifies all three types exist with valid numeric costs [US-08]
- [x] A placement module tracks occupied cells; unit test verifies placing on an empty cell succeeds and deducts cost, placing on an occupied cell rejects [US-08]
- [x] At least 2 enemy types are defined, each with `name`, `health`, `speed` properties; unit test verifies both types exist with distinct health/speed values [US-09]
- [x] A wave configuration module defines waves as arrays of enemy spawn descriptors (type, count, lane, delay); unit test verifies a sample level has at least 3 waves [US-09]
- [x] Enemy movement logic moves enemies leftward by their speed per tick; unit test verifies an enemy's x-position decreases after a movement tick [US-09]
- [x] Shooter defenders have `damage`, `range`, and `fireRate` properties; unit test verifies a shooter deals its configured damage to an enemy in the same lane within range [US-10]
- [x] Enemy health decreases when hit by a projectile; unit test verifies an enemy at health=100 hit by damage=25 has health=75, and an enemy reaching health<=0 is flagged for removal [US-10]
- [x] Wall defenders block enemy movement; unit test verifies an enemy stops advancing when it reaches a wall's grid position, and the wall's health decreases as the enemy attacks it [US-10]
- [x] Game state changes to "lost" when any enemy's x-position reaches column 0; unit test verifies [US-11]
- [x] Game state changes to "won" when all waves are exhausted and no enemies remain alive; unit test verifies [US-11]
- [x] A game-over scene/overlay displays the win/lose result and a restart mechanism resets game state; unit test verifies game state resets to initial values after restart [US-11]
- [ ] All game logic modules have corresponding test files; `npm test` runs and all tests pass [phase]
- [ ] AGENTS.md reflects the new `src/` directory layout and module structure introduced in this phase [phase]

### Golden principles (phase-relevant)
- no-silent-pass (every module must have real implementation, not stubs)
- no-bare-except (catch specific errors, not generic catch-all)
- error-path-coverage (error paths in game logic — invalid placement, insufficient funds — must be handled)
- agents-consistency (AGENTS.md must reflect new project structure when phase ships)
