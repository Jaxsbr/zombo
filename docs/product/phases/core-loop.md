# Phase: core-loop

Status: draft

## Stories

### US-07 — Project scaffolding and game grid

As a developer, I want a Phaser 3 + TypeScript project with a rendered lane grid, so that I have a foundation to build gameplay on.

**Acceptance criteria:**
- `npm install && npm run dev` starts a dev server serving the game
- TypeScript compiles in strict mode with no errors
- A 5-row × 9-column grid is rendered as the playing field with visually distinct cells
- The game window fits the grid with a HUD area above or below

**User guidance:** N/A — developer setup

**Design rationale:** Vite is the standard fast bundler for modern TS/Phaser projects. 5×9 grid matches PvZ Day layout — the simplest starting point before world-specific mechanics.

### US-08 — Resource economy and defender placement

As a player, I want to collect resources and spend them to place defenders on the grid, so that I can build my defence before enemies arrive.

**Acceptance criteria:**
- Resources ("energy") generate passively over time (falling drops) and the player starts with a configurable amount
- A resource counter is visible in the HUD
- At least 3 defender types available: generator (produces extra resources), shooter (ranged attack), wall (high health blocker)
- Clicking a defender in the selection panel, then clicking an empty grid cell, places it and deducts the cost
- Occupied cells reject further placement

**User guidance:**
- Discovery: Defender selection panel at the top of the screen, resource counter in HUD
- Manual section: N/A (no manual yet — core prototype)
- Key steps: (1) Select a defender type from the panel, (2) Click an empty grid cell to place it, (3) Watch your resource balance decrease by the defender's cost

**Design rationale:** Three defender types (generator, shooter, wall) is the minimum set to create interesting placement decisions — pure economy vs offence vs defence. This mirrors PvZ's Sunflower/Peashooter/Wall-nut trinity.

### US-09 — Enemy waves and lane movement

As a player, I want enemies to spawn in waves and walk toward my base, so that there's a threat I need to defend against.

**Acceptance criteria:**
- Enemies spawn from the right edge of the grid and move left along their assigned lane
- At least 2 enemy types: basic (normal health/speed) and tough (more health, slower)
- A wave system drives enemy spawning with configurable wave count per level
- Enemies are staggered within a wave (spawned with delays, not all at once)
- A wave progress indicator is visible in the HUD

**User guidance:**
- Discovery: Enemies appear automatically from the right side of the screen
- Manual section: N/A
- Key steps: (1) Watch the wave indicator to know how many waves remain, (2) Observe enemies entering from the right — basic ones are fast, tough ones are slow but take more hits

**Design rationale:** Two enemy types is the minimum to force strategic choice — the "tough" type punishes players who only build shooters and skip walls. Wave staggering follows PvZ's 1-3 second spawn delay to prevent instant overwhelm.

### US-10 — Combat and health system

As a player, I want my defenders to attack enemies and enemies to take damage, so that I can defeat the incoming waves.

**Acceptance criteria:**
- Shooter defenders automatically fire projectiles at the nearest enemy in their lane
- Projectiles move across the grid and deal damage on collision with an enemy
- Enemies have health that decreases when hit; at 0 health they are removed from the field
- Wall defenders block enemy movement — enemies attack the wall, reducing its health over time
- Defenders have health; when reduced to 0 they are removed from the grid
- Generator defenders do not attack

**User guidance:**
- Discovery: Combat happens automatically once defenders and enemies share a lane
- Manual section: N/A
- Key steps: (1) Place shooters in lanes with incoming enemies, (2) Place walls in front of shooters to absorb damage, (3) Watch projectiles hit enemies and their health decrease

**Design rationale:** Auto-attacking defenders follow PvZ convention — the player's skill is in placement strategy, not aiming. Walls that block and absorb damage create the classic front-line/back-line dynamic that makes lane defence interesting.

### US-11 — Game flow: win, lose, restart

As a player, I want to win when I survive all waves and lose if an enemy reaches my base, so that the game has a clear objective and replayability.

**Acceptance criteria:**
- Lose condition: any enemy reaches the leftmost column (column 0)
- Win condition: all waves complete and no enemies remain on the grid
- A game-over screen shows the win or lose state clearly
- A restart button resets the game to the initial state (clear grid, reset resources, restart waves)

**User guidance:**
- Discovery: Game-over screen appears automatically on win or lose
- Manual section: N/A
- Key steps: (1) Survive all enemy waves to win, (2) If any enemy reaches the left edge you lose, (3) Click restart to play again

**Design rationale:** Simple binary win/lose is the clearest feedback loop for a core prototype. More nuanced scoring (star ratings, mess meters, aftermath scoring) belongs in a themed phase.

## Done-when (observable)

- [ ] `package.json` lists `phaser` (>=3.60) and `typescript` as dependencies; `npm run build` succeeds without errors [US-07]
- [ ] `tsconfig.json` has `"strict": true`; `npx tsc --noEmit` completes with zero errors [US-07]
- [ ] `src/main.ts` exists and creates a `Phaser.Game` instance with a configured scene list [US-07]
- [ ] A grid module in `src/` defines grid dimensions (rows=5, cols=9) and provides a cell-coordinate API; unit test verifies grid cell count equals 45 [US-07]
- [ ] An economy module exposes `getBalance()`, `spend(amount)`, and `addIncome(amount)` functions; unit test verifies starting balance is configurable and `spend` rejects when insufficient funds [US-08]
- [ ] At least 3 defender types are defined in a config/registry, each with `name`, `cost`, `health` properties; unit test verifies all three types exist with valid numeric costs [US-08]
- [ ] A placement module tracks occupied cells; unit test verifies placing on an empty cell succeeds and deducts cost, placing on an occupied cell rejects [US-08]
- [ ] At least 2 enemy types are defined, each with `name`, `health`, `speed` properties; unit test verifies both types exist with distinct health/speed values [US-09]
- [ ] A wave configuration module defines waves as arrays of enemy spawn descriptors (type, count, lane, delay); unit test verifies a sample level has at least 3 waves [US-09]
- [ ] Enemy movement logic moves enemies leftward by their speed per tick; unit test verifies an enemy's x-position decreases after a movement tick [US-09]
- [ ] Shooter defenders have `damage`, `range`, and `fireRate` properties; unit test verifies a shooter deals its configured damage to an enemy in the same lane within range [US-10]
- [ ] Enemy health decreases when hit by a projectile; unit test verifies an enemy at health=100 hit by damage=25 has health=75, and an enemy reaching health<=0 is flagged for removal [US-10]
- [ ] Wall defenders block enemy movement; unit test verifies an enemy stops advancing when it reaches a wall's grid position, and the wall's health decreases as the enemy attacks it [US-10]
- [ ] Game state changes to "lost" when any enemy's x-position reaches column 0; unit test verifies [US-11]
- [ ] Game state changes to "won" when all waves are exhausted and no enemies remain alive; unit test verifies [US-11]
- [ ] A game-over scene/overlay displays the win/lose result and a restart mechanism resets game state; unit test verifies game state resets to initial values after restart [US-11]
- [ ] All game logic modules have corresponding test files; `npm test` runs and all tests pass [phase]
- [ ] AGENTS.md reflects the new `src/` directory layout and module structure introduced in this phase [phase]

## Golden principles (phase-relevant)
- no-silent-pass (every module must have real implementation, not stubs)
- no-bare-except (catch specific errors, not generic catch-all)
- error-path-coverage (error paths in game logic — invalid placement, insufficient funds — must be handled)
- agents-consistency (AGENTS.md must reflect new project structure when phase ships)
