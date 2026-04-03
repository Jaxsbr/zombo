## Phase retrospective — game-feel

**Metrics:** 14 build tasks, 7 investigate, 7 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 50%. Health: **Healthy**.

**Review:** 3 review tasks (PR creation, review-pr, handle-pr-review), all pass. 0 critical, 1 concern, 0 nit from automated review. Concern fixed.

**Build-log failure classes:**
- (none — 0 failures)

**Review-sourced failure classes:**
- `edit-policy-drift` — **pattern** (1 finding: ARCHITECTURE.md had stale "Structural intent — game-feel phase (planned)" section with pre-implementation content after phase shipped; also missing TitleScene and old entity descriptions). First-seen in playable retro (ARCHITECTURE.md listed wrong filenames + "planned" annotation). Also documented cross-project in LEARNINGS.md #48 (spec-author planned annotations) and #52 (architecture diagram drift). Fix proposed.

**Previous retro patterns checked:**
- `spec-ambiguity` (first-seen in game-research) — not triggered. Done-when criteria were all mechanically verifiable.
- `edit-policy-drift` (first-seen in playable) — **triggered again**. Same root cause: spec-author writes speculative architecture content before implementation; reconciliation doesn't fully clean it up.
- `schema-code-drift` (first-seen in playable) — not triggered.

**Compounding fixes proposed:**
- [LEARNINGS.md] Append `edit-policy-drift` recurrence in zombo game-feel. Note: LEARNINGS.md #48 already documents the root cause and recommended prevention (spec-author should stop writing forward-looking sections to ARCHITECTURE.md). This is the third project-level occurrence (game-research→playable→game-feel in zombo; also seen in mustard). Recommend the operator enforce the existing learning by updating the spec-author command to explicitly prohibit "Structural intent" sections in ARCHITECTURE.md.

**Post-review operator feedback (4 playtest rounds):**
Significant gameplay and UI issues were discovered during manual playtesting after the formal review cycle completed. These were not caught by the automated review or done-when verification because the spec criteria were mechanically met but didn't capture gameplay feel:
- Enemies walked through non-wall defenders (spec said "walls block enemies" but was silent on non-walls → `spec-ambiguity` class, first-seen in zombo)
- Shooter couldn't hit enemies at melee range (projectile spawned past the attacker → `missing-error-path` class, first-seen in zombo)
- Multiple HUD/card layout iterations needed (text overflow, unclear selection, missing countdown bar)
- Health bars needed repositioning, thicker rendering, damage-only visibility
- Jack-in-the-Box shape unrecognizable at 64×64 — required redesign

These suggest that for game projects, spec criteria alone don't catch playability issues. A "playtest gate" between phase completion and review would catch these earlier. Logged as observation — not yet a twice-seen pattern.
