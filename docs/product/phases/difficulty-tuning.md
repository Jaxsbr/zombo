# Phase: difficulty-tuning

Status: shipped

## Design direction

Same bedroom toy-box aesthetic. No visual changes. This is a pure balance/pacing pass on enemy speeds and level wave configs. The game should feel gentler and more forgiving for kids — PvZ-style where most players clear stage one comfortably.

## Stories

### US-50 — Reduce enemy speeds for kid-friendly pacing

As a young player, I want enemies to approach more slowly, so that I have time to think about where to place my toys and click sparks without feeling overwhelmed.

**Acceptance criteria:**
- All 4 enemy speeds reduced — enemies cross the grid more slowly, giving players more reaction time
- Armored Bunny is slower than Dust Bunny (tank archetype: high HP compensated by low speed)
- Cleaning Robot remains the slowest enemy (very slow tank)
- Sock Puppet remains the fastest enemy but with a meaningful speed reduction
- Clear speed hierarchy enforced: Sock Puppet > Dust Bunny > Armored Bunny > Cleaning Robot

**User guidance:** N/A — internal balance tuning, affects gameplay feel but no new player-facing mechanic.

**Design rationale:** PvZ uses a clear speed hierarchy where tanky enemies are always slow and fast enemies have low HP. Currently Armored Bunny (0.45 cells/s) is *faster* than basic Dust Bunny (0.4) despite having 3x HP — this violates the tank archetype and makes L5-L7 brutally punishing for kids. Reducing all speeds and enforcing tank-is-slow creates the PvZ-style "comfortable early game" the stage one levels need.

---

### US-51 — Rebalance wave pacing L1-L9 for smooth difficulty curve

As a young player, I want waves to send enemies in at a pace I can keep up with, so that I feel challenged but not overwhelmed, and each level feels like a small step up from the last.

**Acceptance criteria:**
- Spawn intervals widened across all levels — enemies arrive at a pace a child can manage
- Difficulty curve is smooth across the 9 levels: L1 is very easy, L9 is the hardest, each level is a gradual step
- No dramatic within-level difficulty cliff (the last wave of a level should not feel wildly harder than the first)
- L2-L3 spawn intervals are at least as wide as L4's loosest wave (currently L3 has 1.0s intervals while L4 starts at 3.0s — a jarring inconsistency)
- Setup delays give adequate prep time, especially at levels introducing new enemy types (L5, L6, L8)
- Level wave counts, enemy type composition per wave, and structural constraints (warmup waves, bio triggers, unlock triggers) are all preserved
- Existing structural/composition tests (wave counts, enemy types, lane validation) still pass
- Tests that assert specific timing or balance values are updated to match the new configs

**User guidance:** N/A — internal balance tuning.

**Design rationale:** Current L5-L9 all use identical escalation (3.0->2.5->2.0->1.5s intervals, 5->7->9->11 enemies per wave), creating a difficulty cliff at wave 3-4 of every level. Meanwhile L2-L3 have tighter intervals (1.0-1.5s) than L4-L5 wave 1 (3.0s), making the curve jagged. PvZ graduates difficulty *between* levels, not within them. The fix spreads enemies over longer periods and graduates interval tightening across the 9 levels, so each level is a gentle step up.

---

## Done-when (observable)

### US-50 — Reduce enemy speeds for kid-friendly pacing
- [x] Dust Bunny (`ENEMY_TYPES.basic`) speed in range [0.2, 0.3] cells/s (reduced from 0.4) [US-50]
- [x] Armored Bunny (`ENEMY_TYPES.armored`) speed strictly less than Dust Bunny speed [US-50]
- [x] Cleaning Robot (`ENEMY_TYPES.tough`) speed in range [0.1, 0.18] cells/s (reduced from 0.25) — slowest enemy [US-50]
- [x] Sock Puppet (`ENEMY_TYPES.jumper`) speed in range [0.25, 0.40] cells/s (shipped at 0.36, adjusted during review from initial 0.30) — fastest enemy [US-50]
- [x] Speed hierarchy holds: `jumper.speed > basic.speed > armored.speed > tough.speed` [US-50]
- [x] `test/EnemyTypes.test.ts` speed/stat assertions updated to match new values [US-50]
- [x] `test/Enemies.test.ts` "basic.speed > tough.speed" assertion still holds (already true, but verify armored is also covered) [US-50]
- [x] New test in `test/EnemyTypes.test.ts` (or `test/Enemies.test.ts`) validates the full speed hierarchy: `jumper.speed > basic.speed > armored.speed > tough.speed` [US-50]
- [x] `npm test` passes [US-50]

### US-51 — Rebalance wave pacing L1-L9 for smooth difficulty curve
- [x] No wave in any level (L1-L9) has a minimum spawn interval below 2.0s (minimum gap between consecutive spawns within a wave >= 2.0s) [US-51]
- [x] Minimum spawn intervals do not tighten faster than levels progress: for each pair of adjacent levels, the tighter-interval level's minimum spawn gap is >= 70% of the wider-interval level's minimum spawn gap [US-51]
- [x] Within each level, the last wave's minimum spawn interval is no less than 60% of the first wave's minimum spawn interval (prevents within-level difficulty cliffs) [US-51]
- [x] Setup delay for levels with `enemyBio` (L5, L6, L8) >= 25s (adequate prep time before new enemy types) [US-51]
- [x] Setup delay for all levels >= 18s [US-51]
- [x] Level wave counts unchanged: L1(1), L2(2), L3(3), L4(3), L5(4), L6(4), L7(4), L8(4), L9(5) [US-51]
- [x] Enemy type composition per wave preserved: L5 wave 1 basic-only, L6 wave 1 no tough, L8 wave 1 no jumper, etc. (all existing composition test assertions in `Levels.test.ts` pass) [US-51]
- [x] Total enemy count per level is the same or higher than current values (pacing fix is about wider intervals, not fewer enemies) [US-51]
- [x] A new test in `test/Levels.test.ts` validates the smooth difficulty curve: minimum spawn interval across all waves in level N is >= minimum spawn interval across all waves in level N+1 (each level is equal or slightly tighter than the previous) [US-51]
- [x] `test/Levels.test.ts` starting balance and timing assertions updated to match new config values [US-51]
- [x] `npm test` passes [US-51]

### Structural
- [x] `AGENTS.md` level progression description updated to reflect new enemy speeds and pacing philosophy (gentle curve, PvZ-style stage one) [phase]
- [x] `docs/product/stage-one.md` design notes section updated to mention the difficulty tuning rationale [phase]

## AGENTS.md sections affected
- **Game logic architecture > Level progression** — enemy speed values, wave pacing description
- **Game logic architecture > Enemies** — updated speed values for all 4 types
- **`src/config/enemies.ts`** — speed field values changed
- **`src/config/levels.ts`** — spawn delays, setup delays updated across L1-L9

## User documentation
- `docs/product/stage-one.md` — update design notes to mention difficulty tuning

## Safety criteria

N/A — this phase introduces no endpoints, user input fields, or query interpolation. All changes are config value updates in existing registries.

## Golden principles (phase-relevant)
- Config-driven entities — all changes are config value updates in `enemies.ts` and `levels.ts`; no system/scene code changes
- Game logic separated from Phaser rendering — speed values and spawn delays are consumed by existing pure TS systems (EnemyMovement, WaveManager)
- no-silent-pass — new difficulty curve test must have unconditional assertions
- agents-consistency — AGENTS.md updated to reflect shipped balance values
