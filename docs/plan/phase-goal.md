## Phase goal

Tune the game for playtest feedback: boost spark economy (faster drops, larger targets), rework Jack-in-the-Box to drop collectible sparks instead of passive income, rebalance defenders (nerf Water Pistol, cheapen Block Tower, speed up Marble Mine), replace Teddy Bomb with Honey Bear (persistent slow-zone utility defender), and add enemy visual differentiation via scale and per-type ability indicators.

### Stories in scope
- US-32 — Spark economy boost
- US-33 — Jack-in-the-Box rework: collectible spark drops
- US-34 — Defender balance pass
- US-35 — Replace Teddy Bomb with Honey Bear
- US-36 — Enemy visual differentiation

### Done-when (observable)

#### US-32 — Spark economy boost
- [ ] `SPARK_SPAWN_INTERVAL` reduced to <= 4500ms (from 8000ms) [US-32]
- [ ] Spark click zone (interactive Zone) increased to >= 44x44 pixels (from 24x24) [US-32]
- [ ] Spark visual diamond shape scaled proportionally to match the larger click zone [US-32]
- [ ] Enlarged sparks read as glowing collectible tokens — visually distinct from ambient dust motes and projectile impacts (verified by: spark uses multi-layer diamond/star shape at the new scale, not a plain circle) [US-32]

#### US-33 — Jack-in-the-Box collectible spark drops
- [ ] `generatesIncome` for the `generator` entry in DEFENDER_TYPES is 0 [US-33]
- [ ] When a Jack-in-the-Box defender is alive, it spawns a clickable spark token at its grid position every GENERATOR_INCOME_INTERVAL ms [US-33]
- [ ] Generator-spawned sparks are collectible via pointer click — add SPARK_VALUE to economy balance, play collect SFX, show collection animation [US-33]
- [ ] Generator-spawned sparks that are not collected are removed after ~5000ms (no persistent screen clutter from generators) [US-33]
- [ ] Jack-in-the-Box plays a visible produce animation (existing `playProduce()` or equivalent) when spawning a spark [US-33]
- [ ] Test coverage: generator income is 0 — placing a generator and advancing time without clicking does NOT increase economy balance [US-33]

#### US-34 — Defender balance pass
- [x] Water Pistol `damage` reduced to <= 15 (from 25) in `src/config/defenders.ts` [US-34]
- [x] Block Tower `cost` reduced to <= 25 (from 50) in `src/config/defenders.ts` [US-34]
- [x] Block Tower `health` reduced to a value where basic enemy (damage=20) destroys it in 4-5 seconds — i.e., health between 80 and 100 inclusive [US-34]
- [x] Marble Mine `rechargeTime` reduced to <= 20000ms (from 30000ms) in `src/config/defenders.ts` [US-34]
- [x] `MINE_ARM_DELAY` reduced to <= 6000ms (from 10000ms) [US-34]
- [x] All existing tests in `test/` pass with the new balance values — `npm test` exits 0 [US-34]

#### US-35 — Replace Teddy Bomb with Honey Bear
- [ ] `DefenderBehavior` type union includes `'trapper'` and does NOT include `'bomb'` [US-35]
- [ ] `DEFENDER_TYPES` has no `bomb` entry; has a `trapper` entry with name 'Honey Bear', `singleUse: false`, cost between 50-100, health >= 30 [US-35]
- [ ] `bombDetonate` function removed from `src/systems/SingleUse.ts`; mine logic (`mineTriggerCheck`, `MineState`, `createMineState`, `updateMineState`) remains [US-35]
- [ ] GameScene bomb placement branch (`behavior === 'bomb'`) removed; replaced with trapper logic that registers the Honey Bear for periodic honey pot tossing [US-35]
- [ ] Honey Bear periodically creates honey pot objects on grid cells within its lane and range (range >= 3 cells ahead); toss interval between 3000-5000ms [US-35]
- [ ] Honey pots apply a 0.5x speed multiplier to any enemy whose grid cell matches a honey pot cell [US-35]
- [ ] Honey pots expire and are removed after a duration between 6000-10000ms [US-35]
- [ ] `src/systems/HoneyTrap.ts` exists as a pure TS module (no Phaser dependency) exporting honey pot state management: create pot, update/expire pots, check speed modifier for a cell [US-35]
- [ ] DefenderEntity.ts draws a distinct procedural Graphics shape for the `trapper` key — Honey Bear reads as a bear-shaped toy with amber/golden coloring, visually distinct from all other defenders [US-35]
- [ ] Honey pot renders as a visible amber/golden puddle on the grid cell — reads as a sticky slow-zone, not a collectible or decoration [US-35]
- [ ] Honey Bear has an idle animation loop (class baseline — all existing persistent defenders have idle animations) [US-35]
- [ ] Honey Bear has placement bounce-in animation (class baseline — all defenders have this) [US-35]
- [ ] Honey Bear destruction triggers death particles and fade+scale-down (class baseline — all defenders have this) [US-35]
- [ ] Defender unlock map: completing L2 unlocks `trapper` (not `bomb`) [US-35]
- [ ] `test/HoneyTrap.test.ts` exists with >= 6 test cases covering: pot creation with position and duration, pot expiry after duration, speed modifier returns 0.5 for cell with active pot, speed modifier returns 1.0 for cell without pot, multiple pots on different cells, expired pot no longer applies slow [US-35]
- [ ] Bomb-related test cases removed from `test/SingleUseDefenders.test.ts`; mine test cases remain and pass [US-35]

#### US-36 — Enemy visual differentiation
- [ ] `EnemyType` interface in `src/config/enemies.ts` includes an optional `scale?: number` field [US-36]
- [ ] Enemy scale values set: basic (Dust Bunny) = 1.0, tough (Cleaning Robot) >= 1.3, armored (Armored Bunny) between 1.05 and 1.2, jumper (Sock Puppet) <= 0.95 [US-36]
- [ ] `EnemyEntity.ts` applies `scale` from the enemy type config to the rendered Graphics shape (multiplies drawing dimensions) [US-36]
- [ ] Cleaning Robot has at least one added visual detail suggesting mechanical toughness (gear, antenna, or panel lines) [US-36]
- [ ] Sock Puppet has at least one added visual detail suggesting jump capability (spring, coil, or legs) [US-36]
- [ ] Enemy size differences read as a clear visual hierarchy — Cleaning Robot is noticeably larger than Dust Bunny, Dust Bunny is noticeably larger than Sock Puppet (verified by: each type's drawn bounding box differs by at least 15% from its neighbors in the hierarchy) [US-36]
- [ ] Existing movement animations (bounce for Dust Bunny, rock for Cleaning Robot) render correctly at the new scale values — no clipping, no off-center positioning [US-36]
- [ ] Hit flash, death particles, and health bar positioning adjust to the scaled entity size [US-36]

#### Structural
- [ ] AGENTS.md reflects: Honey Bear defender (trapper behavior), removed Teddy Bomb, HoneyTrap system module, enemy scale field, updated balance values introduced in this phase [phase]

### Golden principles (phase-relevant)
- Game logic separated from Phaser rendering — HoneyTrap system is pure TS, speed modifier calculation testable without Phaser; balance values are config-only changes
- Config-driven entities — Honey Bear is a config registry addition with a new behavior key, not hardcoded scene logic; enemy scale is a config field consumed by rendering
- no-silent-pass — all new test files must have unconditional assertions in every test case
- agents-consistency — AGENTS.md must reflect the shipped code state after this phase
