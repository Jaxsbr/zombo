# Phase: endgame-content

Status: shipped

## Stories

### US-56 — Honey Bear: Projectile Attack & Vertical AOE [Shipped]

As a player, I want the Honey Bear to shoot slow honey projectiles that deal damage to enemies in 3 vertical lanes and leave honey pools at each affected cell on hit, so that it becomes a powerful, strategic, and satisfying zone-control defender.

**Acceptance criteria:**
- Honey Bear fires slow honey projectiles toward the nearest enemy in its lane
- Projectile uses an amber/honey color distinct from the Water Pistol's yellow
- On hit, AOE damage (>= 1) applies to all enemies in the target row ± 1 row (up to 3 rows, clamped to valid grid row bounds 0–4) at the hit column
- On hit, HoneyTrap.createHoneyPot is called for each affected row at the hit column; resulting pools slow passing enemies to 0.5x speed for 8s
- Periodic honey pot tossing behavior is removed — Honey Bear no longer schedules pots on a recurring timer
- HoneyTrap.ts pool logic (createHoneyPot, updateHoneyPots, getSpeedModifier) is reused by the projectile hit path, not re-implemented
- Honey Bear plays a fire animation reaction (recoil or forward-lunge tween) on each shot
- Projectile speed and fire interval are each defined as named constants

**User guidance:**
- Discovery: Place the Honey Bear (unlocked after completing Level 6) on any active grid cell; it auto-fires
- Manual section: N/A — no user manual exists for this project
- Key steps: 1. Place Honey Bear on grid. 2. It auto-fires slow amber projectiles at the nearest enemy in its lane. 3. On hit, projectile deals AOE damage to enemies in 3 vertical lanes and leaves amber honey pools that slow enemies walking through them.

**Design rationale:** Replacing passive pot-tossing with active projectile shooting gives Honey Bear a clear combat identity — slow-firing area denial that works best when enemies must cross the slowed zone for an extended period. AOE + honey pool makes its impact immediately readable to the player and creates synergy with Water Pistol (slowed enemies take more sustained fire) and Marble Mines (slowed enemies give mines more time to arm).

---

### US-57 — Stage-1 Boss Enemy [Shipped]

As a player, I want to face a Stage-1 Boss — a massive, slow, high-HP threat — so that Level 10 delivers a climactic challenge requiring coordinated use of all available defenders.

**Acceptance criteria:**
- New enemy type registered in enemies.ts with key 'boss': bossType=true, HP >= 2000, speed <= 0.10 cells/s, scale >= 1.5, non-empty bio string
- Boss has a unique visual shape not reusing existing enemy shape routines (bunny, robot, puppet)
- Boss has the full per-type animation baseline: movement animation, hit flash (~150ms white overlay), death particles
- Boss has a health bar proportional to its scale
- EnemyType interface extended with optional `bossType?: boolean` field
- Marble Mine applies MINE_BOSS_DAMAGE (>= 300 HP) to boss-type enemies instead of instant kill; boss remains on grid after mine trigger
- Boss is discoverable in EnemiesScene (silhouette until first encounter, full card after)

**User guidance:**
- Discovery: Boss spawns in Level 10, wave 5
- Manual section: N/A
- Key steps: 1. Reach Level 10 wave 5. 2. Boss spawns alone. 3. Use Honey Bear to slow its movement, Water Pistols for sustained fire, Marble Mines for large damage chunks, and Block Tower to stall while Marble Mines recharge.

**Design rationale:** Boss flag on the enemy type (vs. level-specific logic override) keeps the mechanic self-contained and composable — any future level could include the boss without special-casing. MINE_BOSS_DAMAGE chunk damage makes Marble Mine a meaningful high-stakes tool without trivializing the fight. Boss HP >= 2000 (vs. Cleaning Robot's highest existing HP) ensures the fight requires sustained effort from multiple defender types.

---

### US-58 — Level 10: Formation Waves & Boss Fight [Shipped]

As a player, I want Level 10 to feature escalating coordinated enemy waves followed by a boss encounter, so that the endgame feels like a proper climax to the full game.

**Acceptance criteria:**
- LEVEL_10 config exists in src/config/levels.ts; ALL_LEVELS array has length 10
- Level 10 has >= 5 waves
- Waves 1–4 configure spawn intervals <= 0.8s between successive enemies within the wave, creating a coordinated rush feel (significantly tighter than L9's 2.0s minimum)
- Wave 5 (the final wave) includes exactly one spawn of enemy type 'boss'
- Level 10 entry is visible in LevelSelectScene; locked until Level 9 is completed, unlocked after
- LEVEL_10 config has enemyBio set for 'boss' type, triggering the enemy bio overlay before the level starts
- LEVEL_10 setupDelay >= 20000 (20 seconds) giving the player preparation time before wave 1
- LevelProgress.ts nextUnbeatenLevel handles 10 levels correctly — returns L10 as next unbeaten after L9 is completed

**User guidance:**
- Discovery: Level 10 entry visible in LevelSelectScene after completing Level 9
- Manual section: N/A
- Key steps: 1. Complete Level 9 to unlock Level 10. 2. Review the boss enemy bio before the level starts. 3. Use the 20s setup period to build a strong defense (Honey Bear + Water Pistols + Marble Mines). 4. Survive formation waves 1–4. 5. Face the Stage-1 Boss in wave 5.

**Design rationale:** Formation waves reuse existing WaveManager spawn interval configuration — no new state machine states needed. Tight spawn intervals (≤ 0.8s) within each wave create a coordinated rush feel without requiring simultaneous multi-lane spawning logic. The boss appears alone in the final wave so the player's setup from earlier waves is the direct test — no new enemies to distract from the boss fight.

---

## Done-when (observable)

**US-56 — Honey Bear: Projectile Attack & Vertical AOE**

- [ ] Honey Bear fires a projectile toward the nearest enemy in its lane; projectile uses an amber fill color (hex in range #e65100–#ffd54f), visually distinct from the Water Pistol's yellow projectile [US-56]
- [ ] Honey Bear projectile speed is defined as a named constant (e.g. HONEY_BEAR_PROJECTILE_SPEED); value is strictly less than the Water Pistol equivalent projectile speed [US-56]
- [ ] Honey Bear fire interval is defined as a named constant (e.g. HONEY_BEAR_FIRE_INTERVAL); Honey Bear fires at most one projectile per interval — no concurrent overlapping shots from a single Honey Bear [US-56]
- [ ] On projectile hit, damage >= 1 is applied to all enemies in the target row ± 1 row (up to 3 rows, clamped to valid grid row bounds 0–4) at the hit column [US-56]
- [ ] test/Combat.test.ts (or a dedicated honey-AOE test) includes a test verifying that a honey projectile hit applies damage to enemies in the target row and each adjacent row within grid bounds [US-56]
- [ ] On projectile hit, HoneyTrap.createHoneyPot is called for each affected row at the hit column; resulting pools slow passing enemies to HONEY_POT_SLOW (0.5×) for HONEY_POT_DURATION (8 s) [US-56]
- [ ] Honey pool renders on the grid at depth 2 (above grid tiles at 0, below entities at 5) with amber fill (hex in range #e65100–#ffd54f), alpha 0.3–0.6, and no pointer input zone — reads as a ground-level hazard, not a collectible [US-56]
- [ ] Periodic honey pot tossing removed — Honey Bear entity no longer schedules honey pots on a recurring interval timer [US-56]
- [ ] Honey Bear plays a fire animation reaction (recoil or forward-lunge tween) on each projectile launch [US-56]
- [ ] test/HoneyTrap.test.ts confirms honey pools created via a projectile-hit code path expire after HONEY_POT_DURATION and return the correct HONEY_POT_SLOW modifier from getSpeedModifier [US-56]

**US-57 — Stage-1 Boss Enemy**

- [ ] EnemyType interface (in config/enemies.ts or a shared types file) has an optional `bossType?: boolean` field and TypeScript strict-mode compilation passes with npx tsc --noEmit [US-57]
- [ ] enemies.ts registers a new type with key 'boss': bossType=true, hp >= 2000, speed <= 0.10 cells/s, scale >= 1.5, non-empty bio string [US-57]
- [ ] EnemyEntity.ts renders a unique boss shape for key 'boss' via a dedicated drawing path (distinct if/case branch) — does not reuse any existing enemy shape routine (bunny, robot, puppet) [US-57]
- [ ] Boss has a health bar proportional to its scale (health bar dimensions scale with entity scale, matching the per-type-scale pattern of existing enemies) [US-57]
- [ ] Boss has a movement animation (stomp or rock tween) that triggers during gameplay traversal [US-57]
- [ ] Boss displays a hit flash (white Graphics overlay, ~150 ms duration) on each damage event [US-57]
- [ ] Boss emits death particles (per-type color burst) on death [US-57]
- [ ] SingleUse.ts mineTriggerCheck: when the overlapping enemy has bossType=true, reduces enemy HP by MINE_BOSS_DAMAGE (>= 300) instead of instant kill; enemy entity remains on the grid [US-57]
- [ ] MINE_BOSS_DAMAGE constant defined in SingleUse.ts or config/game.ts, value >= 300 [US-57]
- [ ] EnemiesScene renders boss as silhouette before the player first encounters it in Level 10; shows full card after discovery (same discovery tracking pattern as existing enemy types) [US-57]
- [ ] test/SingleUse.test.ts: boss mine hit test — mineTriggerCheck with a bossType=true enemy reduces enemy HP by MINE_BOSS_DAMAGE and does NOT mark the enemy as dead [US-57]

**US-58 — Level 10: Formation Waves & Boss Fight**

- [ ] LEVEL_10 config object exists in src/config/levels.ts; ALL_LEVELS array has length 10 [US-58]
- [ ] Level 10 config has >= 5 waves [US-58]
- [ ] Waves 1–4 configure enemy spawn intervals <= 0.8 s between successive spawns within the wave [US-58]
- [ ] Wave 5 (the final wave) includes exactly one spawn of enemy type 'boss' [US-58]
- [ ] Level 10 entry is visible in LevelSelectScene; locked until Level 9 is completed; unlocked after completing Level 9 [US-58]
- [ ] LEVEL_10 config has enemyBio configured for 'boss' type, triggering the enemy bio overlay before the level starts [US-58]
- [ ] LEVEL_10 setupDelay >= 20000 (20 seconds) [US-58]
- [ ] LevelProgress.ts nextUnbeatenLevel correctly handles 10 levels — returns L10 as the next unbeaten level after L9 is completed [US-58]

**Structural / phase criteria**

- [ ] AGENTS.md Honey Bear entry updated to reflect the new projectile + 3-lane AOE + honey pool on hit mechanic (periodic tossing removed) [phase]
- [ ] AGENTS.md Enemies section updated to include Stage-1 Boss (key: 'boss', bossType flag, stats, boss mine damage behaviour) [phase]
- [ ] AGENTS.md Level progression section updated to include Level 10 (formation waves 1–4, Stage-1 Boss in wave 5) [phase]

## AGENTS.md sections affected

When this phase ships, the build-loop Phase Reconciliation Gate should update:
- **Defenders** section: Honey Bear description (projectile + AOE replaces periodic tossing)
- **Enemies** section: add Stage-1 Boss entry (bossType flag, HP, speed, scale, MINE_BOSS_DAMAGE)
- **Level progression** section: add Level 10 description; update ALL_LEVELS length to 10
- **SingleUse** section: note bossType check in mineTriggerCheck
- **HoneyTrap** section: note that honey pools are now created by projectile hit path (not periodic timer)

## Golden principles (phase-relevant)

- Game logic in src/systems/ as pure TypeScript, no Phaser dependencies — AOE damage logic in Combat.ts, boss mine interaction in SingleUse.ts
- Config-driven entities — Stage-1 Boss added to enemies.ts registry, not hardcoded in scene or system logic
- Per-key shape drawing convention maintained in EnemyEntity.ts (dedicated if/case branch for 'boss')
- Depth layer map maintained: honey pools at depth 2, entities at depth 5, HUD at depth 50
- All enemy types follow the animation baseline: movement animation + hit flash + death particles + scaled health bar
- Named constants for all tunable values (HONEY_BEAR_PROJECTILE_SPEED, HONEY_BEAR_FIRE_INTERVAL, MINE_BOSS_DAMAGE)
