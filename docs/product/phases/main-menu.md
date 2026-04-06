# Phase: main-menu

Status: draft

## Design direction

Extend existing bedroom toy-box palette: warm brown (`#5d4037`) scene background, cream fills for cards and buttons, monospace font throughout, atmospheric decorations (floor-board lines, furniture silhouettes, scattered toy shapes) matching existing TitleScene. Menu nav items styled as rounded-rect buttons with `#5d4037` fill and `#ffc107` amber border — same as existing Play button. Sound toggle is an inline text toggle (`SFX ✓` / `SFX ✗`) consistent with the HUD mute button style.

## Menu layout plan (576 × 400 logical resolution)

```
y=70   "Toy Box Siege"           title text, center, 42px amber
y=105  "Defend your fort..."     subtitle, center, 16px
y=165  [   Play / Continue  ]    primary button, center, 160×44px
y=225  [        Toys        ]    nav button, center, 160×44px
y=273  [      Enemies       ]    nav button, center, 160×44px
y=335  SFX ✓ / SFX ✗            inline toggle, center, 16px
```

Vertical gap between each button ≥ 12px. All interactive hit areas ≥ 48×48px. Play/Continue is the largest button (taller) to emphasize it as the primary action.

## Stories

### US-52 — Main menu scene

As a player, I want to land on a proper main menu when I open the game, so that I can navigate to play, browse toys and enemies, or toggle sound from one place.

**Acceptance criteria:**
- `MainMenuScene` replaces `TitleScene` as the initial Phaser scene
- Menu renders: title text, subtitle, Play/Continue button, Toys button, Enemies button, Sound toggle
- Bedroom atmosphere (background, decorations) matches existing TitleScene visual
- Sound toggle calls `setMuted(!isSfxMuted())` and updates its own label on click — same effect as HUD mute button
- HUD mute button in GameScene continues to work independently

**Interaction model:** Same simple click pattern as TitleScene's Play button. Each nav item responds to `pointerdown`. Sound toggle is not a sub-scene — it toggles inline and updates its label. Toys and Enemies navigate to sub-scenes. No hover animations required (existing game has none).

**User guidance:**
- Discovery: Player lands on MainMenuScene on every game open (replaces TitleScene)
- Manual section: N/A — entry point is self-evident
- Key steps: 1. Open game — see main menu. 2. Click a button to navigate. 3. Click Sound toggle to mute/unmute.

**Design rationale:** A single entry scene with explicit nav replaces the one-button TitleScene. Keeping bedroom aesthetics and the same button style avoids a jarring visual break — it reads as "the game got a menu", not "a different game".

---

### US-53 — Play/Continue flow

As a returning player, I want the menu to show "Continue" instead of "Play" so the game remembers where I left off and I don't have to find my level again.

**Acceptance criteria:**
- When no levels are `'completed'` in `zombo_progress`, Play/Continue button shows label "Play"
- When at least one level is `'completed'`, Play/Continue button shows label "Continue"
- Clicking "Play" navigates to `LevelSelectScene` (same as current TitleScene behavior)
- Clicking "Continue" navigates to `LevelSelectScene` with `{ selectedLevel: N }` scene init data, where N is the index returned by `nextUnbeatenLevel(progress)`
- `LevelProgress.ts` exports `nextUnbeatenLevel(data: ProgressData): number` — returns first index with state `'unlocked'`; if all levels completed, returns `TOTAL_LEVELS - 1`
- `LevelSelectScene` reads `selectedLevel` from scene init data on `create()` and visually highlights that level's button as pre-selected
- `LevelProgress.test.ts` covers `nextUnbeatenLevel` with: no completions (returns 0), partial completions (returns correct next index), all completed (returns last index)

**Interaction model:** Same click → scene transition pattern as TitleScene. No animation differences between Play and Continue — only the label changes. LevelSelectScene already handles display; pre-selection is a data hint, not a new interaction mode.

**User guidance:**
- Discovery: Label changes automatically based on save state — returning player sees "Continue" without any setup
- Manual section: N/A — implicit behavior
- Key steps: 1. Open game after beating at least one level. 2. See "Continue" button. 3. Click — land on level select with next level highlighted.

**Design rationale:** Returning players shouldn't hunt for their level. Pre-selecting in LevelSelectScene preserves loadout selection and enemy bio overlay logic (those flows stay in LevelSelectScene unchanged). Continue doesn't bypass LevelSelectScene — it reduces the "where was I?" friction.

---

### US-54 — Toys discovery sub-scene

As a player, I want to browse all toys in a dedicated screen, so that I can remember costs and abilities — and feel the reward of unlocking new ones as silhouettes fill in.

**Acceptance criteria:**
- `ToysScene` is a Phaser scene (key `'ToysScene'`) registered in `src/main.ts`
- Clicking Toys button in MainMenuScene navigates to ToysScene
- ToysScene lists all 5 defender types: generator, shooter, wall, trapper, mine
- Generator and shooter always render as full cards (always-unlocked starting defenders)
- Wall, trapper, mine: if key IS in `zombo_unlocks` localStorage — full card; if NOT — silhouette card
- Full card displays: DRAW_DEFENDER visual at scale ≥ 1.5 (top of card), name (≥ 18px monospace), spark cost, bio text (1–2 sentences, ≤ 25 words each)
- Silhouette card displays: darkened/greyed shape at same bounding dimensions, "???" label where name would appear, cost and bio are hidden
- Silhouette cards are not interactive (no pointer cursor, no click response)
- `DEFENDER_TYPES` in `src/config/defenders.ts` has `bio: string` populated for all 5 defender types (wall bio exists from guided-intro; trapper and mine bio added in this phase)
- Back button at top-left, hit area ≥ 48×48px, navigates to MainMenuScene on click
- ToysScene uses depth values consistent with existing depth layer map (no new depth layers introduced)

**Interaction model:** Browse-only. No selection, no placement preview. Cards are static display items — full card reads info, silhouette card communicates "not yet." Back button is the only action. Same simple click pattern as existing overlay dismissal buttons.

**User guidance:**
- Discovery: "Toys" button on main menu
- Manual section: N/A — in-game encyclopedia
- Key steps: 1. Click Toys on main menu. 2. Browse defender cards. 3. Silhouettes show locked toys. 4. Click Back to return.

**Design rationale:** Sub-scene (not overlay) chosen to prepare for a growing roster — future phases can add more defenders without redesigning a constrained overlay. Silhouettes create collection incentive: unlocking a defender feels more rewarding when you've seen the placeholder first.

---

### US-55 — Enemies discovery sub-scene

As a player, I want to look up enemy behaviors and bios in one place, so that I can reference what I know before a level and feel the discovery when new enemies appear.

**Acceptance criteria:**
- `EnemiesScene` is a Phaser scene (key `'EnemiesScene'`) registered in `src/main.ts`
- Clicking Enemies button in MainMenuScene navigates to EnemiesScene
- EnemiesScene lists all 4 enemy types: dust_bunny, cleaning_robot, armored_bunny, sock_puppet
- Dust Bunny always renders as a full card (pre-discovered — no bio pop-over exists for it)
- Cleaning Robot, Armored Bunny, Sock Puppet: if `bio_shown_enemy_<key>` IS set in localStorage — full card; if NOT — silhouette card
- Full card displays: DRAW_ENEMY visual at scale ≥ 1.5 (top of card), enemy name (≥ 18px monospace), bio text (1–2 sentences, ≤ 25 words each)
- Silhouette card displays: darkened shape at same bounding dimensions, "???" label, bio hidden
- Silhouette cards are not interactive (no pointer cursor, no click response)
- `ENEMY_TYPES` in `src/config/enemies.ts` has `bio: string` populated for all 4 enemy types (cleaning_robot, armored_bunny, sock_puppet bios exist from guided-intro; dust_bunny bio added in this phase)
- Back button at top-left, hit area ≥ 48×48px, navigates to MainMenuScene on click
- EnemiesScene uses depth values consistent with existing depth layer map (no new depth layers)

**Interaction model:** Same browse-only pattern as ToysScene — no interaction on cards, back button to return. Silhouettes communicate "encounter this enemy to unlock its entry." Same card visual pattern (warm brown border, cream fill) as existing bio overlay cards.

**User guidance:**
- Discovery: "Enemies" button on main menu
- Manual section: N/A — in-game encyclopedia
- Key steps: 1. Click Enemies on main menu. 2. See known enemy entries + silhouettes for unknowns. 3. Progress through levels to unlock entries. 4. Click Back to return.

**Design rationale:** Enemy discovery tied to `bio_shown_enemy_<key>` (existing localStorage key set when enemy bio pop-over fires before a level). No new tracking mechanism needed — enemies are discovered through normal level progression, which already writes this key. Dust Bunny is pre-discovered because it appears in L1 with no bio pop-over.

---

## Done-when (observable)

### US-52 — Main menu scene

- [ ] `src/scenes/MainMenuScene.ts` exists and extends `Phaser.Scene` with key `'MainMenuScene'` [US-52]
- [ ] `src/main.ts` lists `MainMenuScene` as the first scene in the Phaser config scene array [US-52]
- [ ] `src/main.ts` also registers `ToysScene` and `EnemiesScene` in the scene array [US-52]
- [ ] `TitleScene` is removed from `src/main.ts` scene array (MainMenuScene is the replacement) [US-52]
- [ ] MainMenuScene renders title "Toy Box Siege" (≥ 32px, amber `#ffc107`, monospace) and subtitle text [US-52]
- [ ] MainMenuScene renders a Play/Continue button, a Toys button, an Enemies button, and a Sound toggle — all positioned per the menu layout plan (Play/Continue at y ≈ 165, Toys at y ≈ 225, Enemies at y ≈ 273, Sound at y ≈ 335, all centered) [US-52]
- [ ] All interactive elements have hit area ≥ 48×48px [US-52]
- [ ] MainMenuScene background uses `#5d4037` fill with floor-board lines and atmospheric decorations matching existing TitleScene visuals [US-52]
- [ ] Sound toggle reads `isSfxMuted()` on scene create and displays `SFX ✓` (unmuted) or `SFX ✗` (muted) accordingly [US-52]
- [ ] Clicking Sound toggle calls `setMuted(!isSfxMuted())` and updates toggle label in place [US-52]
- [ ] HUD mute button in GameScene still functions independently (clicking it updates the same SFX module mute state) [US-52]
- [ ] `npm test` passes after TitleScene removal and MainMenuScene addition [US-52]

### US-53 — Play/Continue flow

- [ ] `LevelProgress.ts` exports `nextUnbeatenLevel(data: ProgressData): number` [US-53]
- [ ] `nextUnbeatenLevel` returns the index of the first level with state `'unlocked'`; returns `TOTAL_LEVELS - 1` if no level is `'unlocked'` (all completed) [US-53]
- [ ] `LevelProgress.test.ts` covers `nextUnbeatenLevel` with: no completions → returns 0; levels 0–3 completed → returns 4; all 9 completed → returns 8 [US-53]
- [ ] MainMenuScene calls `loadProgress()` on `create()` and renders button label `"Play"` when no levels have state `'completed'` [US-53]
- [ ] MainMenuScene renders button label `"Continue"` when `loadProgress()` returns at least one level with state `'completed'` [US-53]
- [ ] Clicking Play button calls `this.scene.start('LevelSelectScene')` with no init data [US-53]
- [ ] Clicking Continue button calls `this.scene.start('LevelSelectScene', { selectedLevel: nextUnbeatenLevel(progress) })` [US-53]
- [ ] `LevelSelectScene.create()` reads `(this.scene.settings.data as { selectedLevel?: number }).selectedLevel` and visually highlights that level's button when the value is provided [US-53]

### US-54 — Toys discovery sub-scene

- [ ] `src/scenes/ToysScene.ts` exists and extends `Phaser.Scene` with key `'ToysScene'` [US-54]
- [ ] Clicking Toys button in MainMenuScene calls `this.scene.start('ToysScene')` [US-54]
- [ ] ToysScene renders a card for each of the 5 defender types in `DEFENDER_TYPES` [US-54]
- [ ] Generator and shooter cards always render full card: DRAW_DEFENDER visual at scale ≥ 1.5, name ≥ 18px monospace, spark cost, bio text [US-54]
- [ ] Wall card renders full card when `'wall'` is in `loadUnlocks()` result; renders silhouette + `"???"` label when not [US-54]
- [ ] Trapper card renders full card when `'trapper'` is in `loadUnlocks()` result; renders silhouette + `"???"` when not [US-54]
- [ ] Mine card renders full card when `'mine'` is in `loadUnlocks()` result; renders silhouette + `"???"` when not [US-54]
- [ ] Silhouette cards use darkened fill (alpha ≤ 0.3) at same bounding dimensions as full card — no pointer cursor, no click response [US-54]
- [ ] `DEFENDER_TYPES` in `src/config/defenders.ts` has non-empty `bio` string for all 5 entries (trapper and mine bios added in this phase; others verified present) [US-54]
- [ ] Bio text for each defender is 1–2 sentences, kid-friendly voice, ≤ 25 words per sentence [US-54]
- [ ] Back button at top-left of ToysScene, hit area ≥ 48×48px, calls `this.scene.start('MainMenuScene')` on click [US-54]
- [ ] ToysScene assigns no depth values outside the existing depth layer map [US-54]
- [ ] Silhouette cards read as "locked — not yet unlocked," not as a broken or missing asset (aspirational — visual verification required) [US-54]

### US-55 — Enemies discovery sub-scene

- [ ] `src/scenes/EnemiesScene.ts` exists and extends `Phaser.Scene` with key `'EnemiesScene'` [US-55]
- [ ] Clicking Enemies button in MainMenuScene calls `this.scene.start('EnemiesScene')` [US-55]
- [ ] EnemiesScene renders a card for each of the 4 enemy types in `ENEMY_TYPES` [US-55]
- [ ] Dust Bunny card always renders full card: DRAW_ENEMY visual at scale ≥ 1.5, name ≥ 18px monospace, bio text [US-55]
- [ ] Cleaning Robot card renders full card when `localStorage.getItem('bio_shown_enemy_<cleaningRobotKey>')` is set; renders silhouette + `"???"` when not [US-55]
- [ ] Armored Bunny card renders full card when `localStorage.getItem('bio_shown_enemy_<armoredKey>')` is set; renders silhouette + `"???"` when not [US-55]
- [ ] Sock Puppet card renders full card when `localStorage.getItem('bio_shown_enemy_<sockPuppetKey>')` is set; renders silhouette + `"???"` when not [US-55]
- [ ] Silhouette cards use darkened fill (alpha ≤ 0.3), no pointer cursor, no click response [US-55]
- [ ] `ENEMY_TYPES` in `src/config/enemies.ts` has non-empty `bio` string for all 4 entries (cleaning_robot, armored_bunny, sock_puppet verified present; dust_bunny bio added in this phase) [US-55]
- [ ] Bio text for each enemy is 1–2 sentences, kid-friendly voice, ≤ 25 words per sentence [US-55]
- [ ] Back button at top-left of EnemiesScene, hit area ≥ 48×48px, calls `this.scene.start('MainMenuScene')` on click [US-55]
- [ ] EnemiesScene assigns no depth values outside the existing depth layer map [US-55]
- [ ] Silhouette cards read as "not yet encountered" — dark shape communicates mystery, not brokenness (aspirational — visual verification required) [US-55]

### Structural

- [ ] AGENTS.md scene list updated: `MainMenuScene.ts`, `ToysScene.ts`, `EnemiesScene.ts` added; `TitleScene.ts` removed [phase]
- [ ] AGENTS.md notes MainMenuScene as the initial scene (replaces TitleScene) [phase]
- [ ] AGENTS.md notes `nextUnbeatenLevel` export in `LevelProgress.ts` [phase]

## Golden principles (phase-relevant)

- Game logic separated from Phaser rendering — `nextUnbeatenLevel` is pure TS in `LevelProgress.ts`, testable in Vitest node environment
- Config-driven entities — bio text on `DefenderType` and `EnemyType` interfaces, discovery state read from existing localStorage keys
- agents-consistency — AGENTS.md updated to reflect scene changes and new export
- no-silent-pass — `nextUnbeatenLevel` covered by unit tests with distinct cases

## AGENTS.md sections affected

- Directory layout / scenes list (3 new scenes, TitleScene removed)
- Game logic architecture (nextUnbeatenLevel in LevelProgress.ts)
- Scene flow (MainMenuScene as entry; sub-scenes ToysScene, EnemiesScene)
