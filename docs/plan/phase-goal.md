## Phase goal

Expand the toy arsenal with two new defenders — Water Cannon (powerful knockback shooter unlocked at L3) and Glitter Bomb (instant AOE single-use unlocked at L5) — and redesign the loadout system to support 5 selected defenders in a 2-row grid layout that scales gracefully to 7 total toys.

### Stories in scope
- US-59 — Water Cannon Defender
- US-60 — Glitter Bomb Defender
- US-61 — Expanded Loadout & Toy Selection Redesign

### Done-when (observable)

#### US-59 — Water Cannon Defender

- [x] defenders.ts registers 'cannon' with behavior 'shooter', damage >= 24, cost >= 125, range 9, singleUse false, non-empty bio string [US-59]
- [x] DefenderType interface extended with optional `knockback?: number` field (or equivalent mechanism); 'cannon' entry sets knockback > 0; TypeScript strict-mode compilation passes (npx tsc --noEmit) [US-59]
- [x] DefenderEntity.ts has a dedicated drawing path for key 'cannon' — distinct if/case branch, does NOT reuse the 'shooter' (Water Pistol) shape [US-59]
- [x] Water Cannon reads as a big toy water blaster — chunky barrel/nozzle shape, playful proportions, not military hardware (visually distinct silhouette from Water Pistol's simple pistol shape) [US-59] (aspirational — visual verification required)
- [x] ProjectileEntity.ts renders Water Cannon projectile with blue/cyan fill color (distinct from Water Pistol yellow and Honey Bear amber) and visually larger radius than Water Pistol projectile [US-59]
- [x] On Water Cannon projectile hit, non-boss enemy col position increases by ~1 cell (knockback toward right edge); enemy col does not exceed grid col bound (8) [US-59]
- [x] On Water Cannon projectile hit against a bossType=true enemy, no knockback is applied (col position unchanged) [US-59]
- [x] Knockback function resides in src/systems/ (pure TypeScript, no Phaser import) [US-59]
- [x] test/Combat.test.ts or dedicated knockback test: non-boss enemy knocked back ~1 cell on Water Cannon hit; boss-type enemy NOT knocked back; knockback clamped to col 8 [US-59]
- [x] Water Cannon unlocks after completing L3: updateUnlocksAfterLevel with completedLevelIndex=2 returns an unlock set containing both 'wall' AND 'cannon' [US-59]
- [x] test/DefenderUnlocks.test.ts: completing level index 2 unlocks both 'wall' and 'cannon' [US-59]
- [x] Toy unlock card overlay displays for Water Cannon on first unlock — follows existing pattern (DRAW_DEFENDER at 2x, name, cost, bio, cream background, warm brown border, slide-in, "Collect!" button, localStorage tracking via bio_shown_defender_cannon) [US-59]
- [x] ToysScene renders Water Cannon card — silhouette before unlock, full card (name + visual + bio) after unlock [US-59]
- [x] Water Cannon has fire animation reaction (recoil or forward-lunge tween) on each projectile launch [US-59]
- [x] Water Cannon preview in ToysScene and loadout screen shows idle bob animation (same tween pattern as existing defender previews) [US-59]
- [x] ToysScene and unlock card overlay render Water Cannon using the container + DRAW_DEFENDER['cannon'] Record lookup pattern (not a function call) — same pattern as existing defenders [US-59]
- [x] GameScene knockback application calls the knockback function from src/systems/ — no inline re-implementation of knockback logic in scene code [US-59]

#### US-60 — Glitter Bomb Defender

- [x] defenders.ts registers 'bomb' with singleUse true, cost in range 75–125, rechargeTime >= 12000, non-empty bio string [US-60]
- [x] DefenderBehavior type union includes 'bomb' (or Glitter Bomb integrates with existing 'mine' behavior); TypeScript strict-mode compilation passes (npx tsc --noEmit) [US-60]
- [x] DefenderEntity.ts has a dedicated drawing path for key 'bomb' — distinct if/case branch, sparkly/fun visual [US-60]
- [x] Glitter Bomb reads as a sparkly party favor — not a military explosive; pink/gold/glitter palette, fun shape (aspirational — visual verification required) [US-60]
- [x] On placement, all non-boss enemies in the 3×3 grid area (center = bomb cell, ±1 row, ±1 col, clamped to rows 0–4 and cols 0–8) are killed [US-60]
- [x] On placement, boss-type enemies in the 3×3 area take >= BOMB_BOSS_DAMAGE HP reduction; BOMB_BOSS_DAMAGE is a named constant >= 300 defined in a config or system file [US-60]
- [x] Enemies outside the 3×3 area are not affected by the detonation [US-60]
- [x] Glitter Bomb entity is removed from the grid immediately after detonation [US-60]
- [x] Detonation plays a sparkle/glitter burst visual effect at the bomb's grid position (depth 5 — entity layer) [US-60]
- [x] AOE detonation logic resides in src/systems/ (pure TypeScript, no Phaser import) [US-60]
- [x] test/SingleUse.test.ts or dedicated bomb test: detonation kills non-boss enemies inside 3×3, deals BOMB_BOSS_DAMAGE to boss-type inside 3×3, does NOT affect enemies outside 3×3, clamps to grid bounds when bomb is placed at edge [US-60]
- [x] Glitter Bomb unlocks after completing L5: updateUnlocksAfterLevel with completedLevelIndex=4 returns 'bomb' [US-60]
- [x] test/DefenderUnlocks.test.ts: completing level index 4 unlocks 'bomb' [US-60]
- [x] Toy unlock card overlay displays for Glitter Bomb on first unlock (same pattern as existing: DRAW_DEFENDER at 2x, name, cost, bio, cream/brown card, slide-in, "Collect!", localStorage bio_shown_defender_bomb) [US-60]
- [x] ToysScene renders Glitter Bomb card — silhouette before unlock, full card after [US-60]
- [x] Glitter Bomb preview in ToysScene and loadout screen shows idle bob animation (same tween pattern as existing defender previews) [US-60]
- [x] ToysScene and unlock card overlay render Glitter Bomb using the container + DRAW_DEFENDER['bomb'] Record lookup pattern (not a function call) [US-60]
- [x] GameScene bomb detonation calls the AOE function from src/systems/ — no inline re-implementation of detonation logic in scene code [US-60]
- [x] Glitter Bomb detonation includes a guard preventing double-detonation if placement handler fires multiple times [US-60]

#### US-61 — Expanded Loadout & Toy Selection Redesign

- [x] MAX_LOADOUT constant = 5 in DefenderUnlocks.ts [US-61]
- [x] needsLoadoutSelection returns true when unlocked.length > 5 (not > 4) [US-61]
- [x] test/DefenderUnlocks.test.ts: needsLoadoutSelection returns false for 5 unlocked, true for 6 unlocked [US-61]
- [x] Loadout selection screen subtitle text contains "5" (e.g., "Choose up to 5 defenders") [US-61]
- [x] When 6+ defenders shown on loadout screen, cards render in 2-row grid layout (top row has ceil(n/2) cards, bottom row has remaining, bottom row horizontally centered) [US-61]
- [x] When 5 or fewer defenders shown, cards render in a single row (backward compatible with existing layout) [US-61]
- [x] All cards are within the 576×400 logical canvas bounds with no overlap or clipping [US-61]
- [x] Staggered card entry animation fires for all cards in both rows (120ms delay between consecutive cards) [US-61]
- [x] Selection bounce animation (120ms scale tween) works on each card regardless of row [US-61]
- [x] Go button is positioned below both rows and fully visible [US-61]
- [x] Player can select exactly 5 defenders (loadout size capped at 5, not 4) [US-61]
- [x] In-game defender panel (HUD) renders 5 selected defenders without overlap or clipping [US-61]
- [x] Card dimensions in 2-row layout use proportional sizing (derived from GAME_WIDTH/GAME_HEIGHT, no hardcoded pixel values) with name text remaining legible [US-61]

#### Structural / phase criteria

- [x] stage-one.md updated: L10 boss level row added; "Available toys" column reflects new unlocks (Water Cannon at L3, Glitter Bomb at L5); design notes updated for new toys [phase]
- [x] AGENTS.md Defenders section updated with Water Cannon (key 'cannon', behavior, stats, knockback) and Glitter Bomb (key 'bomb', behavior, 3×3 AOE, BOMB_BOSS_DAMAGE) [phase]
- [x] AGENTS.md Defender unlocks section updated: L3 unlocks wall + cannon, L5 unlocks bomb, L6 unlocks trapper, L8 unlocks mine [phase]
- [x] AGENTS.md Level progression section reflects that loadout selection first appears at L7 (6 unlocked > 5 max) [phase]

### Golden principles (phase-relevant)
- Game logic in src/systems/ as pure TypeScript, no Phaser dependencies — knockback logic, AOE detonation logic
- Config-driven entities — Water Cannon and Glitter Bomb added to defenders.ts registry, not hardcoded in scenes
- Per-key shape drawing convention in DefenderEntity.ts (dedicated if/case branch per defender key)
- Depth layer map maintained: entities at 5, overlays at 199-201, HUD at 50
- Named constants for tunable values (BOMB_BOSS_DAMAGE, knockback amount, rechargeTime)
- Toy unlock card pattern preserved: DRAW_DEFENDER at 2x, cream background, warm brown border (#5d4037), slide-in, "Collect!" button, localStorage tracking
- Proportional sizing for loadout cards (GAME_WIDTH/GAME_HEIGHT derived, no hardcoded px)
- All defender types follow animation baseline: idle bob on preview, fire/placement reaction during gameplay
