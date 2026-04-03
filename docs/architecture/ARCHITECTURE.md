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
│   └── enemies.ts       # Enemy type registry (name, health, speed)
├── scenes/
│   ├── GameScene.ts     # Main gameplay scene — grid, HUD, placement, combat loop
│   └── GameOverScene.ts # Win/lose display, restart button
├── systems/
│   ├── Grid.ts          # Grid state — cell coordinates, occupancy tracking
│   ├── Economy.ts       # Resource balance — income, spend, passive generation
│   ├── Placement.ts     # Defender placement logic — cell validation, cost deduction
│   ├── WaveManager.ts   # Wave progression — spawn timing, wave config, completion
│   ├── Combat.ts        # Projectile firing, damage application, health tracking
│   └── GameFlow.ts      # Win/lose detection, game state machine
└── entities/
    ├── Defender.ts      # Defender game object — sprite, health, attack behaviour
    ├── Enemy.ts         # Enemy game object — sprite, health, lane movement
    └── Projectile.ts    # Projectile game object — movement, collision
```

(planned for `core-loop` phase)

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
- **No theme coupling:** All names, colors, and labels are generic placeholders. Theming is a separate concern for a future phase.

## AGENTS.md sections affected by core-loop phase

- Directory layout (new `src/` tree)
- Quality checks (add test runner command, verify command)
- Running instructions (dev server, build, test commands)
