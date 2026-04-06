# Phase: stage-one-completion

Status: shipped

## Stories

### US-45 — L6: Introduce the Cleaning Robot [Shipped]

As a player, I want to encounter the Cleaning Robot in Level 6, so that I learn it survives far more hits than a Dust Bunny and demands sustained firepower.

**Acceptance criteria:**
- Level 6 plays on the full 5-lane grid
- A pre-round enemy bio screen for the Cleaning Robot appears before Level 6 starts (reuses existing `enemyBio` mechanism from L5)
- Wave 1 contains only Dust Bunnies as a warmup; waves 2 onward introduce Cleaning Robots alongside Dust Bunnies
- Completing Level 6 triggers the Honey Bear unlock card (reuses existing `UNLOCK_MAP` + `GameOverScene` unlock card mechanism from L3)

**User guidance:**
- Discovery: Level 6 appears on the Level Select screen after completing Level 5
- Manual section: `docs/product/stage-one.md` (extend existing level table)
- Key steps: (1) Player clicks L6, sees Cleaning Robot bio ("slow but very tough — keep shooting!"). (2) Plays 4 waves, noticing Cleaning Robot tanks many hits. (3) Wins and sees Honey Bear unlock card.

**Design rationale:** Pure config additions — `ENEMY_TYPES.tough.bio` field and a new `LEVEL_6` entry. All display logic (bio overlay, unlock card) already exists from L5 and L3. No new scene code.

---

### US-46 — L7: Honey Bear practice level [Shipped]

As a player, I want to use the Honey Bear in Level 7 for the first time, so that I can experiment with slowing enemies before harder stages ahead.

**Acceptance criteria:**
- Level 7 plays on the full 5-lane grid with no new enemy type (Dust Bunny + Cleaning Robot only)
- Honey Bear is available in the player's loadout (unlocked after L6)
- Every wave includes at least one Cleaning Robot — no basic-only warmup wave (player has already seen both enemy types)
- Level is harder than L6 to create meaningful pressure that rewards honey pot placement

**User guidance:**
- Discovery: Level 7 appears on Level Select after completing Level 6; Honey Bear is available in the defender tray
- Manual section: `docs/product/stage-one.md` (extend existing level table)
- Key steps: (1) Player enters L7 with Honey Bear available. (2) Waves are dense with Cleaning Robots — place Honey Bear ahead of wallers to slow the advance. (3) No new intro needed; player explores the mechanic freely.

**Design rationale:** Mirrors the L4 pattern — a practice level where the just-unlocked defender is the intended tool. Withholding new enemies keeps the player's attention on the Honey Bear mechanic rather than split across two unfamiliar things.

---

### US-47 — L8: Introduce the Sock Puppet [Shipped]

As a player, I want to encounter the Sock Puppet in Level 8 with a pre-round explanation, so that I understand the jump mechanic before it catches me off guard.

**Acceptance criteria:**
- Level 8 plays on the full 5-lane grid
- A pre-round bio screen introduces the Sock Puppet before Level 8 starts; bio text explicitly states it jumps over the first toy it encounters
- Wave 1 contains no Sock Puppets (warmup with familiar enemies); waves 2 onward introduce Sock Puppets
- Completing Level 8 triggers the Marble Mine unlock card

**User guidance:**
- Discovery: Level 8 appears on Level Select after completing Level 7
- Manual section: `docs/product/stage-one.md` (extend existing level table)
- Key steps: (1) Player sees Sock Puppet bio — "Jumps over your first toy! Put shooters behind your walls." (2) Waves introduce jumpers that bypass front-line Block Towers. (3) Wins and sees Marble Mine unlock card.

**Design rationale:** The jump mechanic (via `jumpsRemaining` in `EnemyMovement.ts`) is the most mechanically surprising of all enemy behaviors. Pre-round bio upfront prevents frustration from unexplained defensive failure. Same mechanism as L5 (armored bio) — no new code.

---

### US-48 — L9: Marble Mine practice level [Shipped]

As a player, I want to use the Marble Mine in Level 9 against all enemy types, so that I can experience the single-use instant-kill mechanic in a full-roster challenge.

**Acceptance criteria:**
- Level 9 plays on the full 5-lane grid
- All four enemy types (Dust Bunny, Cleaning Robot, Armored Bunny, Sock Puppet) appear across the level's waves
- Marble Mine is available in the player's loadout (unlocked after L8)
- The loadout selection screen appears before L9 — the player now has 5 defenders (generator, shooter, wall, trapper, mine) and must choose 4

**User guidance:**
- Discovery: Level 9 appears on Level Select after completing Level 8; the loadout screen appears when launching L9 (5 defenders exceed the 4-max cap)
- Manual section: `docs/product/stage-one.md` (extend existing level table)
- Key steps: (1) Player is prompted to select 4 of 5 defenders — first loadout choice moment. (2) Plays L9 with full enemy roster; mine placement is genuinely impactful. (3) 5 waves provide the most complete challenge in stage one.

**Design rationale:** L9 mirrors L4 and L7 (practice-level pattern) with the added twist of the first loadout screen appearing naturally. Full enemy roster ensures the mine's instant-kill is meaningful rather than trivial overkill.

---

### US-49 — GitHub Pages deployment [Shipped]

As a player (and Jaco), I want the game to be accessible at a public URL, so that I can share it with family without needing a local dev server.

**Acceptance criteria:**
- A GitHub Actions workflow deploys the game to GitHub Pages on every push to `main`
- The workflow only deploys if the build step succeeds — a failing build blocks deployment
- No game logic or asset changes required — deployment is infrastructure only

**User guidance:**
- Discovery: After the workflow runs, the game is available at the Jaxsbr/zombo GitHub Pages URL; operator must enable GitHub Pages in repo settings (Source: `gh-pages` branch, `/ (root)`) on first deploy
- Manual section: N/A — infrastructure change
- Key steps: (1) Push to main triggers the workflow. (2) Workflow builds and deploys dist/. (3) Game is live at the public URL.

**Design rationale:** Vite's `base: './'` already generates relative asset paths, which resolve correctly when GitHub Pages serves the project at a subdirectory path (`/zombo/`). No `vite.config.ts` changes required.

---

## Done-when (observable)

### US-45 — L6: Introduce the Cleaning Robot
- [x] `ENEMY_TYPES.tough` in `src/config/enemies.ts` has a non-empty `bio` string field (kid-friendly description mentioning the Cleaning Robot is slow but very tough) [US-45]
- [x] `LEVEL_6` in `src/config/levels.ts` has no `activeLanes` override (all 5 lanes), `enemyBio: { enemyKey: 'tough' }`, `startingBalance >= 450`, and >= 4 waves [US-45]
- [x] L6 wave 1 spawns are all `ENEMY_TYPES.basic`; each of waves 2+ contains at least one `ENEMY_TYPES.tough` spawn [US-45]
- [x] `LEVEL_6` is included in `ALL_LEVELS` (array length becomes 6) [US-45]
- [x] `UNLOCK_MAP` in `src/systems/DefenderUnlocks.ts` contains entry `6: 'trapper'` [US-45]
- [x] Unit test: `getUnlockedDefenders` called with completed levels [1,2,3,4,5,6] returns array containing `'trapper'`; called with [1,2,3,4,5] it does not [US-45]
- [x] `LoadoutSelection.test.ts` test "trapper and mine are not in initial defenders or unlock map" is renamed/updated to reflect they are now in `UNLOCK_MAP` at L6 and L8 — the updated test verifies completing only L1–L5 (indices 0–4) still does not yield trapper or mine [US-45]
- [x] `npm test` passes [US-45]

### US-46 — L7: Honey Bear practice level
- [x] `LEVEL_7` in `src/config/levels.ts` has no `activeLanes` override, no `enemyBio`, `startingBalance >= 500`, and >= 4 waves [US-46]
- [x] Every wave in L7 contains at least one `ENEMY_TYPES.tough` spawn [US-46]
- [x] `LEVEL_7` is included in `ALL_LEVELS` (array length becomes 7) [US-46]
- [x] `npm test` passes [US-46]

### US-47 — L8: Introduce the Sock Puppet
- [x] `ENEMY_TYPES.jumper` in `src/config/enemies.ts` has a non-empty `bio` string field that explicitly states the Sock Puppet jumps over the first toy/defender it encounters [US-47]
- [x] `LEVEL_8` in `src/config/levels.ts` has no `activeLanes` override, `enemyBio: { enemyKey: 'jumper' }`, `startingBalance >= 550`, and >= 4 waves [US-47]
- [x] L8 wave 1 contains no `ENEMY_TYPES.jumper` spawns; each of waves 2+ contains at least one `ENEMY_TYPES.jumper` spawn [US-47]
- [x] `LEVEL_8` is included in `ALL_LEVELS` (array length becomes 8) [US-47]
- [x] `UNLOCK_MAP` in `src/systems/DefenderUnlocks.ts` contains entry `8: 'mine'` [US-47]
- [x] Unit test: `getUnlockedDefenders` called with completed levels [1,2,3,4,5,6,7,8] returns array containing `'mine'`; called with [1,2,3,4,5,6,7] it does not [US-47]
- [x] `npm test` passes [US-47]

### US-48 — L9: Marble Mine practice level
- [x] `LEVEL_9` in `src/config/levels.ts` has no `activeLanes` override, no `enemyBio`, `startingBalance >= 600`, and >= 5 waves [US-48]
- [x] L9 waves collectively include at least one spawn each of `ENEMY_TYPES.basic`, `ENEMY_TYPES.tough`, `ENEMY_TYPES.armored`, and `ENEMY_TYPES.jumper` [US-48]
- [x] `LEVEL_9` is included in `ALL_LEVELS` (array length becomes 9) [US-48]
- [x] `needsLoadoutSelection(getUnlockedDefenders([1,2,3,4,5,6,7,8]))` returns `true` — 5 unlocked defenders exceeds `MAX_LOADOUT=4`, triggering the loadout selection screen before L9 [US-48]
- [x] `npm test` passes [US-48]

### US-49 — GitHub Pages deployment
- [x] `.github/workflows/deploy.yml` exists with a workflow job triggered on `push` to `main` [US-49]
- [x] Workflow steps include: `actions/checkout`, Node.js setup, `npm ci`, `npm run build`, and deployment of `dist/` to the `gh-pages` branch [US-49]
- [x] `vite.config.ts` retains `base: './'` (relative paths compatible with GitHub Pages subdirectory hosting) [US-49]
- [x] `npm run build` completes without TypeScript errors and produces `dist/index.html` [US-49]

### Structural
- [x] `docs/product/stage-one.md` level table extended with rows for L6 (Cleaning Robot intro, Honey Bear unlock reward), L7 (Honey Bear practice), L8 (Sock Puppet intro, Marble Mine unlock reward), and L9 (Marble Mine practice) [phase]
- [x] `AGENTS.md` updated to reflect: `ALL_LEVELS` length 9, `UNLOCK_MAP` entries L6→trapper and L8→mine, level progression description extended to L1–L9 [phase]

## AGENTS.md sections affected
- Level progression description (extends L1–L9)
- Defender unlocks (UNLOCK_MAP: add L6→trapper, L8→mine)
- `src/config/levels.ts` directory entry (LEVEL_6–LEVEL_9, ALL_LEVELS length 9)

## User documentation
- `docs/product/stage-one.md` — extend level table with L6–L9 rows

## Golden principles (phase-relevant)
- Config-driven entities — new levels are pure `LevelConfig` additions; bio text added to `EnemyType.bio` fields; no new Phaser scene code required
- Game logic separated from Phaser rendering — `DefenderUnlocks.ts` changes are pure TS and covered by existing test suite
- agents-consistency — AGENTS.md and stage-one.md updated to reflect shipped level progression and unlock schedule
