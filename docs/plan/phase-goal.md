## Phase goal

Replace TitleScene with a proper main menu (MainMenuScene) that serves as the game's single entry point. Players can navigate to play/continue, browse a Toys discovery sub-scene, browse an Enemies discovery sub-scene, and toggle sound — all in the bedroom toy-box aesthetic. The Play/Continue button is context-aware: it shows "Continue" and pre-selects the next unbeaten level when the player has prior progress. Toys and Enemies sub-scenes use silhouette cards for locked/undiscovered entries, rewarding progression with revealed info.

### Stories in scope
- US-52 — Main menu scene
- US-53 — Play/Continue flow
- US-54 — Toys discovery sub-scene
- US-55 — Enemies discovery sub-scene

### Done-when (observable)

#### US-52 — Main menu scene
- [x] `src/scenes/MainMenuScene.ts` exists and extends `Phaser.Scene` with key `'MainMenuScene'` [US-52]
- [x] `src/main.ts` lists `MainMenuScene` as the first scene in the Phaser config scene array [US-52]
- [x] `src/main.ts` also registers `ToysScene` and `EnemiesScene` in the scene array [US-52]
- [x] `TitleScene` is removed from `src/main.ts` scene array (MainMenuScene is the replacement) [US-52]
- [x] MainMenuScene renders title "Toy Box Siege" (≥ 32px, amber `#ffc107`, monospace) and subtitle text [US-52]
- [x] MainMenuScene renders a Play/Continue button, a Toys button, an Enemies button, and a Sound toggle — all positioned per the menu layout plan (Play/Continue at y ≈ 165, Toys at y ≈ 225, Enemies at y ≈ 273, Sound at y ≈ 335, all centered) [US-52]
- [x] All interactive elements have hit area ≥ 48×48px [US-52]
- [x] MainMenuScene background uses `#5d4037` fill with floor-board lines and atmospheric decorations matching existing TitleScene visuals [US-52]
- [x] Sound toggle reads `isSfxMuted()` on scene create and displays `SFX ✓` (unmuted) or `SFX ✗` (muted) accordingly [US-52]
- [x] Clicking Sound toggle calls `setMuted(!isSfxMuted())` and updates toggle label in place [US-52]
- [x] HUD mute button in GameScene still functions independently (clicking it updates the same SFX module mute state) [US-52]
- [x] `npm test` passes after TitleScene removal and MainMenuScene addition [US-52]

#### US-53 — Play/Continue flow
- [ ] `LevelProgress.ts` exports `nextUnbeatenLevel(data: ProgressData): number` [US-53]
- [ ] `nextUnbeatenLevel` returns the index of the first level with state `'unlocked'`; returns `TOTAL_LEVELS - 1` if no level is `'unlocked'` (all completed) [US-53]
- [ ] `LevelProgress.test.ts` covers `nextUnbeatenLevel` with: no completions → returns 0; levels 0–3 completed → returns 4; all 9 completed → returns 8 [US-53]
- [ ] MainMenuScene calls `loadProgress()` on `create()` and renders button label `"Play"` when no levels have state `'completed'` [US-53]
- [ ] MainMenuScene renders button label `"Continue"` when `loadProgress()` returns at least one level with state `'completed'` [US-53]
- [ ] Clicking Play button calls `this.scene.start('LevelSelectScene')` with no init data [US-53]
- [ ] Clicking Continue button calls `this.scene.start('LevelSelectScene', { selectedLevel: nextUnbeatenLevel(progress) })` [US-53]
- [ ] `LevelSelectScene.create()` reads `(this.scene.settings.data as { selectedLevel?: number }).selectedLevel` and visually highlights that level's button when the value is provided [US-53]

#### US-54 — Toys discovery sub-scene
- [x] `src/scenes/ToysScene.ts` exists and extends `Phaser.Scene` with key `'ToysScene'` [US-54]
- [x] Clicking Toys button in MainMenuScene calls `this.scene.start('ToysScene')` [US-54]
- [x] ToysScene renders a card for each of the 5 defender types in `DEFENDER_TYPES` [US-54]
- [x] Generator and shooter cards always render full card: DRAW_DEFENDER visual at scale ≥ 1.5, name ≥ 18px monospace, spark cost, bio text [US-54]
- [x] Wall card renders full card when `'wall'` is in `loadUnlocks()` result; renders silhouette + `"???"` label when not [US-54]
- [x] Trapper card renders full card when `'trapper'` is in `loadUnlocks()` result; renders silhouette + `"???"` when not [US-54]
- [x] Mine card renders full card when `'mine'` is in `loadUnlocks()` result; renders silhouette + `"???"` when not [US-54]
- [x] Silhouette cards use darkened fill (alpha ≤ 0.3) at same bounding dimensions as full card — no pointer cursor, no click response [US-54]
- [x] `DEFENDER_TYPES` in `src/config/defenders.ts` has non-empty `bio` string for all 5 entries (trapper and mine bios added in this phase; others verified present) [US-54]
- [x] Bio text for each defender is 1–2 sentences, kid-friendly voice, ≤ 25 words per sentence [US-54]
- [x] Back button at top-left of ToysScene, hit area ≥ 48×48px, calls `this.scene.start('MainMenuScene')` on click [US-54]
- [x] ToysScene assigns no depth values outside the existing depth layer map [US-54]
- [x] Silhouette cards read as "locked — not yet unlocked," not as a broken or missing asset (aspirational — visual verification required) [US-54]

#### US-55 — Enemies discovery sub-scene
- [x] `src/scenes/EnemiesScene.ts` exists and extends `Phaser.Scene` with key `'EnemiesScene'` [US-55]
- [x] Clicking Enemies button in MainMenuScene calls `this.scene.start('EnemiesScene')` [US-55]
- [x] EnemiesScene renders a card for each of the 4 enemy types in `ENEMY_TYPES` [US-55]
- [x] Dust Bunny card always renders full card: DRAW_ENEMY visual at scale ≥ 1.5, name ≥ 18px monospace, bio text [US-55]
- [x] Cleaning Robot card renders full card when `localStorage.getItem('bio_shown_enemy_<cleaningRobotKey>')` is set; renders silhouette + `"???"` when not [US-55]
- [x] Armored Bunny card renders full card when `localStorage.getItem('bio_shown_enemy_<armoredKey>')` is set; renders silhouette + `"???"` when not [US-55]
- [x] Sock Puppet card renders full card when `localStorage.getItem('bio_shown_enemy_<sockPuppetKey>')` is set; renders silhouette + `"???"` when not [US-55]
- [x] Silhouette cards use darkened fill (alpha ≤ 0.3), no pointer cursor, no click response [US-55]
- [x] `ENEMY_TYPES` in `src/config/enemies.ts` has non-empty `bio` string for all 4 entries (cleaning_robot, armored_bunny, sock_puppet verified present; dust_bunny bio added in this phase) [US-55]
- [x] Bio text for each enemy is 1–2 sentences, kid-friendly voice, ≤ 25 words per sentence [US-55]
- [x] Back button at top-left of EnemiesScene, hit area ≥ 48×48px, calls `this.scene.start('MainMenuScene')` on click [US-55]
- [x] EnemiesScene assigns no depth values outside the existing depth layer map [US-55]
- [x] Silhouette cards read as "not yet encountered" — dark shape communicates mystery, not brokenness (aspirational — visual verification required) [US-55]

#### Structural
- [ ] AGENTS.md scene list updated: `MainMenuScene.ts`, `ToysScene.ts`, `EnemiesScene.ts` added; `TitleScene.ts` removed [phase]
- [ ] AGENTS.md notes MainMenuScene as the initial scene (replaces TitleScene) [phase]
- [ ] AGENTS.md notes `nextUnbeatenLevel` export in `LevelProgress.ts` [phase]

### Golden principles (phase-relevant)
- Game logic separated from Phaser rendering — `nextUnbeatenLevel` is pure TS in `LevelProgress.ts`, testable in Vitest node environment
- Config-driven entities — bio text on `DefenderType` and `EnemyType` interfaces, discovery state read from existing localStorage keys
- agents-consistency — AGENTS.md updated to reflect scene changes and new export
- no-silent-pass — `nextUnbeatenLevel` covered by unit tests with distinct cases
