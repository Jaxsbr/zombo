# Zombo — Architecture

## Tech stack

- **Runtime:** Browser (HTML5, localStorage for persistence)
- **Language:** TypeScript (strict mode)
- **Game framework:** Phaser 3 (>=3.60)
- **Bundler:** Vite
- **Test runner:** Vitest
- **Scale Manager:** `Phaser.Scale.FIT` with `autoCenter: Phaser.Scale.CENTER_BOTH` — canvas scales to fill viewport while preserving 576x400 logical resolution; Phaser remaps input coordinates automatically

## Module topology

```
src/
├── main.ts              # Phaser.Game entry point, scene registration
├── config/
│   ├── game.ts          # Phaser game config (dimensions, physics, scenes)
│   ├── defenders.ts     # Defender type registry (5 types: shooter, generator, wall, trapper, mine)
│   ├── enemies.ts       # Enemy type registry (5 types: basic, tough, armored, jumper, boss)
│   └── levels.ts        # Level config registry (LEVEL_1-LEVEL_10, escalating difficulty)
├── scenes/
│   ├── MainMenuScene.ts # Main menu — title, Play/Continue, Toys, Enemies nav, sound toggle
│   ├── LevelSelectScene.ts # Level select — 10 toy-box entries, loadout selection
│   ├── GameScene.ts     # Main gameplay scene — grid, HUD, placement, combat loop
│   ├── GameOverScene.ts # Win/lose display, continue to level select
│   ├── ToysScene.ts     # Toys browser — full card (unlocked) or silhouette (locked)
│   └── EnemiesScene.ts  # Enemies browser — full card (discovered) or silhouette (unknown)
├── systems/
│   ├── Grid.ts          # Grid state — cell coordinates, occupancy tracking
│   ├── Economy.ts       # Resource balance — income, spend, passive generation
│   ├── Placement.ts     # Defender placement logic — cell validation, cost deduction
│   ├── WaveManager.ts   # Wave progression — spawn timing, wave config, completion
│   ├── EnemyMovement.ts # Enemy movement logic — leftward advance, speed handling, jump logic
│   ├── Combat.ts        # Projectile firing, damage application, health tracking
│   ├── GameFlow.ts      # Win/lose detection, game state machine
│   ├── SingleUse.ts     # Mine arm/trigger logic (pure TS)
│   ├── HoneyTrap.ts     # Honey pot state: create, update/expire, speed modifier (pure TS)
│   ├── LevelProgress.ts # Level completion + localStorage persistence (pure TS)
│   ├── DefenderUnlocks.ts # Defender unlock map + localStorage persistence (pure TS)
│   └── Tutorial.ts      # L1 tutorial state machine — 3-step dream bubble flow (pure TS, no Phaser)
└── entities/
    ├── DefenderEntity.ts  # Defender game object — per-key shape drawing (pistol, box, blocks, honey bear), health bar
    ├── EnemyEntity.ts     # Enemy game object — per-key shape drawing (fluffy blob, robot, puppet, boss), per-type scale, health bar
    └── ProjectileEntity.ts # Projectile game object — yellow circle (shooter) / amber (honey bear), movement
```

(shipped in `core-loop` phase; `entities/`, `config/levels.ts`, and `systems/EnemyMovement.ts` shipped in `playable` phase; `systems/Tutorial.ts` shipped in `guided-intro` phase)

## Data flow

```
Player click → Placement → Grid (occupancy) + Economy (spend)
                              ↓
                        [trapper? → fires amber projectile → AOE damage ±1 row + honey pool on hit]
                        [mine? → MineState dormant → arm after delay → trigger on overlap]
                        [honey pots → 0.5x enemy speed on pot cells → expire after 8s]
                              ↓
Spark click → Economy (addIncome) → HUD update
                              ↓
WaveManager → Enemy spawn → Enemy movement (per tick)
                              ↓ [jumper? → attemptJump over defender]
Combat → Defender fires Projectile → Projectile hits Enemy → Enemy.health -= damage
                              ↓
GameFlow → checks win (no enemies + waves done) / lose (enemy at col 0)
                              ↓
GameOverScene → LevelProgress (complete + unlock next) → LevelSelectScene
```

## Key design decisions

- **Game logic separated from Phaser rendering:** `systems/` modules contain pure logic (grid, economy, combat math) testable without Phaser. Scenes consume these systems but rendering is not required for unit tests.
- **Config-driven entities:** Defender and enemy types are defined in `config/` registries, not hardcoded in entity classes. Adding a new type is a config addition, not a code change.
- **Toy Box Siege theme:** Defenders are toys (Water Pistol, Jack-in-the-Box, Block Tower), enemies are household nuisances (Dust Bunny, Cleaning Robot). Theme names in config registries, distinct Phaser Graphics shapes per entity type, bedroom carpet grid, "Sparks" resource label.

## Scene flow (shipped in `game-feel` phase, extended in `army-builder` phase)

```
Game launch → MainMenuScene → Play/Continue → LevelSelectScene (or ToysScene / EnemiesScene)
                                                    ↓
LevelSelectScene → [LoadoutScreen if >4 unlocked] → fade → GameScene
                                                    ↓
WaveManager state: setup (25s) → announcing (2.5s) → spawning → waiting (18s) → announcing → ...
                                                    ↓
GameScene reads waveState → renders progress dots + announcements
                                                    ↓
GameFlow win/lose → fade → GameOverScene → fade → LevelSelectScene
```

All scene transitions use Phaser camera fades. WaveManager drives wave pacing via a 5-state machine (setup → announcing → spawning → waiting → complete). Level progress and defender unlocks persisted to localStorage.

## Game juice layer (shipped in `game-juice` phase)

### SFX module

`src/systems/SFX.ts` — Procedural sound generation using Web Audio API (OscillatorNode, GainNode, noise buffers). Pure TypeScript, no Phaser dependency. Lazy AudioContext creation for Node test compatibility. Exports named trigger functions (place, fire, hit, death, collect, announce) and a mute toggle.

### Entity animations

All entity types have tween-based animations:
- **Defenders:** idle loops (Water Pistol bobs, Jack-in-the-Box wiggles, Block Tower sways, Honey Bear breathes), combat reactions (shooter recoil on fire, generator pulse on spark spawn), placement bounce-in (scale 0.3 → 1.0 with overshoot)
- **Enemies:** movement animations (Dust Bunny bounce/squash-stretch, Cleaning Robot rock), hit flash (white overlay 150ms on damage)
- **Effects:** death particles (per-type color burst — pink for Dust Bunny, purple for Cleaning Robot), defender destruction (fade + scale-down), projectile impact burst (expanding white circle), camera shake on final wave announcement

### Atmosphere

Bedroom environment elements rendered at depth -10 (behind all gameplay):
- Furniture silhouettes along top of play area (bookshelf, dresser)
- Decorative toy details on random grid cells at level start (crayon, marble, brick, star)
- Floating dust motes (15 semi-transparent dots with drift tweens)
- Themed backgrounds on MainMenuScene and GameOverScene (floor boards, rug, furniture, scattered toys)

### Spark economy

Passive income replaced by interactive spark collection (implemented inline in GameScene, not a separate entity file):
- Blue multi-layer diamond-shaped spark tokens spawn above grid every 12s (SPARK_SPAWN_INTERVAL=12000), drift down at 30px/s
- 48x48 click zone per spark — player clicks to collect — value (50 sparks) added to Economy with SFX and particle burst
- Uncollected sparks removed at grid bottom
- Generator (Jack-in-the-Box) spawns clickable sparks at its position every 8s (GENERATOR_INCOME_INTERVAL=8000); generator sparks auto-expire after 5s (GENERATOR_SPARK_EXPIRY). No passive income — all generator income requires clicking
- Spawn rate/value defined as named constants (SPARK_SPAWN_INTERVAL, SPARK_VALUE, SPARK_FALL_SPEED)

## Unit expansion and level progression (shipped in `army-builder` phase)

### Single-use defenders

- **Marble Mine** (mine) — 25 sparks, single-use. Dormant for 6s after placement (`MineState` arm timer in `SingleUse.ts`, MINE_ARM_DELAY=6000), then arms with pulse tween. Instant-kills first enemy on cell overlap when armed. Does not block movement. 20s recharge.

DefenderType interface extended with `singleUse` and `behavior` fields (5 behaviors: shooter, generator, wall, trapper, mine). Recharge timers render as cooldown overlays on HUD cards.

### Honey Bear (trapper)

Honey Bear — 75 sparks, persistent defender. Fires slow amber projectile (HONEY_BEAR_PROJECTILE_SPEED=2) at nearest lane enemy. On hit, applies AOE damage (HONEY_BEAR_AOE_DAMAGE=5) to target row ±1 row and creates honey pools per affected row. Honey pots slow enemies to 0.5x speed for 8s (HONEY_POT_DURATION), then expire. Pure logic in `src/systems/HoneyTrap.ts` (createHoneyPot, updateHoneyPots, getSpeedModifier) and `src/systems/Combat.ts` (applyAOEDamage, getAOETargetRows). Amber bear shape with idle breathing animation.

### Additional enemy types

- **Armored Bunny** (armored) — 300 HP (3x basic), 0.5 cells/s, scale 1.15. Dust Bunny shape with toy helmet overlay, 3-stage visual degradation (full → cracked at 50% → bare at 25%). `updateHelmet` in `EnemyEntity.ts`.
- **Sock Puppet** (jumper) — 150 HP, 0.35 cells/s, scale 0.85. Spring coil detail. `attemptJump` logic in `EnemyMovement.ts` — jumps over first defender encountered (arc tween), then walks normally. `jumpsRemaining` field on EnemyType.
- **Mega Mop** (boss) — 2000 HP, 0.08 cells/s, scale 1.6, bossType=true. Unique mop-headed brute shape with slow stomp movement animation. Mines deal MINE_BOSS_DAMAGE (400) instead of instant kill. First encountered in Level 10 wave 5.

Enemy types have an optional `scale` field controlling rendered size. Visual hierarchy: Mega Mop (1.6) > Cleaning Robot (1.35) > Armored Bunny (1.15) > Dust Bunny (1.0) > Sock Puppet (0.85). Cleaning Robot has gear bolt details; Sock Puppet has spring coil; Mega Mop has unique mop-headed brute shape with stomp animation. Health bars, flash overlays, and death particles scale proportionally.

### Multi-level structure (extended in `guided-intro` and `stage-one-completion` phases)

10 guided levels (LEVEL_1 through LEVEL_10). LevelConfig includes `startingBalance`, `activeLanes`, `tutorialMode`, and `enemyBio` fields. L1: 1 lane (center), tutorial mode, 75 starting balance. L2: 3 lanes, 2 waves. L3: 5 lanes, 3 waves. L4: 5 lanes, 3 waves, Block Tower available. L5: 5 lanes, 4 waves, Armored Bunny from wave 2, pre-round enemy bio. L6: 5 lanes, 4 waves, Cleaning Robot from wave 2, pre-round enemy bio, Honey Bear unlock on completion. L7: 5 lanes, 4 waves, Cleaning Robots in every wave (Honey Bear practice). L8: 5 lanes, 4 waves, Sock Puppet from wave 2, pre-round enemy bio, Marble Mine unlock on completion. L9: 5 lanes, 5 waves, all 4 enemy types, first loadout selection moment. L10: 5 lanes, 5 waves, formation rush (waves 1-4 at 0.5-0.8s intervals), wave 5 = single Mega Mop boss (pre-round enemy bio, 20s setup delay) — climactic boss fight completing the first playthrough arc. `LevelProgress.ts` manages localStorage persistence (`zombo_progress`). `DefenderUnlocks.ts` manages unlock state (`zombo_unlocks`).

Bio fields: `DefenderType.bio` (required string) for unlock cards. `EnemyType.bio` (optional string) for pre-round bio overlays. Bio overlays use depth 199–201 (dim bg, card, button).

### Scene flow

```
MainMenuScene → LevelSelectScene → [LoadoutScreen if >4 unlocked] → GameScene → GameOverScene → LevelSelectScene
MainMenuScene → ToysScene → MainMenuScene (Back)
MainMenuScene → EnemiesScene → MainMenuScene (Back)
```

`LevelSelectScene.ts` renders 10 toy-box level entries (locked/unlocked/completed states). Loadout selection appears when player has > 4 unlocked defenders (max 4 selectable). GameScene receives `activeLoadout` and filters the HUD defender panel.

Loadout card layout uses proportional sizing relative to GAME_WIDTH/GAME_HEIGHT: padding=0.05×GW, gap=0.02×GW, cardHeight=0.45×GH. Cards animate in with staggered entry (Back.easeOut), selection bounce (1.08×), and an idle preview bob (Sine.easeInOut).

### Defender unlock progression (updated in `guided-intro` and `stage-one-completion` phases)

L1 start: [generator, shooter]. UNLOCK_MAP: `{ 3: 'wall', 6: 'trapper', 8: 'mine' }` — completing L3 unlocks Block Tower, completing L6 unlocks Honey Bear, completing L8 unlocks Marble Mine. Loadout selection (pick 4) activates when roster exceeds 4-slot limit (first triggered naturally before L9 when 5 defenders are unlocked).
