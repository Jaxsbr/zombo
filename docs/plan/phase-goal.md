## Phase goal

Introduce new players to the game gradually through a guided 5-level progression. L1 uses a dream bubble tutorial to teach generator placement, spark collection, and pistol placement step-by-step. Levels start with 1 lane and expand to the full 5-lane grid. Block Tower is unlocked after L3 with a toy unlock card. L5 introduces the Armored Bunny with a pre-round enemy bio screen. Each level teaches exactly one new concept.

### Stories in scope
- US-40 — Variable lane grid
- US-41 — Tutorial dream bubbles
- US-42 — Toy unlock card
- US-43 — Pre-round enemy bio
- US-44 — Guided level progression

### Done-when (observable)

- [x] LevelConfig interface in `src/systems/WaveManager.ts` includes `activeLanes?: number[]` field [US-40]
- [x] GameScene drawGrid renders active lane rows with normal carpet colors; inactive rows rendered with darkened fill (alpha <= 0.3 overlay or fill at 25% brightness) so they read as non-playable background, not selectable terrain [US-40]
- [x] GameScene createGridClickZones creates interactive zones only for rows listed in activeLanes [US-40]
- [x] WaveManager or GameScene spawn logic constrains enemy lane values to activeLanes set [US-40]
- [x] Level with `activeLanes: [2]` renders a single playable row at grid row 2 [US-40]
- [x] Level with `activeLanes: [1,2,3]` renders 3 playable rows [US-40]
- [x] Level with `activeLanes` omitted renders all 5 rows (backward compatible with existing config) [US-40]
- [x] Atmosphere decorations (furniture silhouettes, toy details) only spawn in active lane cells [US-40]
- [x] Unit tests for active lane filtering exist and pass (test that enemy spawn with lane outside activeLanes is rejected or remapped) [US-40]
- [ ] `src/systems/Tutorial.ts` exists as pure TS module exporting tutorial step state machine (no Phaser imports) [US-41]
- [ ] Tutorial state machine has 3 steps: PLACE_GENERATOR, COLLECT_SPARK, PLACE_PISTOL, plus COMPLETE state [US-41]
- [ ] GameScene detects tutorial mode from LevelConfig `tutorialMode: true` and activates dream bubble overlays [US-41]
- [ ] Step 1: Dream bubble renders as thought-cloud shape (white/cream fill, rounded body, 3 trailing circles at bottom-right) at depth 105 with text <= 8 words and animated pointer (depth 106) toward generator panel card [US-41]
- [ ] Step 1: Bubble top edge at y >= 85 (below HUD bar). Bubble does not extend below active lane area [US-41]
- [ ] Step 1: Only generator panel card is interactive; all grid zones and other panel cards have `disableInteractive()` called [US-41]
- [ ] Step 2: After generator placed, spark spawns immediately (not on timer). Dream bubble repositions near spark with collection instruction (<= 8 words) [US-41]
- [ ] Step 3: After spark(s) collected and balance >= 100 (pistol cost), dream bubble shows pistol placement instruction (<= 8 words); pistol card becomes interactive, grid zones for active lane re-enabled [US-41]
- [ ] After step 3 placement, all dream bubble graphics destroyed and all zones re-enabled via `setInteractive()` [US-41]
- [ ] Tutorial only runs on first L1 play. Replaying L1 after completion skips tutorial (tracked via localStorage key `tutorial_complete`) [US-41]
- [ ] Tutorial unit tests: all step transitions (PLACE_GENERATOR -> COLLECT_SPARK -> PLACE_PISTOL -> COMPLETE) verified, including edge case where user has no valid placement cell [US-41]
- [ ] Dream bubble reads as a friendly instruction for a young child — thought-cloud shape, short text, clear pointer, not mistakable for a game obstacle or collectible (aspirational — visual verification required) [US-41]
- [x] DefenderType interface in `src/config/defenders.ts` includes `bio: string` field [US-42]
- [x] Block Tower entry in DEFENDER_TYPES has bio text (1-2 sentences, kid-friendly, explains blocking) [US-42]
- [x] After completing a level that triggers an unlock, full-screen overlay appears: dimmed background (0x000000, alpha 0.7) at depth 199, card at depth 200 [US-42]
- [x] Overlay card shows: toy visual rendered via DRAW_DEFENDER at scale >= 1.5 occupying >= 40% of card height, toy name (>= 18px monospace), spark cost, and bio text (>= 14px monospace) [US-42]
- [x] Card border: #5d4037 (warm brown), width >= 3px [US-42]
- [x] Card entry animation: card slides into center from above (tween duration 300-500ms) [US-42]
- [x] "Collect!" button at depth 201, hit area >= 48x48px, dismisses overlay on click, transitioning to LevelSelectScene [US-42]
- [x] While overlay is visible, all grid click zones and LevelSelectScene buttons have `disableInteractive()` called. Only the "Collect!" button is interactive [US-42]
- [x] localStorage key `bio_shown_defender_<key>` set to `true` after card shown; re-completing L3 does not re-show the Block Tower card [US-42]
- [x] Unlock card reads as a reward — gift-tag/toy-label styling, toy visual prominent, not mistakable for an error dialog or loading screen (aspirational — visual verification required) [US-42]
- [x] EnemyType interface in `src/config/enemies.ts` includes `bio: string` field [US-43]
- [x] Armored Bunny entry in ENEMY_TYPES has bio text (1-2 sentences, kid-friendly, explains armor degradation mechanic) [US-43]
- [x] Before L5 game starts, full-screen overlay appears: dimmed background (0x000000, alpha 0.7) at depth 199, card at depth 200, showing enemy visual (EnemyEntity renderer at scale >= 1.5), name, bio text [US-43]
- [x] "Continue" button at depth 201, hit area >= 48x48px, dismisses overlay and starts the level normally [US-43]
- [x] Card follows same visual pattern as unlock card: border #5d4037 >= 3px, monospace text (name >= 18px, bio >= 14px) [US-43]
- [x] While overlay is visible, LevelSelectScene buttons have `disableInteractive()` called. Only "Continue" button is interactive [US-43]
- [x] localStorage key `bio_shown_enemy_<key>` set to `true` after bio shown; replaying L5 does not re-show the bio [US-43]
- [x] Armored Bunny in L5 inherits all baseline enemy behaviors: movement animation, health bar display, collision with defenders, lane pathfinding [US-43]
- [x] Enemy bio reads as a heads-up warning about a new challenge — not a punishment or game-over screen (aspirational — visual verification required) [US-43]
- [x] `src/config/levels.ts` exports 5 level configs matching the progression in `docs/product/stage-one.md` [US-44]
- [x] LevelConfig interface includes `startingBalance: number` field [US-44]
- [x] GameScene reads `startingBalance` from LevelConfig instead of using global constant [US-44]
- [x] L1 config: `activeLanes: [2]`, `tutorialMode: true`, 1 wave, <= 3 basic enemies, starting balance < 100 (pistol unaffordable) and >= 50 (generator affordable) [US-44]
- [x] L2 config: `activeLanes: [1,2,3]`, 2 waves, basic enemies only [US-44]
- [x] L3 config: `activeLanes: [0,1,2,3,4]`, 3 waves, basic enemies only [US-44]
- [x] L4 config: 5 lanes, 3-4 waves, basic enemies only, Block Tower available [US-44]
- [x] L5 config: 5 lanes, 4 waves, basic + armored enemies from wave 2 onward, `enemyBio: { enemyKey: 'armored' }` [US-44]
- [x] INITIAL_DEFENDERS in DefenderUnlocks.ts is `['generator', 'shooter']` (wall removed) [US-44]
- [x] UNLOCK_MAP in DefenderUnlocks.ts is `{ 3: 'wall' }` (L3 completion unlocks Block Tower) [US-44]
- [x] Trapper and mine are not in INITIAL_DEFENDERS or UNLOCK_MAP [US-44]
- [x] A single Water Pistol survives L1's wave: total enemy HP in wave <= pistol DPS (15/s) x wave duration [US-44]
- [x] L1 starting balance is a value X where 50 <= X < 100 (generator affordable, pistol not) — verified by unit test [US-44]
- [x] npm test passes with updated level configs and unlock progression [US-44]
- [ ] AGENTS.md reflects: variable lane system, tutorial dream bubble system, toy unlock cards, enemy bio screens, guided level progression (L1-L5 structure), updated defender unlock schedule [phase]
- [ ] AGENTS.md includes explicit depth layer map: grid 0, atmosphere -10, entities 5, sparks 10, HUD 50, dream-bubble 105, pointer 106, overlay-bg 199, overlay-card 200, overlay-btn 201 [phase]

### Golden principles (phase-relevant)
- Game logic separated from Phaser rendering — Tutorial.ts is pure TS with no Phaser dependency, testable in isolation
- Config-driven entities — bio text on DefenderType/EnemyType, activeLanes and startingBalance on LevelConfig, tutorialMode flag
- agents-consistency — AGENTS.md updated to reflect all new systems and changed progression
- no-silent-pass — Tutorial state machine has unit tests; level config changes covered by existing test suite
