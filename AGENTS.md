# Zombo

## Purpose

**Toy Box Siege** — a bedroom-themed tower defense game inspired by Plants vs Zombies, built as a gift for Jaco's kids. Defenders are toys (Water Pistol, Jack-in-the-Box, Block Tower), enemies are household nuisances (Dust Bunnies, Cleaning Robots). The game starts with a title screen, uses PvZ-style wave pacing with setup periods and announcements, and ends with themed win/lose results.

## Tech stack

- **Language:** TypeScript (strict mode)
- **Game framework:** Phaser 3 (>=3.60)
- **Bundler:** Vite
- **Test runner:** Vitest
- **Scale Manager:** `Phaser.Scale.FIT` with `autoCenter: Phaser.Scale.CENTER_BOTH` — canvas scales to fill the viewport while maintaining the 1.44:1 aspect ratio (576×400 logical resolution); Phaser remaps input coordinates automatically; no scene code changes required when the physical canvas size changes

## Directory layout

| Directory | Contents |
|---|---|
| `src/main.ts` | Entry point — creates `Phaser.Game` instance |
| `src/config/` | Game configuration — Phaser config (`game.ts`), defender type registry (`defenders.ts`), enemy type registry (`enemies.ts`), level configs LEVEL_1-LEVEL_9 and ALL_LEVELS (`levels.ts`) |
| `src/scenes/` | Phaser scenes — `TitleScene.ts` (title + play), `LevelSelectScene.ts` (level select + loadout + enemy bio overlay), `GameScene.ts` (gameplay + tutorial dream bubbles), `GameOverScene.ts` (win/lose + continue + toy unlock card overlay) |
| `src/systems/` | Pure game logic modules — `Grid.ts`, `Economy.ts`, `Placement.ts`, `WaveManager.ts`, `EnemyMovement.ts`, `Combat.ts`, `GameFlow.ts`, `SFX.ts`, `SingleUse.ts`, `LevelProgress.ts`, `DefenderUnlocks.ts`, `HoneyTrap.ts`, `Tutorial.ts` |
| `src/entities/` | Phaser game objects — `DefenderEntity.ts` (per-key shape drawing incl. trapper/mine, idle animations, combat reactions), `EnemyEntity.ts` (per-key shape drawing incl. armored/jumper, movement animations, hit flash, helmet degradation, per-type scale), `ProjectileEntity.ts` (yellow circle) |
| `test/` | Vitest unit tests — one test file per game logic module |
| `docs/reference/` | PvZ1 game design reference library — plant catalogue, zombie catalogue, level/map reference, game systems, art/audio direction, spin-off proposals |
| `docs/product/` | Product specs — PRD, per-phase spec files |
| `docs/plan/` | Build loop state — progress, phase goals, logs, archive |
| `docs/architecture/` | Architecture docs — structural intent and module topology |

## Running

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript compile + Vite production build |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |

## Game logic architecture

- **Grid** (5 rows × 9 cols): cell-coordinate API, bounds validation, occupancy via Placement
- **Economy**: balance tracking, spend with rejection, reset. Income from two sources: floating spark tokens (click to collect, replaces passive timer) and generator defenders (automatic)
- **Variable lanes**: LevelConfig includes optional `activeLanes?: number[]` field specifying playable grid rows. GameScene renders active lanes at full brightness, inactive lanes dimmed (0.25 alpha). Click zones created only for active lanes. Enemy spawns filtered to active lanes. Atmosphere decorations placed only in active lane cells. Omitting `activeLanes` defaults to all 5 rows (backward compatible).
- **Defenders**: 5 types — Jack-in-the-Box/generator (drops collectible sparks at its position, no passive income), Water Pistol/shooter (ranged projectile attack, damage 15), Block Tower/wall (cheap sacrificial blocker, cost 25, health 90), Honey Bear/trapper (persistent, tosses honey pots onto cells ahead, pots slow enemies to 0.5x speed for 8s), Marble Mine/mine (single-use, arms after 6s delay, instant-kills first enemy on cell overlap, does not block movement, recharge 20s). DefenderType interface has `behavior`, `singleUse`, and `bio` fields. Recharge timers control cooldown between single-use placements.
- **Enemies**: 4 types — Dust Bunny/basic (fast, low health, scale 1.0), Cleaning Robot/tough (slow, high health, scale 1.35, gear bolt details), Armored Bunny/armored (3x basic health, same speed, scale 1.15, helmet with 3-stage visual degradation), Sock Puppet/jumper (medium speed, scale 0.85, spring coil detail, jumps over first defender encountered via `jumpsRemaining`). EnemyType interface has optional `jumpsRemaining`, `armorStages`, `scale`, and `bio` fields. Scale applies to Graphics shape rendering; health bar and flash overlay adjust proportionally.
- **WaveManager**: state machine driving wave progression: setup (delay before first wave) → announcing (wave announcement text) → spawning (enemy spawns) → waiting (inter-wave delay) → complete. Exposes typed `waveState` property. Configurable `setupDelay`, `interWaveDelay`, `announceDuration`.
- **Tutorial**: L1 includes a 3-step dream bubble tutorial (pure TS in `Tutorial.ts`): step 1 — place generator, step 2 — click spark, step 3 — place pistol. Dream bubbles render as thought-clouds (cream fill, rounded body, trailing circles) at depth 105 with animated pointer arrows at depth 106. Interactive zones are gated per step (only the relevant element responds). Tutorial tracked via localStorage key `tutorial_complete`; replaying L1 skips the tutorial.
- **Level progression**: 9 guided levels (ALL_LEVELS length 9). L1: 1 lane (center row), tutorial mode, 1 wave, starting balance 75 (generator affordable, pistol not). L2: 3 lanes, 2 waves, basic enemies. L3: 5 lanes, 3 waves, basic enemies. L4: 5 lanes, 3 waves, basic enemies (Block Tower available). L5: 5 lanes, 4 waves, basic + armored from wave 2 (pre-round enemy bio). L6: 5 lanes, 4 waves, basic + Cleaning Robot from wave 2 (pre-round enemy bio for tough). L7: 5 lanes, 4 waves, Cleaning Robots in every wave (Honey Bear practice). L8: 5 lanes, 4 waves, no Sock Puppets in wave 1, jumpers from wave 2 (pre-round enemy bio for jumper). L9: 5 lanes, 5 waves, all 4 enemy types, first loadout selection moment. LevelConfig includes `startingBalance`, `tutorialMode`, and `enemyBio` fields. Level progress persisted to localStorage (`zombo_progress`). LevelSelectScene shows locked/unlocked/completed states.
- **Defender unlocks**: L1 start = [generator, shooter]. UNLOCK_MAP: completing L3 unlocks wall (Block Tower), completing L6 unlocks trapper (Honey Bear), completing L8 unlocks mine (Marble Mine). Unlock state persisted to localStorage (`zombo_unlocks`). Pre-level loadout selection appears when player has > 4 unlocked defenders (max 4 selectable) — first triggered naturally before L9. Loadout cards use proportional sizing derived from GAME_WIDTH/GAME_HEIGHT (no hardcoded px), with staggered entry animation, selection bounce tween, and idle bob on defender previews.
- **Toy unlock card**: After completing a level that triggers a defender unlock, GameOverScene shows a full-screen overlay card with the toy visual (DRAW_DEFENDER at 2x), name, cost, and bio text. Cream background with warm brown border (#5d4037). Card slides in from above (400ms). "Collect!" button dismisses. Tracked via localStorage `bio_shown_defender_<key>`.
- **Enemy bio screen**: Before starting a level with `enemyBio` configured (L5 for Armored Bunny, L6 for Cleaning Robot, L8 for Sock Puppet), LevelSelectScene shows a pre-round overlay card with the enemy visual (DRAW_ENEMY at 2x), name, and bio text. Same card styling as toy unlock. "Continue" button dismisses. Tracked via localStorage `bio_shown_enemy_<key>`.
- **Combat**: shooter auto-fires projectiles at nearest lane enemy in range; walls block enemies and take damage. Hit flash (white overlay), death particles (per-type color burst), projectile impact burst, camera shake on final wave
- **SFX**: procedural sound effects via Web Audio API (OscillatorNode, GainNode, noise buffers). Pure TypeScript, no Phaser dependency. Lazy AudioContext creation for Node test compatibility. Trigger functions: place, fire, hit, death, collect, announce. Mute toggle in HUD
- **Animations**: all entity types have tween-based animations — defenders: idle loops (bob/wiggle/sway) and combat reactions (recoil/pulse), enemies: movement animations (bounce/rock). Placement bounce-in on defender creation
- **SingleUse**: pure logic for mine trigger (`mineTriggerCheck`, `MineState` arm timer). No Phaser dependency.
- **HoneyTrap**: pure logic for honey pot state management (`createHoneyPot`, `updateHoneyPots`, `getSpeedModifier`). Pots expire after `HONEY_POT_DURATION` (8s), apply `HONEY_POT_SLOW` (0.5x) speed multiplier. No Phaser dependency.
- **Spark collection**: floating blue multi-layer diamond tokens spawn above grid every 12s (SPARK_SPAWN_INTERVAL=12000), drift down, player clicks to collect 50 sparks (SPARK_VALUE=50) via 48x48 click zone. Uncollected sparks removed at grid bottom. Jack-in-the-Box generator also drops clickable sparks at its position every 8s (GENERATOR_INCOME_INTERVAL=8000); generator sparks auto-expire after 5s (GENERATOR_SPARK_EXPIRY). Replaces invisible passive income timer
- **Atmosphere**: bedroom environment — furniture silhouettes, decorative toy details, floating dust motes (all at depth -10, no pointer input). Themed backgrounds on TitleScene and GameOverScene
- **GameFlow**: playing/won/lost state machine — lose when enemy reaches col 0, win when all waves spent and no enemies alive
- **EnemyMovement**: `moveEnemy` for leftward advance, `attemptJump` for Sock Puppet jump-over-defender logic (pure TS)

## Depth layer map

| Layer | Depth | Contents |
|---|---|---|
| Grid tiles | 0 | Carpet grid cells |
| Atmosphere | -10 | Furniture silhouettes, toy details, dust motes |
| Entities | 5 | Defenders, enemies, projectiles |
| Sparks | 10 | Floating/generator spark tokens |
| HUD | 50 | Balance text, wave text, progress dots, countdown bar |
| Dream bubbles | 105 | Tutorial thought-cloud overlays |
| Dream pointer | 106 | Animated pointer arrows during tutorial |
| Overlay background | 199 | Dimmed full-screen backdrop for card overlays |
| Overlay card | 200 | Toy unlock card / enemy bio card |
| Overlay button | 201 | "Collect!" / "Continue" buttons on card overlays |

## Testing conventions

- All game logic lives in `src/systems/` and `src/config/` as pure TypeScript — no Phaser dependencies in logic modules
- Each module has a corresponding `test/<Module>.test.ts` file
- Tests use Vitest with `node` environment (no browser needed for logic tests)
- Phaser-dependent code (scenes, rendering) is not unit tested — logic is separated from rendering
- `SFX.ts` uses lazy AudioContext (created on first sound trigger, not on import) so tests pass in Node without browser APIs
- `SingleUse.ts`, `HoneyTrap.ts`, `LevelProgress.ts`, `DefenderUnlocks.ts`, `EnemyMovement.ts`, `Tutorial.ts` are pure TS with no browser dependency
- `LevelProgress.ts` and `DefenderUnlocks.ts` accept optional `Storage` parameter for testing with mock storage

## Quality checks

- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
