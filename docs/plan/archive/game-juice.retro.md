## Phase retrospective — game-juice

**Metrics:** 15 tasks (13 build + 2 review), 4 investigate, 9 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 31% (CSS/JS-only phase, investigate-first recommended but not mandatory). Health: **Healthy**.

**Review:** 2 review tasks (review-pr, handle-pr-review), all pass. 0 critical, 1 concern, 0 nit from automated review. Concern fixed.

**Build-log failure classes:**
- (none — 0 failures)

**Review-sourced failure classes:**
- `edit-policy-drift` — **repeat pattern** (1 finding: ARCHITECTURE.md "Planned for game-juice phase" section with speculative content — SparkEntity.ts predicted as "likely" but sparks implemented inline, forward-looking language). Previously seen in playable (first), game-feel (pattern), and documented in LEARNINGS.md #55. The recommended fix (prohibit spec-author forward-looking ARCHITECTURE.md sections) has not been enforced — the spec-author command continues writing them.

**Post-review operator feedback:**
- `spec-ambiguity` — **pattern** (first-seen in game-research retro, second-seen here). The US-22 "bedroom atmosphere" spec defined done-when criteria only for in-canvas Phaser elements (furniture silhouettes, dust motes, themed scene backgrounds). All criteria were mechanically met. However, the operator reported the game still looked like "a tiny game floating in the middle of a dark web page" — the `index.html` body background (`#1a1a2e` dark navy) was never addressed by the spec. The spec described the desired feeling ("bedroom with toys scattered around") but the done-when criteria only verified Phaser canvas objects, missing the page-level HTML/CSS context that dominates the visual impression. Fixed post-review by updating `index.html` to warm brown background with floor board lines and canvas border/shadow.

**Previous retro patterns checked:**
- `spec-ambiguity` (first-seen in game-research) — **triggered again**. Game-research: spec missed visual documentation modalities for spatial subject matter. Game-juice: spec missed page-level context for visual atmosphere. Root cause: spec done-when criteria verify technical artifacts but miss the user's actual experience boundary.
- `edit-policy-drift` (first-seen in playable, compounded in game-feel, LEARNINGS.md #55) — **triggered again (3rd occurrence)**. Same root cause: spec-author writes forward-looking sections to ARCHITECTURE.md that become stale on implementation. Existing fix recommendation not enforced.

**Compounding fixes proposed:**
- [spec-author gate] Add a "user-experience boundary check" to spec-author: when defining done-when criteria for visual/atmosphere features, explicitly prompt whether the criteria cover the full user viewport (not just the game canvas or the application window, but also page context, browser chrome, surrounding layout). Reason: `spec-ambiguity` in game-research (missed visual modality) and game-juice (missed page background outside canvas).
- [LEARNINGS.md] Append `edit-policy-drift` recurrence #3 in zombo game-juice. Note: LEARNINGS.md #55 already documents the root cause and recommended prevention. Three consecutive project-level occurrences (playable → game-feel → game-juice) confirm the existing fix recommendation is not being enforced. Escalate: the spec-author command must be updated to prohibit writing forward-looking "Planned for" / "Structural intent" sections in ARCHITECTURE.md.
