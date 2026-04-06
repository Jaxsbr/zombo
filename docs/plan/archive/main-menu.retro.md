## Phase retrospective — main-menu

**Metrics:** 7 tasks, 1 investigate, 5 implement/docs, 1 gate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 14%. Health: **Warning** (investigate ratio below 40% — branch A dominant; investigation was scoped to a single upfront task before 5 consecutive implementation tasks).

**Build-log failure classes:**
- (none — 0 failures in build log)

**Review-sourced failure classes:**
- `silent-test-pass` — **first-seen** (2 Critical findings: ToysScene name text 9px [US-54] and EnemiesScene name text 10px [US-55] both violated done-when criterion `name ≥ 18px monospace`. Both were fixed during handle-pr-review. Root cause: Vitest/node tests cannot verify Phaser text properties; the completion gate verified scene *structure* but not rendered text sizes from source code. The `npm test` step is silent on font size — it passes regardless of what value is set.)

**Post-PR user-testing failure classes (not in build log):**
- `visual-rendering-bug` — **3rd occurrence** (DRAW_DEFENDER and DRAW_ENEMY called as `DRAW_DEFENDER(gfx, key, x, y, scale)` — crashed with `TypeError: DRAW_DEFENDER is not a function`. Both are `Record<string, (g: Graphics) => void>` and must be used as `const fn = DRAW_ENTITY[key]; if (fn) fn(gfx)` inside a positioned Phaser container. TypeScript doesn't catch this at compile time because the Record index signature doesn't prevent callable syntax being attempted. First occurrence: economy-polish (Phaser tween `props` block API). Second occurrence: viewport-scale (Scale Manager `offsetWidth` measurement). LEARNINGS #62 (viewport-scale compounding fix) addressed Phaser framework-level APIs; project-level entity draw API contract was not covered. Fix proposed.)
- `module-init-order` — **first-seen** (new class). ToysScene and EnemiesScene used GAME_WIDTH from `../config/game` to compute module-level constants (`CARD_CX = GAME_WIDTH / 2`). But `game.ts` imports those very scene files, creating a circular dependency. When Vite resolves the module graph, GAME_WIDTH is not yet initialized when the scene module's top-level code runs — TDZ error at runtime. Fix: hardcode the derived values (288, 158) or compute inside `create()`. Not compoundable yet — first-seen.
- `spec-ambiguity` — **7th occurrence, new facet** (grid card layout met all done-when criteria — cards drawn, font sizes specified per card, silhouettes shown — but at 576px canvas width with 5 defender cards the layout was visually unusable: text clipped, overlapping, blurred at scale. Operator requested a carousel redesign. The spec specified per-card properties but not layout viability for N items at actual canvas width. Previously compounded: game-juice (#1, user-experience boundary), army-builder (#2, inherited behaviors), economy-polish (#3, design-direction traceability), viewport-scale (#4, visual verification outcomes). This is a new facet: card-grid layout capacity at fixed canvas size. Fix proposed.)

**Previous retro patterns checked:**
- `silent-test-pass` — first-seen. No prior occurrences across all zombo retros.
- `visual-rendering-bug` (economy-polish first, viewport-scale second — compounded LEARNINGS #62) — **triggered again (3rd)**. The LEARNINGS #62 entry covers Phaser framework API divergence from web standards (Scale Manager, tweens). The DRAW_DEFENDER/DRAW_ENEMY issue is a project-level entity API contract — a distinct and unaddressed sub-pattern.
- `spec-ambiguity` (6x prior: game-research, game-juice, game-feel, army-builder, economy-polish, viewport-scale — multiple prior compounds) — **triggered again (7th)**. New facet: layout capacity for card grids at fixed canvas dimensions.
- `module-init-order` — new class. First occurrence. No prior retros contain this class.
- `edit-policy-drift` — not triggered. Phase Reconciliation updated AGENTS.md and ARCHITECTURE.md for the new scene set.
- `missing-error-path` — not triggered. No re-entrancy issues in this phase.
- `cross-cutting-break` — not triggered. No regressions in existing scenes.

**Compounding fixes proposed:**

- [LEARNINGS.md #67] `visual-rendering-bug` — entity draw API contract (project-level). `DRAW_DEFENDER` and `DRAW_ENEMY` are `Record<string, (g: Phaser.GameObjects.Graphics) => void>`. They are NOT callable functions. The correct pattern: (1) create a Phaser container at the target position with `this.add.container(cx, cy)`; (2) create a graphics object with `this.add.graphics()`; (3) look up and call the draw function: `const fn = DRAW_ENTITY[key]; if (fn) fn(gfx)`; (4) add graphics to container: `container.add(gfx)`; (5) set scale on container: `container.setScale(N)`. TypeScript does not prevent calling a Record entry as a top-level function — the error is runtime-only. Reason: `visual-rendering-bug` 3rd occurrence. LEARNINGS #62 addressed Phaser framework APIs; this entry addresses the zombo project-level entity draw API contract specifically.

- [LEARNINGS.md #68] `spec-ambiguity` — card-grid layout capacity at fixed canvas width. When a scene renders N entity cards in a grid, the spec must verify that N × min_card_width + (N-1) × gap ≤ GAME_WIDTH. If this inequality cannot be satisfied with readable text sizes, the spec must mandate a scalable layout (carousel, pagination, scroll) and include done-when criteria verifying the layout accommodates a plausible future N (e.g., "layout remains usable if 2 items are added"). This is the 7th occurrence of `spec-ambiguity` in zombo; this facet is specific to fixed-canvas Phaser games where CSS responsive layout is not available. The existing LEARNINGS entries (#59 inherited behaviors, #61 design-direction traceability) do not cover layout capacity.
