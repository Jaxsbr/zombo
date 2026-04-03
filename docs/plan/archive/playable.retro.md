## Phase retrospective — playable

**Metrics:** 10 build tasks, 5 investigate, 5 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 50%. Health: **Healthy**.

**Review:** 3 review tasks (PR creation, review-pr, handle-pr-review), all pass. 0 critical, 2 concern, 1 nit from automated review. Both concerns fixed, nit skipped (YAGNI).

**Build-log failure classes:**
- (none — 0 failures)

**Review-sourced failure classes:**
- `edit-policy-drift` — first-seen (1 finding: ARCHITECTURE.md listed `Defender.ts` / `Enemy.ts` / `Projectile.ts` but actual files are `DefenderEntity.ts` / `EnemyEntity.ts` / `ProjectileEntity.ts`; also annotation said "planned" for shipped content). Root cause: spec-author pre-populated architecture doc with hypothetical filenames before implementation; reconciliation didn't catch the drift.
- `schema-code-drift` — first-seen (1 finding: `getEnemyKey()` derived registry key from `type.name.toLowerCase()`, creating implicit coupling between EnemyType.name and the ENEMY_TYPES registry key string). Fixed by switching to a reverse registry lookup.

**Previous retro patterns checked:**
- `spec-ambiguity` (first-seen in game-research) — not triggered in playable. No spec ambiguity issues in build or review.
- `edit-policy-drift` — new, first-seen. If this recurs (documentation drifts from implementation), propose a spec-author gate fix: architecture doc should use placeholder names (e.g., `<TBD>`) for files not yet created, with a reconciliation note.
- `schema-code-drift` — new, first-seen. If this recurs (code assumes implicit relationship between data fields), propose a quality check: scan for string-derived lookups against config registries.

**Compounding fixes proposed:**
- None. Both failure classes are first-seen. No patterns to compound.

**Post-review operator feedback:**
- Starting energy (150) was too low for comfortable playtesting of wave transitions. Increased to 500. The spec didn't specify a starting balance — future level/balance specs should include a "testable balance" note or a separate test-mode config.
