## Phase retrospective — toy-arsenal

**Metrics:** 19 tasks, 10 investigate, 9 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 53%. Health: Healthy.

**Stories:** US-59 (Water Cannon), US-60 (Glitter Bomb), US-61 (Expanded Loadout) — all completed.

**Build-log failure classes:**
- None. Zero fail or rework tasks across the phase.

**Review-sourced failure classes:**
- 2 Concern-level findings on PR #16 (both resolved): redundant type cast on `applyKnockback` parameter, missing explanatory comment on ±0.5 col tolerance in `bombDetonate`. Neither constitutes a recurring failure pattern — both are minor code-quality nits addressed in review.

**Compounding fixes proposed:**
- No compounding fixes. Clean phase with no failures and no pattern-level review findings.

**Notes:**
- Cross-cutting phase touching config (defenders.ts, enemies.ts), systems (Combat.ts, SingleUse.ts, DefenderUnlocks.ts), entities (DefenderEntity.ts, ProjectileEntity.ts), and scenes (GameScene.ts, LevelSelectScene.ts, GameOverScene.ts).
- Investigate-first mandate followed throughout — every story began with Branch B investigation before implementation.
- Post-merge operator feedback drove 4 rounds of knockback tuning (instant→lerp, reduce strength, per-enemy amounts). These were iterative design refinements, not build failures.
- UNLOCK_MAP structure change (string → string[]) was the key cross-cutting risk; investigated thoroughly before implementing.
