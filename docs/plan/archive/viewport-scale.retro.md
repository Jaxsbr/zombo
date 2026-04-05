## Phase retrospective — viewport-scale

**Metrics:** 7 tasks total (5 build + 2 review). 2 investigate, 2 implement, 1 gate, 2 review. 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 40%. Health: **Healthy**.

**Review:** PR #10. 0 critical, 0 concern, 1 nit (redundant flex centering — skipped as belt-and-suspenders). No review-sourced Critical/Concern findings.

**Build-log failure classes:**

None. All build tasks passed on first attempt.

**Post-review operator feedback (2 fix commits):**

Visual regression discovered during manual browser testing after review cycle:

1. **Canvas edge-to-edge** — the canvas filled the full viewport width with no horizontal background visible. Done-when criteria verified that `scale.mode: Phaser.Scale.FIT` was configured and `body background: #3e2723` was set, but no criterion specified that background must be *visually present* around the canvas as breathing room. The "Visual verification note" said rendering is checked by the human reviewer, but stated no specific visual outcomes to verify. The reviewer had no criterion to flag against.

2. **Body padding misdiagnosis** — first fix attempt: added `padding: 24px; box-sizing: border-box` to body. This had no effect. Root cause: Phaser Scale Manager measures `parent.offsetWidth`/`offsetHeight`, which does not account for CSS `padding`. The body padding was ignored for canvas sizing. Diagnosis was incorrect — Phaser uses `offsetWidth` not `clientWidth`. Correct fix: explicit `<div id="game-container">` with CSS dimensions `calc(100vw - 48px)` × `calc(100vh - 48px)` and `parent: 'game-container'` in `gameConfig`.

**Failure classification:**

- `spec-ambiguity` — **pattern** (6th occurrence in zombo — new facet). The done-when criteria for US-39 were config-correctness checks (property values in source files). The "Visual verification note" delegated runtime visual checking to the human reviewer but specified no outcomes to verify. Result: config was correctly implemented, visual outcome was wrong. No criterion existed to catch "background must be visible as margin around canvas." Previously seen: game-research (1st, visual modality), game-juice (2nd, page context), game-feel (3rd, post-review tuning), army-builder (4th, class baseline), economy-polish (5th, design-direction traceability). This is a NEW FACET: visual verification notes → missing specific observable outcomes. Fix #61 (economy-polish) addressed design-direction sections; this facet is distinct (visual rendering phases with browser-only outcomes). Twice-seen. Fix warranted.

- `visual-rendering-bug` — **pattern** (2nd occurrence in zombo — twice-seen). First occurrence: economy-polish (Phaser tween `props` block API semantics — invisible cards). Second occurrence: viewport-scale (Phaser Scale Manager parent measurement — CSS `padding` ignored). Common pattern: non-obvious Phaser API behavior that diverges from web standard expectations and cannot be caught by Vitest/node unit tests. Twice-seen rule applies. Fix warranted.

**Previous retro patterns checked:**
- `spec-ambiguity`: 6th occurrence. Previous fixes: LEARNINGS #2, #4 (game-research/game-juice), spec-author user-experience boundary (game-juice), class baseline (army-builder), design-direction traceability #61 (economy-polish). None target the "visual verification note → specific outcomes" gap.
- `visual-rendering-bug`: first-seen in economy-polish. This is the second occurrence. Twice-seen → compound.
- `edit-policy-drift`: not triggered.
- `missing-error-path`: not triggered.

**Compounding fixes proposed:**

- **[spec-author gate] `spec-ambiguity` — visual-verification-note outcomes.** When a phase spec includes a "Visual verification note" section, spec-author must add at least one `(aspirational — visual verification required)` done-when criterion that states the specific visual outcome to observe in a browser. Examples: "Background texture visible as a margin on all four canvas edges at any viewport size", "Canvas box-shadow fully unclipped — no edge of the shadow cut off by viewport boundaries". Without this, a config-correct implementation can ship with broken visual output that no automated criterion detects. Reason: `spec-ambiguity` in economy-polish (design-direction not traced to criteria — fix #61) and viewport-scale (visual verification note stated no outcomes to check, canvas filled viewport edge-to-edge undetected). Target: `~/dev/.cursor/skills/spec-author/SKILL.md`.

- **[LEARNINGS.md] `visual-rendering-bug` — Phaser Scale Manager parent measurement.** Phaser Scale Manager measures `parent.offsetWidth` / `parent.offsetHeight` to determine available canvas space. CSS `padding` on the parent element is NOT subtracted — `offsetWidth` includes padding in the box model, so a padded `body` still reports full viewport width to Phaser. The correct pattern for visual inset (breathing room, shadow clearance): (1) add `<div id="game-container">` to `index.html` with explicit CSS dimensions (`calc(100vw - Npx) × calc(100vh - Npx)`), (2) set `parent: 'game-container'` in `gameConfig`. This reliably constrains what Phaser measures without CSS model confusion. Reason: `visual-rendering-bug` in economy-polish (Phaser tween `props` block API) and viewport-scale (Scale Manager `offsetWidth` measurement). Second occurrence of the pattern: Phaser's internal rendering APIs diverge from web-standard CSS behavior in non-obvious ways, invisible to unit tests. Target: `~/dev/.docs/build-system/LEARNINGS.md`.
