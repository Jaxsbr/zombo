## Phase retrospective — guided-intro

**Metrics:** 9 tasks (7 build + 2 review), 1 investigate, 6 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 14%. Health: **Healthy**.

**Review:** 2 review tasks (PR creation + review-pr, handle-pr-review), all pass. 0 critical, 4 concerns, 1 nit from automated review. 3 fixed, 2 challenged.

**Build-log failure classes:**
- (none — 0 failures)

**Review-sourced failure classes:**
- `cross-cutting-break` — **first-seen** (1 finding: GameOverScene dimBg overlay missing `setInteractive()` while LevelSelectScene had it — inconsistent overlay lifecycle between two scenes implementing the same card pattern). Fixed during handle-pr-review.
- `missing-error-path` — **pattern** (1 finding: `spawnSpark()` called without duplicate guard in tutorial COLLECT_SPARK step — re-entrant call could spawn duplicate sparks). First-seen in game-feel retro (projectile spawned past melee-range attacker). Fixed during handle-pr-review. Compound fix proposed.

**Previous retro patterns checked:**
- `spec-ambiguity` (6x in prior phases) — not triggered. Done-when criteria were mechanically verifiable with file/line evidence.
- `edit-policy-drift` (4x in prior phases) — not triggered. No stale architecture content produced.
- `visual-rendering-bug` (2x in prior phases) — not triggered. No Phaser API misuse.
- `missing-error-path` (1x in game-feel) — **triggered again** from PR review. Same class: method callable multiple times without guard. Root cause: when implementing UI flows with multiple entry points (tutorial step transitions, overlay show/hide), re-entrant calls aren't guarded.

**Compounding fixes proposed:**
- [LEARNINGS.md] Append `missing-error-path` recurrence in zombo guided-intro. Note: LEARNINGS.md #10 already documents the class and quality check (`error-path-coverage`). This recurrence is UI-specific: overlay/tutorial methods called without re-entrancy guards. Recommend adding a note to LEARNINGS.md that re-entrancy guards are a common miss in scene methods with multiple callers (tutorial steps, overlay lifecycle). Prevention point: spec-author gate (add guard-clause criteria for methods with multiple entry points).
