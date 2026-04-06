## Phase retrospective — endgame-content

**Metrics:** 14 tasks (12 build + 2 review), 6 investigate, 6 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 50%. Health: **Healthy**.

**Review:** 2 review tasks (review-pr, handle-pr-review), all pass. 0 critical, 1 concern, 0 nits from automated review. 1 fixed.

**Build-log failure classes:**
- (none — 0 failures)

**Review-sourced failure classes:**
- `cross-cutting-break` — **pattern** (1 finding: GameScene manually duplicated AOE row calculation instead of calling `getAOETargetRows()` from Combat.ts. First-seen in guided-intro: GameOverScene overlay lifecycle inconsistent with LevelSelectScene). Fix proposed.

**Previous retro patterns checked:**
- `spec-ambiguity` (multiple prior phases) — not triggered. Done-when criteria mechanically verifiable.
- `edit-policy-drift` (multiple prior phases) — not triggered. AGENTS.md and ARCHITECTURE.md reconciled cleanly.
- `missing-error-path` (game-feel + guided-intro) — not triggered. No re-entrancy issues.

**Compounding fixes proposed:**
- [LEARNINGS.md] Append `cross-cutting-break` recurrence — pure-logic duplication between `src/systems/` and `src/scenes/`. When a function exists in a systems module (Combat.ts, HoneyTrap.ts, etc.), scene code must call it rather than re-implementing the logic inline. Prevention point: quality check (agents-consistency check should flag scene code that duplicates systems-module logic).
