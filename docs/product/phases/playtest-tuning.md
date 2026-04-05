# Phase: playtest-tuning

Status: shipped

## Design direction

Same bedroom toy-box aesthetic. Honey Bear is a plush bear shape in amber/golden tones. Honey pots are amber/golden puddles on the grid. Enemy scale variation uses existing procedural Graphics style — just scaled. Enlarged sparks remain blue diamond glow, proportionally bigger. No aesthetic departure from shipped phases.

## Stories

### US-32 — Spark economy boost

As a player, I want sparks to drop more frequently and be easier to click, so that collecting resources feels rewarding instead of frustrating.

**Acceptance criteria:**
- Spark spawn interval reduced (faster drops)
- Spark visual and click target significantly larger
- Sparks still spawn above grid and drift down; uncollected sparks removed at grid bottom

**User guidance:**
- Discovery: Sparks appear on the play field during gameplay — same mechanic, just more frequent and larger
- Manual section: N/A — game mechanic, self-evident
- Key steps: 1. Watch for blue diamond sparks appearing on the grid. 2. Click/tap them to collect.

**Design rationale:** Player testing showed sparks dropped too infrequently (8s) and were too small to click reliably (24px). Doubling frequency and doubling visual/hit size addresses both friction points without changing the core click-to-collect mechanic.

### US-33 — Jack-in-the-Box rework: collectible spark drops

As a player, I want the Jack-in-the-Box to drop clickable sparks near itself instead of generating passive income, so that its purpose is obvious and I stay engaged with it.

**Acceptance criteria:**
- Jack-in-the-Box no longer adds income automatically (generatesIncome = 0)
- Instead, periodically spawns a collectible spark token at its grid position
- Spawned spark behaves like a normal floating spark — clickable, same value, collection animation
- Generator-spawned sparks expire after ~5 seconds if not collected (prevents screen clutter)
- Generator produces a visible pulse or pop animation when spawning a spark

**User guidance:**
- Discovery: Place a Jack-in-the-Box and watch it periodically pop out sparks to collect
- Manual section: N/A — game mechanic, self-evident
- Key steps: 1. Place a Jack-in-the-Box on the grid. 2. Watch for sparks it drops. 3. Click the sparks to collect income.

**Design rationale:** Passive income generation was invisible — the player's balance increased but nothing on screen explained why. Dropping clickable sparks makes the generator's value proposition immediately obvious ("it makes sparks I can grab") and keeps the player engaged with their economy. Same income potential but requires active participation.

**Interaction model:** Same click-to-collect pattern as floating sparks. Generator acts as a localized spark source. No new input mechanism — leverages existing spark collection flow.

### US-34 — Defender balance pass

As a player, I want defenders to be balanced so that no single defender dominates and all feel worth using, giving me meaningful strategic choices.

**Acceptance criteria:**
- Water Pistol damage reduced significantly (nerf — currently too effective as a solo solution)
- Block Tower cost reduced (cheap sacrificial blocker — easy to place under pressure)
- Block Tower health reduced to ~4-5 hits from a basic enemy (disposable, not permanent; still tougher than other non-wall defenders at 1-2 hits)
- Marble Mine recharge time reduced (both placement cooldown and arm delay — currently too slow to feel responsive)
- Existing tests updated to reflect new balance values

**User guidance:** N/A — balance tuning, no new player-facing mechanic.

**Design rationale:** Player testing showed Water Pistol dominates (a single pistol nearly solos basic enemies across the full lane), Block Tower is ignored (too expensive for a wall when pistols handle everything), and Marble Mine feels sluggish (30s recharge + 10s arm delay means nearly a minute before a second mine is useful). Nerfing the pistol creates demand for other defenders; cheapening the tower makes it a viable pressure response; faster mine cooldowns make it a usable tactical tool.

### US-35 — Replace Teddy Bomb with Honey Bear

As a player, I want a utility defender that slows enemies with honey pots, so that I have a tactical tool for controlling enemy speed and buying time for my other defenders.

**Acceptance criteria:**
- Teddy Bomb removed from the game entirely (config, rendering, placement logic, SingleUse bomb logic)
- New defender: Honey Bear — persistent (not single-use), moderate cost, normal health
- Honey Bear periodically tosses honey pots onto cells in its lane (within its range)
- Honey pots land on grid cells and create slow zones — enemies on those cells move at reduced speed (50%)
- Honey pots expire after a duration (~8 seconds)
- Honey Bear has a distinct procedural Graphics shape (bear-themed, amber/golden)
- Honey pots render as visible puddles on the grid
- Completing Level 2 unlocks Honey Bear (same unlock slot as the removed Teddy Bomb)
- DefenderBehavior type updated: 'bomb' replaced with 'trapper'

**User guidance:**
- Discovery: Honey Bear card appears in the HUD panel after completing Level 2
- Manual section: N/A — game mechanic, self-evident
- Key steps: 1. Click the Honey Bear card in the HUD. 2. Place it on the grid. 3. Watch it toss honey pots that slow approaching enemies.

**Design rationale:** Teddy Bomb was never used in player testing — high cost (150), very long recharge (50s), and one-shot instant-kill felt too expensive and situational. Replacing it with a persistent utility defender that provides ongoing value (enemy slow) fills a strategic niche the roster lacks. Honey Bear creates combo potential: slow enemies so pistols get more shots, or slow enemies approaching a cheap wall to extend its life. The honey pot mechanic is visually clear (amber puddles) and thematically fits the toy-box bedroom (sticky honey from a stuffed bear).

**Interaction model:** Same click-card-then-click-cell placement as existing defenders. Once placed, Honey Bear tosses honey pots automatically (no further player interaction) — same passive-after-placement pattern as the Water Pistol's auto-fire.

### US-36 — Enemy visual differentiation

As a player, I want enemies to vary in size and have clear visual indicators of their abilities, so that I can instantly tell them apart and plan my defense accordingly.

**Acceptance criteria:**
- EnemyType interface extended with a `scale` field
- Each enemy type has a distinct scale creating a visible size hierarchy
- EnemyEntity rendering applies scale to the drawn Graphics shape
- Each enemy type has at least one visual detail that communicates its special ability (or lack thereof for the baseline Dust Bunny)
- Existing animations (movement, hit flash, death particles) scale correctly with new sizes
- All 4 enemy types are distinguishable at a glance from shape, size, and detail alone

**User guidance:** N/A — enemies are encountered during gameplay, not player-controlled.

**Design rationale:** All enemies currently render at the same size, making them hard to distinguish especially when ability differences (armor, jumping) are subtle. Size variation creates an instant visual threat hierarchy (big = tough) and per-type ability indicators (helmet, spring, gears) communicate mechanics before the player encounters them. PvZ uses this heavily — zombies are instantly recognizable by silhouette and size.

## Done-when (observable)

### US-32 — Spark economy boost

- [ ] `SPARK_SPAWN_INTERVAL` reduced to <= 4500ms (from 8000ms) [US-32]
- [ ] Spark click zone (interactive Zone) increased to >= 44x44 pixels (from 24x24) [US-32]
- [ ] Spark visual diamond shape scaled proportionally to match the larger click zone [US-32]
- [ ] Enlarged sparks read as glowing collectible tokens — visually distinct from ambient dust motes and projectile impacts (verified by: spark uses multi-layer diamond/star shape at the new scale, not a plain circle) [US-32]

### US-33 — Jack-in-the-Box collectible spark drops

- [ ] `generatesIncome` for the `generator` entry in DEFENDER_TYPES is 0 [US-33]
- [ ] When a Jack-in-the-Box defender is alive, it spawns a clickable spark token at its grid position every GENERATOR_INCOME_INTERVAL ms [US-33]
- [ ] Generator-spawned sparks are collectible via pointer click — add SPARK_VALUE to economy balance, play collect SFX, show collection animation [US-33]
- [ ] Generator-spawned sparks that are not collected are removed after ~5000ms (no persistent screen clutter from generators) [US-33]
- [ ] Jack-in-the-Box plays a visible produce animation (existing `playProduce()` or equivalent) when spawning a spark [US-33]
- [ ] Test coverage: generator income is 0 — placing a generator and advancing time without clicking does NOT increase economy balance [US-33]

### US-34 — Defender balance pass

- [ ] Water Pistol `damage` reduced to <= 15 (from 25) in `src/config/defenders.ts` [US-34]
- [ ] Block Tower `cost` reduced to <= 25 (from 50) in `src/config/defenders.ts` [US-34]
- [ ] Block Tower `health` reduced to a value where basic enemy (damage=20) destroys it in 4-5 seconds — i.e., health between 80 and 100 inclusive [US-34]
- [ ] Marble Mine `rechargeTime` reduced to <= 20000ms (from 30000ms) in `src/config/defenders.ts` [US-34]
- [ ] `MINE_ARM_DELAY` reduced to <= 6000ms (from 10000ms) [US-34]
- [ ] All existing tests in `test/` pass with the new balance values — `npm test` exits 0 [US-34]

### US-35 — Replace Teddy Bomb with Honey Bear

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

### US-36 — Enemy visual differentiation

- [ ] `EnemyType` interface in `src/config/enemies.ts` includes an optional `scale?: number` field [US-36]
- [ ] Enemy scale values set: basic (Dust Bunny) = 1.0, tough (Cleaning Robot) >= 1.3, armored (Armored Bunny) between 1.05 and 1.2, jumper (Sock Puppet) <= 0.95 [US-36]
- [ ] `EnemyEntity.ts` applies `scale` from the enemy type config to the rendered Graphics shape (multiplies drawing dimensions) [US-36]
- [ ] Cleaning Robot has at least one added visual detail suggesting mechanical toughness (gear, antenna, or panel lines) [US-36]
- [ ] Sock Puppet has at least one added visual detail suggesting jump capability (spring, coil, or legs) [US-36]
- [ ] Enemy size differences read as a clear visual hierarchy — Cleaning Robot is noticeably larger than Dust Bunny, Dust Bunny is noticeably larger than Sock Puppet (verified by: each type's drawn bounding box differs by at least 15% from its neighbors in the hierarchy) [US-36]
- [ ] Existing movement animations (bounce for Dust Bunny, rock for Cleaning Robot) render correctly at the new scale values — no clipping, no off-center positioning [US-36]
- [ ] Hit flash, death particles, and health bar positioning adjust to the scaled entity size [US-36]

### Structural

- [ ] AGENTS.md reflects: Honey Bear defender (trapper behavior), removed Teddy Bomb, HoneyTrap system module, enemy scale field, updated balance values introduced in this phase [phase]

## AGENTS.md sections affected

- **Game logic architecture** — new HoneyTrap system module, trapper behavior, enemy scale field, generator rework (drops sparks instead of passive income), updated balance values
- **Directory layout** — new `src/systems/HoneyTrap.ts`, new `test/HoneyTrap.test.ts`
- **Testing conventions** — new HoneyTrap test file, removed bomb test cases, updated balance values in existing tests
- **Defender types** — Teddy Bomb removed, Honey Bear added, Block Tower / Water Pistol / Marble Mine rebalanced
- **Spark collection** — spawn interval and size constants updated, generator spark drop mechanic

## User documentation

N/A — this is a game. Mechanics are communicated through in-game UI.

## Golden principles (phase-relevant)

- Game logic separated from Phaser rendering — HoneyTrap system is pure TS, speed modifier calculation testable without Phaser; balance values are config-only changes
- Config-driven entities — Honey Bear is a config registry addition with a new behavior key, not hardcoded scene logic; enemy scale is a config field consumed by rendering
- no-silent-pass — all new test files must have unconditional assertions in every test case
- agents-consistency — AGENTS.md must reflect the shipped code state after this phase
