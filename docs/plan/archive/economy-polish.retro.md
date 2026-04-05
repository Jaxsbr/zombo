## Phase retrospective — economy-polish

**Metrics:** 9 tasks (7 build + 2 review), 3 investigate, 4 implement, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 43%. Health: **Healthy**.

**Review:** 2 review tasks (review-pr, handle-pr-review), all pass. 0 critical, 0 concern, 1 nit from automated review. Nit fixed (dead code).

**Build-log failure classes:**

None. All 9 tasks passed on first attempt. Zero rework.

**Review-sourced failure classes:**

No Critical or Concern findings in PR #9 review.

**Post-review operator feedback (3 rounds):**

Significant visual issues caught during manual playtesting after the review cycle:

1. **Cards invisible** — Phaser tween `props.alpha.from` API misuse. The `props` block overrides the top-level tween target, so `alpha` tweened from 0 to the container's current alpha (also 0 — set by `setAlpha(0)`). Cards never became visible. Fix: set initial offset state directly on the container, use simple top-level tween targets.

2. **Preview images too small** — Spec criterion ">= 0.75 scale" was technically met (~0.86) but defender shapes were tiny on screen. Operator requested x2. Fix: doubled preview scale to `Math.max(1.5, (cardWidth / 110) * 2)`.

3. **Overlay wrong style** — Overlay was 0.6 opacity black, causing "Choose a Level" text to bleed through. Design direction said "same bedroom toy-box aesthetic" but overlay was black (0x000000) instead of the game's warm brown (0x3e2723). Fix: full opacity + brown background.

**Failure classification:**

- `visual-rendering-bug` — **first-seen** (new class). Phaser tween `props` block API semantics caused invisible cards. Unit tests cannot catch rendering output bugs. The done-when criterion ("staggered entry animation") was implemented but broken due to framework API misuse.
- `spec-ambiguity` — **repeat pattern** (design direction said "same bedroom toy-box aesthetic, bold, chunky, inviting" but done-when criteria used loose numeric thresholds: ">= 0.75 scale" when ~1.7 was needed, ">= 50x50 preview" when ~100x100 was needed. Overlay opacity and color were unspecified entirely). Previously seen: game-research (1st, visual modality), game-juice (2nd, page-level context), army-builder (3rd, class baseline). New facet: **design direction not traced to done-when** — aesthetic claims in the "Design direction" section had no corresponding criteria for color palette consistency, overlay style, or absolute visual sizing relative to gameplay context.

**Previous retro patterns checked:**
- `spec-ambiguity`: 5th+ occurrence across zombo. Previous fixes: #2 (design rationale), #4 (investigate-first), game-juice (user-experience boundary), army-builder (class baseline). None address design-direction-to-done-when traceability.
- `visual-rendering-bug`: new class, first-seen. No compounding.
- `spec-subjective` (LEARNINGS #1): related but distinct — #1 addresses rejection of subjective wording ("feels alive"). Here the criteria were observable but thresholds were wrong.
- `missing-design-taste` (LEARNINGS #46): related — #46 added design direction sections and frontend-design.md reference. The design direction existed in this phase but wasn't translated into criteria. This retro identifies the gap between direction and criteria.

**Compounding fixes proposed:**

- **[spec-author gate] `spec-ambiguity` #61 — design-direction traceability check.** When a phase spec includes a "Design direction" section, spec-author must verify that every aesthetic claim traces to at least one done-when criterion. Specifically: (a) color/palette claims ("same bedroom aesthetic") require a criterion naming the specific color values or referencing the project palette, (b) sizing claims ("bold, chunky") require absolute minimum sizes verified at the actual viewport dimensions, not just relative ratios, (c) overlay/modal specs must include opacity and background color criteria. Unverifiable aesthetic aspirations should be explicitly marked `(aspirational — visual verification required)` so the build loop knows to flag them for human review. Reason: `spec-ambiguity` in economy-polish (design direction → overlay black instead of brown, preview too small at 0.86 scale) and game-juice (page-level context missed despite atmosphere spec).
