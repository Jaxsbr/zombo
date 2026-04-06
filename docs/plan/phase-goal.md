## Phase goal

Deliver endgame content: rework Honey Bear into a projectile-based area-denial defender with 3-lane vertical AOE and honey pool on hit, introduce a Stage-1 Boss enemy with unique visuals and boss-specific mine damage, and build Level 10 as a climactic boss fight with tight formation waves. This phase completes the game's first full playthrough arc (10 levels).

### Stories in scope
- US-56 — Honey Bear: Projectile Attack & Vertical AOE
- US-57 — Stage-1 Boss Enemy
- US-58 — Level 10: Formation Waves & Boss Fight

### Done-when (observable)

#### US-56 — Honey Bear: Projectile Attack & Vertical AOE

- [x] Honey Bear fires a projectile toward the nearest enemy in its lane; projectile uses an amber fill color (hex in range #e65100–#ffd54f), visually distinct from the Water Pistol's yellow projectile [US-56]
- [x] Honey Bear projectile speed is defined as a named constant (e.g. HONEY_BEAR_PROJECTILE_SPEED); value is strictly less than the Water Pistol equivalent projectile speed [US-56]
- [x] Honey Bear fire interval is defined as a named constant (e.g. HONEY_BEAR_FIRE_INTERVAL); Honey Bear fires at most one projectile per interval — no concurrent overlapping shots from a single Honey Bear [US-56]
- [x] On projectile hit, damage >= 1 is applied to all enemies in the target row +/- 1 row (up to 3 rows, clamped to valid grid row bounds 0-4) at the hit column [US-56]
- [x] test/Combat.test.ts (or a dedicated honey-AOE test) includes a test verifying that a honey projectile hit applies damage to enemies in the target row and each adjacent row within grid bounds [US-56]
- [x] On projectile hit, HoneyTrap.createHoneyPot is called for each affected row at the hit column; resulting pools slow passing enemies to HONEY_POT_SLOW (0.5x) for HONEY_POT_DURATION (8 s) [US-56]
- [x] Honey pool renders on the grid at depth 2 (above grid tiles at 0, below entities at 5) with amber fill (hex in range #e65100–#ffd54f), alpha 0.3–0.6, and no pointer input zone — reads as a ground-level hazard, not a collectible [US-56]
- [x] Periodic honey pot tossing removed — Honey Bear entity no longer schedules honey pots on a recurring interval timer [US-56]
- [x] Honey Bear plays a fire animation reaction (recoil or forward-lunge tween) on each projectile launch [US-56]
- [x] test/HoneyTrap.test.ts confirms honey pools created via a projectile-hit code path expire after HONEY_POT_DURATION and return the correct HONEY_POT_SLOW modifier from getSpeedModifier [US-56]

#### US-57 — Stage-1 Boss Enemy

- [x] EnemyType interface (in config/enemies.ts or a shared types file) has an optional `bossType?: boolean` field and TypeScript strict-mode compilation passes with npx tsc --noEmit [US-57]
- [x] enemies.ts registers a new type with key 'boss': bossType=true, hp >= 2000, speed <= 0.10 cells/s, scale >= 1.5, non-empty bio string [US-57]
- [x] EnemyEntity.ts renders a unique boss shape for key 'boss' via a dedicated drawing path (distinct if/case branch) — does not reuse any existing enemy shape routine (bunny, robot, puppet) [US-57]
- [x] Boss has a health bar proportional to its scale (health bar dimensions scale with entity scale, matching the per-type-scale pattern of existing enemies) [US-57]
- [x] Boss has a movement animation (stomp or rock tween) that triggers during gameplay traversal [US-57]
- [x] Boss displays a hit flash (white Graphics overlay, ~150 ms duration) on each damage event [US-57]
- [x] Boss emits death particles (per-type color burst) on death [US-57]
- [x] SingleUse.ts mineTriggerCheck: when the overlapping enemy has bossType=true, reduces enemy HP by MINE_BOSS_DAMAGE (>= 300) instead of instant kill; enemy entity remains on the grid [US-57]
- [x] MINE_BOSS_DAMAGE constant defined in SingleUse.ts or config/game.ts, value >= 300 [US-57]
- [x] EnemiesScene renders boss as silhouette before the player first encounters it in Level 10; shows full card after discovery (same discovery tracking pattern as existing enemy types) [US-57]
- [x] test/SingleUse.test.ts: boss mine hit test — mineTriggerCheck with a bossType=true enemy reduces enemy HP by MINE_BOSS_DAMAGE and does NOT mark the enemy as dead [US-57]

#### US-58 — Level 10: Formation Waves & Boss Fight

- [ ] LEVEL_10 config object exists in src/config/levels.ts; ALL_LEVELS array has length 10 [US-58]
- [ ] Level 10 config has >= 5 waves [US-58]
- [ ] Waves 1-4 configure enemy spawn intervals <= 0.8 s between successive spawns within the wave [US-58]
- [ ] Wave 5 (the final wave) includes exactly one spawn of enemy type 'boss' [US-58]
- [ ] Level 10 entry is visible in LevelSelectScene; locked until Level 9 is completed; unlocked after completing Level 9 [US-58]
- [ ] LEVEL_10 config has enemyBio configured for 'boss' type, triggering the enemy bio overlay before the level starts [US-58]
- [ ] LEVEL_10 setupDelay >= 20000 (20 seconds) [US-58]
- [ ] LevelProgress.ts nextUnbeatenLevel correctly handles 10 levels — returns L10 as the next unbeaten level after L9 is completed [US-58]

#### Structural / phase criteria

- [ ] AGENTS.md Honey Bear entry updated to reflect the new projectile + 3-lane AOE + honey pool on hit mechanic (periodic tossing removed) [phase]
- [ ] AGENTS.md Enemies section updated to include Stage-1 Boss (key: 'boss', bossType flag, stats, boss mine damage behaviour) [phase]
- [ ] AGENTS.md Level progression section updated to include Level 10 (formation waves 1-4, Stage-1 Boss in wave 5) [phase]

### Golden principles (phase-relevant)
- Game logic in src/systems/ as pure TypeScript, no Phaser dependencies — AOE damage logic in Combat.ts, boss mine interaction in SingleUse.ts
- Config-driven entities — Stage-1 Boss added to enemies.ts registry, not hardcoded in scene or system logic
- Per-key shape drawing convention maintained in EnemyEntity.ts (dedicated if/case branch for 'boss')
- Depth layer map maintained: honey pools at depth 2, entities at depth 5, HUD at depth 50
- All enemy types follow the animation baseline: movement animation + hit flash + death particles + scaled health bar
- Named constants for all tunable values (HONEY_BEAR_PROJECTILE_SPEED, HONEY_BEAR_FIRE_INTERVAL, MINE_BOSS_DAMAGE)
