## Phase goal

Extend the guided progression from 5 to 9 levels by adding L6–L9 as pure config additions, and deploy the game to GitHub Pages. L6 introduces the Cleaning Robot enemy with a pre-round bio screen and unlocks the Honey Bear on completion. L7 is a Honey Bear practice level. L8 introduces the Sock Puppet with a bio screen and unlocks the Marble Mine. L9 is a Marble Mine practice level featuring the full enemy roster and the first loadout selection moment. A GitHub Actions workflow deploys `dist/` to the `gh-pages` branch on every push to `main`.

### Stories in scope
- US-45 — L6: Introduce the Cleaning Robot
- US-46 — L7: Honey Bear practice level
- US-47 — L8: Introduce the Sock Puppet
- US-48 — L9: Marble Mine practice level
- US-49 — GitHub Pages deployment

### Done-when (observable)

#### US-45 — L6: Introduce the Cleaning Robot
- [ ] `ENEMY_TYPES.tough` in `src/config/enemies.ts` has a non-empty `bio` string field (kid-friendly description mentioning the Cleaning Robot is slow but very tough) [US-45]
- [ ] `LEVEL_6` in `src/config/levels.ts` has no `activeLanes` override (all 5 lanes), `enemyBio: { enemyKey: 'tough' }`, `startingBalance >= 450`, and >= 4 waves [US-45]
- [ ] L6 wave 1 spawns are all `ENEMY_TYPES.basic`; each of waves 2+ contains at least one `ENEMY_TYPES.tough` spawn [US-45]
- [ ] `LEVEL_6` is included in `ALL_LEVELS` (array length becomes 6) [US-45]
- [ ] `UNLOCK_MAP` in `src/systems/DefenderUnlocks.ts` contains entry `6: 'trapper'` [US-45]
- [ ] Unit test: `getUnlockedDefenders` called with completed levels [1,2,3,4,5,6] returns array containing `'trapper'`; called with [1,2,3,4,5] it does not [US-45]
- [ ] `LoadoutSelection.test.ts` test "trapper and mine are not in initial defenders or unlock map" is renamed/updated to reflect they are now in `UNLOCK_MAP` at L6 and L8 — the updated test verifies completing only L1–L5 (indices 0–4) still does not yield trapper or mine [US-45]
- [ ] `npm test` passes [US-45]

#### US-46 — L7: Honey Bear practice level
- [ ] `LEVEL_7` in `src/config/levels.ts` has no `activeLanes` override, no `enemyBio`, `startingBalance >= 500`, and >= 4 waves [US-46]
- [ ] Every wave in L7 contains at least one `ENEMY_TYPES.tough` spawn [US-46]
- [ ] `LEVEL_7` is included in `ALL_LEVELS` (array length becomes 7) [US-46]
- [ ] `npm test` passes [US-46]

#### US-47 — L8: Introduce the Sock Puppet
- [ ] `ENEMY_TYPES.jumper` in `src/config/enemies.ts` has a non-empty `bio` string field that explicitly states the Sock Puppet jumps over the first toy/defender it encounters [US-47]
- [ ] `LEVEL_8` in `src/config/levels.ts` has no `activeLanes` override, `enemyBio: { enemyKey: 'jumper' }`, `startingBalance >= 550`, and >= 4 waves [US-47]
- [ ] L8 wave 1 contains no `ENEMY_TYPES.jumper` spawns; each of waves 2+ contains at least one `ENEMY_TYPES.jumper` spawn [US-47]
- [ ] `LEVEL_8` is included in `ALL_LEVELS` (array length becomes 8) [US-47]
- [ ] `UNLOCK_MAP` in `src/systems/DefenderUnlocks.ts` contains entry `8: 'mine'` [US-47]
- [ ] Unit test: `getUnlockedDefenders` called with completed levels [1,2,3,4,5,6,7,8] returns array containing `'mine'`; called with [1,2,3,4,5,6,7] it does not [US-47]
- [ ] `npm test` passes [US-47]

#### US-48 — L9: Marble Mine practice level
- [ ] `LEVEL_9` in `src/config/levels.ts` has no `activeLanes` override, no `enemyBio`, `startingBalance >= 600`, and >= 5 waves [US-48]
- [ ] L9 waves collectively include at least one spawn each of `ENEMY_TYPES.basic`, `ENEMY_TYPES.tough`, `ENEMY_TYPES.armored`, and `ENEMY_TYPES.jumper` [US-48]
- [ ] `LEVEL_9` is included in `ALL_LEVELS` (array length becomes 9) [US-48]
- [ ] `needsLoadoutSelection(getUnlockedDefenders([1,2,3,4,5,6,7,8]))` returns `true` — 5 unlocked defenders exceeds `MAX_LOADOUT=4`, triggering the loadout selection screen before L9 [US-48]
- [ ] `npm test` passes [US-48]

#### US-49 — GitHub Pages deployment
- [ ] `.github/workflows/deploy.yml` exists with a workflow job triggered on `push` to `main` [US-49]
- [ ] Workflow steps include: `actions/checkout`, Node.js setup, `npm ci`, `npm run build`, and deployment of `dist/` to the `gh-pages` branch [US-49]
- [ ] `vite.config.ts` retains `base: './'` (relative paths compatible with GitHub Pages subdirectory hosting) [US-49]
- [ ] `npm run build` completes without TypeScript errors and produces `dist/index.html` [US-49]

#### Structural
- [ ] `docs/product/stage-one.md` level table extended with rows for L6 (Cleaning Robot intro, Honey Bear unlock reward), L7 (Honey Bear practice), L8 (Sock Puppet intro, Marble Mine unlock reward), and L9 (Marble Mine practice) [phase]
- [ ] `AGENTS.md` updated to reflect: `ALL_LEVELS` length 9, `UNLOCK_MAP` entries L6→trapper and L8→mine, level progression description extended to L1–L9 [phase]

### Golden principles (phase-relevant)
- Config-driven entities — new levels are pure `LevelConfig` additions; bio text added to `EnemyType.bio` fields; no new Phaser scene code required
- Game logic separated from Phaser rendering — `DefenderUnlocks.ts` changes are pure TS and covered by existing test suite
- agents-consistency — AGENTS.md and stage-one.md updated to reflect shipped level progression and unlock schedule
