# Phase: toy-arsenal

Status: draft

## Design direction

Same bedroom toy-box aesthetic — colorful, chunky, kid-friendly. Water Cannon reads as a big toy water blaster (playful splash, blue/cyan palette, not military hardware). Glitter Bomb reads as a sparkly party favor (pink/gold sparkle burst, fun not explosive). Card layout uses proportional sizing consistent with existing loadout styling.

## HUD / loadout layout plan

**Toy selection screen (LevelSelectScene loadout overlay):**
- Title "Pick Your Toys" at top (~y=30)
- Subtitle "Choose up to 5 defenders" below title (~y=55)
- 2-row card grid in center area:
  - Row 1: 4 cards evenly spaced (~y=100-200)
  - Row 2: 3 cards centered below row 1 (~y=210-310)
  - Card width: proportional (GAME_WIDTH / 5 - gap), card height: ~45% of available area per row
- "Go" button centered at bottom (~y=360)

**In-game defender panel (HUD):**
- Currently fits 4 defenders. With MAX_LOADOUT=5, panel must fit 5 without overlap.
- Proportional sizing (existing pattern) should auto-adapt, but verify.

## Stories

### US-59 — Water Cannon Defender

As a player, I want a Water Cannon defender that shoots large water blasts dealing double Water Pistol damage with knockback on hit, so that I have a powerful offensive option against tough enemies from early in the game.

**Acceptance criteria:**
- New defender type registered in defenders.ts with key 'cannon': behavior 'shooter', damage >= 24 (2× Water Pistol), cost >= 125, range 9, singleUse false, non-empty bio string
- Water Cannon fires large water projectiles — visually larger and blue/cyan colored, distinct from Water Pistol's yellow
- On projectile hit, non-boss enemies are knocked back ~1 cell toward the right edge; boss-type enemies are not knocked back
- Knockback does not push enemies past the rightmost grid column (col 8)
- Water Cannon has a unique visual shape in DefenderEntity.ts (distinct from Water Pistol's shape drawing)
- Water Cannon unlocks after completing Level 3 (alongside Block Tower) — both 'wall' and 'cannon' unlock at completedLevelIndex 2
- Toy unlock card overlay displays for Water Cannon on first unlock (DRAW_DEFENDER at 2x, name, cost, bio — same pattern as existing unlock cards, tracked via localStorage)
- Water Cannon appears in ToysScene — silhouette before unlock, full card with name + visual + bio after unlock
- Water Cannon has fire animation reaction (recoil or forward-lunge tween) on each shot
- Knockback logic is implemented in src/systems/ as pure TypeScript (no Phaser dependency)

**User guidance:**
- Discovery: Unlocked as a reward after completing Level 3 (alongside Block Tower)
- Manual section: N/A — no user manual exists
- Key steps: 1. Complete Level 3 to unlock Water Cannon and Block Tower. 2. See the unlock card introducing the new toy. 3. Place Water Cannon on a grid cell. 4. It auto-fires large blue water blasts that deal heavy damage and push non-boss enemies back.

**Design rationale:** Water Cannon is a direct power upgrade over the Water Pistol — more expensive but significantly more effective. The knockback mechanic creates tactical depth: pushed-back enemies must traverse more grid, giving other defenders more time to fire. Unlocking at L3 gives younger players a strong offensive tool early. Knockback disabled on bosses to prevent trivial boss stalling. Using existing 'shooter' behavior keeps implementation simple — knockback is an additional on-hit effect keyed off the defender type or a new DefenderType field.

---

### US-60 — Glitter Bomb Defender

As a player, I want a Glitter Bomb that detonates on placement to instantly kill all non-boss enemies in a 3×3 area (and deal large damage to bosses), so that I have a powerful crowd-control option for overwhelming waves.

**Acceptance criteria:**
- New defender type registered in defenders.ts with key 'bomb': singleUse true, cost in range 75–125, rechargeTime >= 12000ms, non-empty bio string
- DefenderBehavior type union extended to include 'bomb' (or Glitter Bomb uses existing 'mine' behavior with distinct detonation logic)
- Glitter Bomb detonates on placement: all enemies in the 3×3 grid area (center = bomb cell, ±1 row ±1 col, clamped to grid bounds 0–4 rows, 0–8 cols) are affected
- Non-boss enemies in the 3×3 area are instant-killed
- Boss-type enemies in the 3×3 area take large damage >= BOMB_BOSS_DAMAGE (named constant, >= 300 HP) instead of instant kill
- Glitter Bomb entity is removed from the grid immediately after detonation
- Detonation plays a sparkle/glitter burst visual effect at the bomb's grid position
- Glitter Bomb has a unique sparkly/fun visual shape in DefenderEntity.ts (distinct from all other defenders)
- Glitter Bomb unlocks after completing Level 5 — updateUnlocksAfterLevel returns 'bomb' for completedLevelIndex 4
- Toy unlock card overlay displays for Glitter Bomb on first unlock (same card pattern as existing defenders)
- Glitter Bomb appears in ToysScene — silhouette before unlock, full card after
- AOE detonation logic is in src/systems/ as pure TypeScript (no Phaser dependency)

**User guidance:**
- Discovery: Unlocked as a reward after completing Level 5
- Manual section: N/A
- Key steps: 1. Complete Level 5 to unlock Glitter Bomb. 2. See the unlock card. 3. Select Glitter Bomb from the defender panel. 4. Place it on a grid cell near enemies — it detonates immediately, killing all non-boss enemies in the 3×3 area. Bosses take big damage instead.

**Design rationale:** Glitter Bomb is the "panic button" — mid-range cost but devastating crowd control. Immediate detonation (vs. Mine's arm-and-wait) makes placement an active tactical decision. The 3×3 area rewards strategic placement near enemy clusters. Boss damage reduction (chunk, not instant kill) prevents trivializing L10. Purchase cooldown prevents spam. Visual identity as a sparkly party favor keeps the toy-box theme kid-friendly.

**Interaction model:** Same as existing defender placement — select from panel, click grid cell to place. The difference from Mine: Glitter Bomb detonates immediately on placement and is consumed. No arming delay. The player sees: select → place → sparkle burst → enemies in 3×3 die → bomb disappears. Purchase cooldown timer appears on the panel slot (same recharge UI pattern as Marble Mine).

---

### US-61 — Expanded Loadout & Toy Selection Redesign

As a player, I want to pick up to 5 toys for each level (instead of 4) and see all my unlocked toys in a clear 2-row grid layout, so that the selection screen scales gracefully with my growing 7-toy collection.

**Acceptance criteria:**
- MAX_LOADOUT changed from 4 to 5 in DefenderUnlocks.ts
- needsLoadoutSelection returns true when unlocked.length > 5 (selection screen first appears at 6+ unlocked)
- Loadout selection screen subtitle updated to reflect 5 (e.g., "Choose up to 5 defenders")
- When 6+ defenders are shown, cards arrange in a 2-row grid layout (top row 4, bottom row remaining, bottom row centered)
- When 5 or fewer defenders are shown, layout remains a single row (backward compatible)
- Cards remain legible and tappable at the 576×400 logical resolution
- Staggered card entry animation works with 2-row layout (120ms delay pattern preserved)
- Selection bounce animation works on each card in both rows
- Go button positioned below both rows
- In-game defender panel (HUD) displays up to 5 selected defenders without overlap or clipping
- Player can select up to 5 defenders (not 4) in the loadout screen

**User guidance:**
- Discovery: Selection screen automatically appears when 6+ toys are unlocked (first at L7 — after Honey Bear unlocks at L6)
- Manual section: N/A
- Key steps: 1. Complete Level 6 to unlock your 6th toy (Honey Bear). 2. Before the next level, "Pick Your Toys" screen appears. 3. Select up to 5 toys from the 2-row grid. 4. Press Go.

**Design rationale:** Increasing from 4 to 5 gives players more options while preserving meaningful selection constraint (7 available, pick 5 = 2 excluded). The 2-row grid replaces the single-row layout that cannot fit 7 cards legibly at 576×400 resolution. Centering the shorter bottom row keeps the layout balanced. Backward-compatible single row for ≤5 avoids unnecessary layout changes for early levels.

---

## Done-when (observable)

**US-59 — Water Cannon Defender**

- [ ] defenders.ts registers 'cannon' with behavior 'shooter', damage >= 24, cost >= 125, range 9, singleUse false, non-empty bio string [US-59]
- [ ] DefenderType interface extended with optional `knockback?: number` field (or equivalent mechanism); 'cannon' entry sets knockback > 0; TypeScript strict-mode compilation passes (npx tsc --noEmit) [US-59]
- [ ] DefenderEntity.ts has a dedicated drawing path for key 'cannon' — distinct if/case branch, does NOT reuse the 'shooter' (Water Pistol) shape [US-59]
- [ ] Water Cannon reads as a big toy water blaster — chunky barrel/nozzle shape, playful proportions, not military hardware (visually distinct silhouette from Water Pistol's simple pistol shape) [US-59] (aspirational — visual verification required)
- [ ] ProjectileEntity.ts renders Water Cannon projectile with blue/cyan fill color (distinct from Water Pistol yellow and Honey Bear amber) and visually larger radius than Water Pistol projectile [US-59]
- [ ] On Water Cannon projectile hit, non-boss enemy col position increases by ~1 cell (knockback toward right edge); enemy col does not exceed grid col bound (8) [US-59]
- [ ] On Water Cannon projectile hit against a bossType=true enemy, no knockback is applied (col position unchanged) [US-59]
- [ ] Knockback function resides in src/systems/ (pure TypeScript, no Phaser import) [US-59]
- [ ] test/Combat.test.ts or dedicated knockback test: non-boss enemy knocked back ~1 cell on Water Cannon hit; boss-type enemy NOT knocked back; knockback clamped to col 8 [US-59]
- [ ] Water Cannon unlocks after completing L3: updateUnlocksAfterLevel with completedLevelIndex=2 returns an unlock set containing both 'wall' AND 'cannon' [US-59]
- [ ] test/DefenderUnlocks.test.ts: completing level index 2 unlocks both 'wall' and 'cannon' [US-59]
- [ ] Toy unlock card overlay displays for Water Cannon on first unlock — follows existing pattern (DRAW_DEFENDER at 2x, name, cost, bio, cream background, warm brown border, slide-in, "Collect!" button, localStorage tracking via bio_shown_defender_cannon) [US-59]
- [ ] ToysScene renders Water Cannon card — silhouette before unlock, full card (name + visual + bio) after unlock [US-59]
- [ ] Water Cannon has fire animation reaction (recoil or forward-lunge tween) on each projectile launch [US-59]
- [ ] Water Cannon preview in ToysScene and loadout screen shows idle bob animation (same tween pattern as existing defender previews) [US-59]
- [ ] ToysScene and unlock card overlay render Water Cannon using the container + DRAW_DEFENDER['cannon'] Record lookup pattern (not a function call) — same pattern as existing defenders [US-59]
- [ ] GameScene knockback application calls the knockback function from src/systems/ — no inline re-implementation of knockback logic in scene code [US-59]

**US-60 — Glitter Bomb Defender**

- [ ] defenders.ts registers 'bomb' with singleUse true, cost in range 75–125, rechargeTime >= 12000, non-empty bio string [US-60]
- [ ] DefenderBehavior type union includes 'bomb' (or Glitter Bomb integrates with existing 'mine' behavior); TypeScript strict-mode compilation passes (npx tsc --noEmit) [US-60]
- [ ] DefenderEntity.ts has a dedicated drawing path for key 'bomb' — distinct if/case branch, sparkly/fun visual [US-60]
- [ ] Glitter Bomb reads as a sparkly party favor — not a military explosive; pink/gold/glitter palette, fun shape (aspirational — visual verification required) [US-60]
- [ ] On placement, all non-boss enemies in the 3×3 grid area (center = bomb cell, ±1 row, ±1 col, clamped to rows 0–4 and cols 0–8) are killed [US-60]
- [ ] On placement, boss-type enemies in the 3×3 area take >= BOMB_BOSS_DAMAGE HP reduction; BOMB_BOSS_DAMAGE is a named constant >= 300 defined in a config or system file [US-60]
- [ ] Enemies outside the 3×3 area are not affected by the detonation [US-60]
- [ ] Glitter Bomb entity is removed from the grid immediately after detonation [US-60]
- [ ] Detonation plays a sparkle/glitter burst visual effect at the bomb's grid position (depth 5 — entity layer) [US-60]
- [ ] AOE detonation logic resides in src/systems/ (pure TypeScript, no Phaser import) [US-60]
- [ ] test/SingleUse.test.ts or dedicated bomb test: detonation kills non-boss enemies inside 3×3, deals BOMB_BOSS_DAMAGE to boss-type inside 3×3, does NOT affect enemies outside 3×3, clamps to grid bounds when bomb is placed at edge [US-60]
- [ ] Glitter Bomb unlocks after completing L5: updateUnlocksAfterLevel with completedLevelIndex=4 returns 'bomb' [US-60]
- [ ] test/DefenderUnlocks.test.ts: completing level index 4 unlocks 'bomb' [US-60]
- [ ] Toy unlock card overlay displays for Glitter Bomb on first unlock (same pattern as existing: DRAW_DEFENDER at 2x, name, cost, bio, cream/brown card, slide-in, "Collect!", localStorage bio_shown_defender_bomb) [US-60]
- [ ] ToysScene renders Glitter Bomb card — silhouette before unlock, full card after [US-60]
- [ ] Glitter Bomb preview in ToysScene and loadout screen shows idle bob animation (same tween pattern as existing defender previews) [US-60]
- [ ] ToysScene and unlock card overlay render Glitter Bomb using the container + DRAW_DEFENDER['bomb'] Record lookup pattern (not a function call) [US-60]
- [ ] GameScene bomb detonation calls the AOE function from src/systems/ — no inline re-implementation of detonation logic in scene code [US-60]
- [ ] Glitter Bomb detonation includes a guard preventing double-detonation if placement handler fires multiple times [US-60]

**US-61 — Expanded Loadout & Toy Selection Redesign**

- [ ] MAX_LOADOUT constant = 5 in DefenderUnlocks.ts [US-61]
- [ ] needsLoadoutSelection returns true when unlocked.length > 5 (not > 4) [US-61]
- [ ] test/DefenderUnlocks.test.ts: needsLoadoutSelection returns false for 5 unlocked, true for 6 unlocked [US-61]
- [ ] Loadout selection screen subtitle text contains "5" (e.g., "Choose up to 5 defenders") [US-61]
- [ ] When 6+ defenders shown on loadout screen, cards render in 2-row grid layout (top row has ceil(n/2) cards, bottom row has remaining, bottom row horizontally centered) [US-61]
- [ ] When 5 or fewer defenders shown, cards render in a single row (backward compatible with existing layout) [US-61]
- [ ] All cards are within the 576×400 logical canvas bounds with no overlap or clipping [US-61]
- [ ] Staggered card entry animation fires for all cards in both rows (120ms delay between consecutive cards) [US-61]
- [ ] Selection bounce animation (120ms scale tween) works on each card regardless of row [US-61]
- [ ] Go button is positioned below both rows and fully visible [US-61]
- [ ] Player can select exactly 5 defenders (loadout size capped at 5, not 4) [US-61]
- [ ] In-game defender panel (HUD) renders 5 selected defenders without overlap or clipping [US-61]
- [ ] Card dimensions in 2-row layout use proportional sizing (derived from GAME_WIDTH/GAME_HEIGHT, no hardcoded pixel values) with name text remaining legible [US-61]

**Structural / phase criteria**

- [ ] stage-one.md updated: L10 boss level row added; "Available toys" column reflects new unlocks (Water Cannon at L3, Glitter Bomb at L5); design notes updated for new toys [phase]
- [ ] AGENTS.md Defenders section updated with Water Cannon (key 'cannon', behavior, stats, knockback) and Glitter Bomb (key 'bomb', behavior, 3×3 AOE, BOMB_BOSS_DAMAGE) [phase]
- [ ] AGENTS.md Defender unlocks section updated: L3 unlocks wall + cannon, L5 unlocks bomb, L6 unlocks trapper, L8 unlocks mine [phase]
- [ ] AGENTS.md Level progression section reflects that loadout selection first appears at L7 (6 unlocked > 5 max) [phase]

**Safety criteria:** N/A — this phase introduces no API endpoints, user input fields, or query interpolation. All interaction is pointer clicks on the Phaser game canvas.

## AGENTS.md sections affected

When this phase ships, the build-loop Phase Reconciliation Gate should update:
- **Defenders** section: add Water Cannon and Glitter Bomb entries (type, behavior, stats, bio)
- **Enemies** section: no change (no new enemies)
- **Defender unlocks** section: L3 → wall + cannon, L5 → bomb (new), L6 → trapper, L8 → mine
- **Level progression** section: loadout threshold 5 (selection at 6+), first selection at L7
- **Entities** section: DefenderEntity.ts draws 'cannon' and 'bomb' shapes; ProjectileEntity.ts has cannon blue projectile
- **SingleUse / new system** section: bomb detonation logic

## Golden principles (phase-relevant)

- Game logic in src/systems/ as pure TypeScript, no Phaser dependencies — knockback logic, AOE detonation logic
- Config-driven entities — Water Cannon and Glitter Bomb added to defenders.ts registry, not hardcoded in scenes
- Per-key shape drawing convention in DefenderEntity.ts (dedicated if/case branch per defender key)
- Depth layer map maintained: entities at 5, overlays at 199-201, HUD at 50
- Named constants for tunable values (BOMB_BOSS_DAMAGE, knockback amount, rechargeTime)
- Toy unlock card pattern preserved: DRAW_DEFENDER at 2x, cream background, warm brown border (#5d4037), slide-in, "Collect!" button, localStorage tracking
- Proportional sizing for loadout cards (GAME_WIDTH/GAME_HEIGHT derived, no hardcoded px)
- All defender types follow animation baseline: idle bob on preview, fire/placement reaction during gameplay
