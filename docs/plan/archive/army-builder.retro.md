## Phase retrospective — army-builder

**Metrics:** 16 build tasks + 3 review tasks = 19 total. 9 investigate, 5 implement, 2 phase (AGENTS.md + completion gate), 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 56%. Health: **Healthy**.

**Review:** 3 review tasks (PR creation, review-pr, handle-pr-review), all pass. 0 critical, 2 concerns, 3 nits from automated review. 2 fixed (movement animations, spec status), 1 challenged (mineTriggerCheck coupling — intentional separation of concerns), 2 skipped (minor nits).

**Build-log failure classes:**
- (none — 0 failures, 0 rework)

**Review-sourced failure classes:**
- `spec-ambiguity` — **repeat pattern** (1 concern: EnemyEntity.startMovementAnimation had no cases for `armored` or `jumper` — new enemy types slid across the grid without movement animations). Spec listed specific differentiating criteria (helmet degradation, jump arc tween) but didn't include the baseline movement animation requirement that all existing enemy types share. New facet: "inherited behavior requirements for new entity types". Previously seen in game-research (1st), game-feel (2nd, with post-review playtest feedback), game-juice (3rd, page-level context). This is the 4th occurrence in zombo.
- `edit-policy-drift` — **repeat pattern** (1 nit: spec-author wrote "planned for army-builder phase" section in ARCHITECTURE.md with speculative content; phase spec status field said "Draft" after phase completion). Previously seen in playable (1st), game-feel (2nd), game-juice (3rd, escalated). This is the 4th occurrence in zombo. LEARNINGS.md #48, #54, #55 document the root cause and recommend a spec-author command update that has never been enforced. The spec-author command (line 290) still explicitly instructs writing "(planned for `<phase>` phase)" annotations.

**Previous retro patterns checked:**
- `spec-ambiguity`: 4th occurrence in zombo. Previous fixes: LEARNINGS #2 (design rationale), #4 (investigate-first), game-juice retro (user-experience boundary check). None address inherited behavior requirements — the gap is that spec-author focuses on what's *new* about a type but omits *shared* behaviors the type should inherit from its class.
- `edit-policy-drift`: 4th occurrence in zombo. Previous fix recommendation (LEARNINGS #55, game-juice retro escalation): update spec-author to stop writing forward-looking ARCHITECTURE.md sections. **Never enforced** — spec-author command line 290 still says `New modules with "(planned for <phase> phase)" annotation`.
- `schema-code-drift` (first-seen in playable) — not triggered.
- `missing-error-path` (first-seen in game-feel) — not triggered.

**Compounding fixes proposed:**
- [spec-author gate] **spec-ambiguity #58:** When spec-author defines new entity types (defenders, enemies, or any class with existing instances), add a "class baseline check" — enumerate ALL shared behaviors of the existing entity class and include them as done-when criteria for each new type. Example: all existing enemies have movement animations, so a new enemy type spec must include "has distinct movement animation" alongside its unique criteria. Reason: `spec-ambiguity` in army-builder (missing armored/jumper movement animations) and game-feel (enemies walked through non-wall defenders — spec focused on new behavior, missed inherited behavior).
- [spec-author gate] **edit-policy-drift #55 enforcement:** In `~/dev/.claude/commands/spec-author.md` Step 4, replace the instruction to write "planned" annotations to ARCHITECTURE.md with a prohibition. Architecture docs describe shipped state only. Planned architecture notes belong in the per-phase spec file (`docs/product/phases/<phase>.md`) which spec-author already writes. Reason: `edit-policy-drift` in playable (1st), game-feel (2nd), game-juice (3rd), army-builder (4th). Same root cause, same recommended fix, never enforced. Also update `~/dev/.cursor/skills/spec-author/SKILL.md` to match.
