# Zombo — Architecture

## Tech stack

- **Runtime:** Browser (HTML5)
- **Language:** TypeScript (strict mode)
- **Game framework:** Phaser 3 (>=3.60)
- **Bundler:** Vite
- **Test runner:** Vitest

## Module topology

```
src/
├── main.ts              # Phaser.Game entry point, scene registration
├── config/
│   ├── game.ts          # Phaser game config (dimensions, physics, scenes)
│   ├── defenders.ts     # Defender type registry (name, cost, health, damage, range)
│   ├── enemies.ts       # Enemy type registry (name, health, speed)
│   └── levels.ts        # Level config registry (waves, enemy composition, difficulty)
├── scenes/
│   ├── TitleScene.ts    # Title screen — "Toy Box Siege" branding, Play button
│   ├── GameScene.ts     # Main gameplay scene — grid, HUD, placement, combat loop
│   └── GameOverScene.ts # Win/lose display ("Fort Defended!"/"The Mess Wins!"), restart
├── systems/
│   ├── Grid.ts          # Grid state — cell coordinates, occupancy tracking
│   ├── Economy.ts       # Resource balance — income, spend, passive generation
│   ├── Placement.ts     # Defender placement logic — cell validation, cost deduction
│   ├── WaveManager.ts   # Wave progression — spawn timing, wave config, completion
│   ├── EnemyMovement.ts # Enemy movement logic — leftward advance, speed handling
│   ├── Combat.ts        # Projectile firing, damage application, health tracking
│   └── GameFlow.ts      # Win/lose detection, game state machine
└── entities/
    ├── DefenderEntity.ts  # Defender game object — per-key shape drawing (pistol, box, blocks), health bar
    ├── EnemyEntity.ts     # Enemy game object — per-key shape drawing (fluffy blob, robot), health bar
    └── ProjectileEntity.ts # Projectile game object — yellow circle, movement
```

(shipped in `core-loop` phase; `entities/`, `config/levels.ts`, and `systems/EnemyMovement.ts` shipped in `playable` phase)

## Data flow

```
Player click → Placement → Grid (occupancy) + Economy (spend)
                              ↓
Passive timer → Economy (addIncome) → HUD update
                              ↓
WaveManager → Enemy spawn → Enemy movement (per tick)
                              ↓
Combat → Defender fires Projectile → Projectile hits Enemy → Enemy.health -= damage
                              ↓
GameFlow → checks win (no enemies + waves done) / lose (enemy at col 0)
                              ↓
GameOverScene → restart → reset all systems
```

## Key design decisions

- **Game logic separated from Phaser rendering:** `systems/` modules contain pure logic (grid, economy, combat math) testable without Phaser. Scenes consume these systems but rendering is not required for unit tests.
- **Config-driven entities:** Defender and enemy types are defined in `config/` registries, not hardcoded in entity classes. Adding a new type is a config addition, not a code change.
- **Toy Box Siege theme:** Defenders are toys (Water Pistol, Jack-in-the-Box, Block Tower), enemies are household nuisances (Dust Bunny, Cleaning Robot). Theme names in config registries, distinct Phaser Graphics shapes per entity type, bedroom carpet grid, "Sparks" resource label.

## AGENTS.md sections affected by playable phase

- Directory layout (new `src/entities/` directory, `src/config/levels.ts`)
- Game logic architecture (entity layer bridges systems and rendering)
- Testing conventions (level config unit test added)

## Scene flow (shipped in `game-feel` phase)

```
Game launch → TitleScene (Play button) → fade → GameScene
                                                    ↓
WaveManager state: setup (25s) → announcing (2.5s) → spawning → waiting (18s) → announcing → ...
                                                    ↓
GameScene reads waveState → renders progress dots + announcements
                                                    ↓
GameFlow win/lose → fade → GameOverScene → fade → GameScene (restart)
```

All scene transitions use Phaser camera fades. WaveManager drives wave pacing via a 5-state machine (setup → announcing → spawning → waiting → complete).

## Game juice layer (shipped in `game-juice` phase)

### SFX module

`src/systems/SFX.ts` — Procedural sound generation using Web Audio API (OscillatorNode, GainNode, noise buffers). Pure TypeScript, no Phaser dependency. Lazy AudioContext creation for Node test compatibility. Exports named trigger functions (place, fire, hit, death, collect, announce) and a mute toggle.

### Entity animations

All entity types have tween-based animations:
- **Defenders:** idle loops (Water Pistol bobs, Jack-in-the-Box wiggles, Block Tower sways), combat reactions (shooter recoil on fire, generator pulse on income tick), placement bounce-in (scale 0.3 → 1.0 with overshoot)
- **Enemies:** movement animations (Dust Bunny bounce/squash-stretch, Cleaning Robot rock), hit flash (white overlay 150ms on damage)
- **Effects:** death particles (per-type color burst — pink for Dust Bunny, purple for Cleaning Robot), defender destruction (fade + scale-down), projectile impact burst (expanding white circle), camera shake on final wave announcement

### Atmosphere

Bedroom environment elements rendered at depth -10 (behind all gameplay):
- Furniture silhouettes along top of play area (bookshelf, dresser)
- Decorative toy details on random grid cells at level start (crayon, marble, brick, star)
- Floating dust motes (15 semi-transparent dots with drift tweens)
- Themed backgrounds on TitleScene and GameOverScene (floor boards, rug, furniture, scattered toys)

### Spark economy

Passive income replaced by interactive spark collection (implemented inline in GameScene, not a separate entity file):
- Blue diamond-shaped spark tokens spawn above grid every 8s, drift down at 30px/s
- Player clicks to collect — value (25 sparks) added to Economy with SFX and particle burst
- Uncollected sparks removed at grid bottom
- Generator (Jack-in-the-Box) automatic income unchanged
- Spawn rate/value defined as named constants (SPARK_SPAWN_INTERVAL, SPARK_VALUE, SPARK_FALL_SPEED)

## Unit expansion and level progression (planned for `army-builder` phase)

### New defender types

- **Teddy Bomb** (bomb) — 150 sparks, single-use. Instant area damage (3x3 Chebyshev) on placement, then self-destructs. Very Slow recharge. PvZ equivalent: Cherry Bomb.
- **Marble Mine** (mine) — 25 sparks, single-use. Dormant for ~10s after placement, then arms. Instant-kills first enemy to enter its cell when armed. Does not block movement. Slow recharge. PvZ equivalent: Potato Mine.

DefenderType interface extended with `singleUse` and `behavior` fields to support bomb/mine archetypes alongside existing shooter/wall/generator.

### New enemy types

- **Armored Bunny** (armored) — 300 HP, 0.5 cells/s (same speed as Dust Bunny, 3x health). Toy helmet overlay with 3-stage visual degradation (full → cracked → bare). PvZ equivalent: Buckethead.
- **Sock Puppet** (jumper) — 150 HP, 0.35 cells/s. Jumps over first defender encountered (jumpsRemaining=1), then walks normally. Arc tween for jump visual. PvZ equivalent: Pole Vaulter.

### Multi-level structure

5 levels with escalating difficulty (3-5 waves each). Enemy composition ramps: L1 basic only → L5 all types. Level progress and defender unlocks persisted to localStorage.

### Scene flow change

```
TitleScene → LevelSelectScene → [LoadoutScreen if >4 unlocked] → GameScene → GameOverScene → LevelSelectScene
```

LevelSelectScene replaces direct TitleScene→GameScene transition. Loadout selection appears only when player has more unlocked defenders than the 4-slot limit.

### Defender unlock progression

L1 start: Water Pistol, Jack-in-the-Box, Block Tower. L2 completion: +Teddy Bomb. L3 completion: +Marble Mine. Loadout selection (pick 4) activates after L3 completion.
