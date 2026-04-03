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
