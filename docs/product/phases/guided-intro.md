# Phase: guided-intro

Status: draft

## Design direction

Toy-box developer art (established). Dream bubbles styled as thought clouds — white/cream, soft rounded edges, trail of small circles leading to a corner. Fits the bedroom theme (a child imagining/dreaming how to play). Unlock cards styled as toy-box gift tags — warm brown border (#5d4037), cream background, toy visual prominent. Enemy bio screen uses the same card pattern. All text in monospace font (established), sized for kid readability (minimum 18px for body text in overlays).

## HUD layout plan

**Depth layer map** (to be added to AGENTS.md):
- Grid tiles: depth 0
- Atmosphere: depth -10
- Entities (defenders, enemies, projectiles): depth 5
- Sparks: depth 10
- HUD text/bars: depth 50
- Dream bubbles: depth 105
- Dream bubble pointer arrow: depth 106
- Overlay dimmed background: depth 199
- Overlay card: depth 200
- Overlay button: depth 201

Dream bubbles during L1 tutorial (depth 105):
- Step 1 (place generator): Bubble centered horizontally, top edge at y >= 85 (clear of HUD bar at 0-80). Pointer arrow (depth 106) points toward generator panel card. Bubble must not extend below the active lane row.
- Step 2 (click spark): Bubble repositions near spark spawn area. Pointer tracks spark position.
- Step 3 (place pistol): Same region as step 1, pointer redirects to pistol card.

Unlock card overlay (depth 199-201):
- Dimmed background covers full Phaser canvas (GAME_WIDTH x GAME_HEIGHT) at depth 199, color 0x000000 alpha 0.7
- Card centered (GAME_WIDTH/2, GAME_HEIGHT/2), approximately 250x300px, at depth 200
- "Collect!" button centered below card at depth 201, hit area >= 48x48px

Enemy bio screen (depth 199-201):
- Same layout pattern as unlock card
- "Continue" button instead of "Collect!"

## Stories

### US-40 — Variable lane grid

As a player, I want levels to have different numbers of active lanes, so that the game can gradually introduce me to the full grid.

**Acceptance criteria:**
- LevelConfig includes an `activeLanes` field specifying which grid rows are playable
- GameScene renders active lanes with normal grid visuals; inactive lanes are visually dimmed
- Click zones created only for active lane rows
- Enemies spawn only in active lanes
- Omitting `activeLanes` defaults to all 5 rows (backward compatible)

**Interaction model:** Same as existing grid — click panel to select, click cell to place. Only active lane cells respond to clicks. Inactive lanes appear as dimmed background carpet (darker shade, no hover response). No new interaction pattern.

**User guidance:**
- Discovery: Player sees fewer lanes in early levels — no explicit UI explanation needed
- Manual section: N/A — implicit visual mechanic
- Key steps: 1. Start L1 — see single lane. 2. Progress to L2 — see 3 lanes. 3. Reach L3 — full 5-lane grid.

**Design rationale:** Variable lanes create a natural difficulty ramp without new mechanics. 1->3->5 teaches multi-lane management incrementally. PvZ uses a similar approach (pool levels add water lanes).

### US-41 — Tutorial dream bubbles

As a new player (age 5-8), I want the first level to guide me step-by-step with animated instructions, so that I understand how to place toys and collect sparks without reading a manual.

**Acceptance criteria:**
- L1 starts in tutorial mode with dream bubble overlays
- Step 1: Dream bubble near defender panel shows "Place your Jack-in-the-Box!" with animated pointer toward generator card. Only generator card is interactive (pistol card visible but disabled by insufficient sparks). Game waits for placement.
- Step 2: After placement, spark spawns. Dream bubble shows "Click the spark!" with pointer following the spark. Game waits for collection.
- Step 3: After sufficient sparks collected, dream bubble shows "Now place a Water Pistol!" with pointer toward pistol card. Game waits for placement.
- After step 3, tutorial ends. Remaining gameplay (wave, sparks) proceeds normally — no more bubbles.
- Dream bubble has thought-cloud visual: white/cream fill, soft rounded shape, trail of small circles from bottom-right corner.
- Tutorial text <= 8 words per step (readable by a 5-year-old).
- Tutorial state machine implemented as pure TS module (`src/systems/Tutorial.ts`) with no Phaser dependency.
- During tutorial steps, grid zones for inactive steps are disabled (`disableInteractive()`) to prevent accidental placement. Re-enabled after tutorial ends.

**Interaction model:** Tutorial gates the normal game flow. During each step, ONLY the relevant interactive element responds to clicks — generator card in step 1, spark in step 2, pistol card in step 3. All other interactive zones (grid cells, other panel cards) are disabled via `disableInteractive()`. After step 3 completes, all zones are re-enabled and normal gameplay resumes. This differs from the existing "everything interactive at once" pattern.

**User guidance:**
- Discovery: Automatic on L1 — no user action required to trigger
- Manual section: N/A — in-game tutorial
- Key steps: 1. See dream bubble. 2. Follow pointer. 3. Perform action. 4. Next bubble appears. 5. After 3 steps, play freely.

**Design rationale:** Dream bubbles (thought clouds) fit the bedroom theme — a child dreaming how to play. Gated steps ensure the player completes each action before moving on. PvZ similarly gates its first level: place sunflower -> collect sun -> place peashooter. The <= 8 words constraint keeps text accessible for emergent readers.

### US-42 — Toy unlock card

As a player, I want to see what a new toy does when I unlock it, so that I understand how to use it in the next level.

**Acceptance criteria:**
- After completing a level that unlocks a new defender, a full-screen card overlay appears before returning to level select
- Card shows: toy visual (DRAW_DEFENDER renderer at >= 1.5x scale), toy name, spark cost, bio text (1-2 sentences)
- "Collect!" button dismisses the overlay and continues to LevelSelectScene
- Card entry animation: card slides down from above into center of screen (tween, ~400ms)
- DefenderType interface gains a `bio: string` field
- Block Tower bio: kid-friendly explanation of blocking behavior (e.g., "Tough as bricks! Enemies can't get past a Block Tower. Put it in front to protect your toys.")
- Unlock card only shows once per defender per save (tracked in localStorage)
- Overlay background: dimmed (semi-transparent dark, matching existing loadout overlay pattern)
- Overlay disables all underlying interactive zones while visible

**Interaction model:** Full-screen overlay after level-win transition. All game/level-select interaction disabled while overlay is visible. Player reads bio and clicks "Collect!" to dismiss. Follows the same overlay pattern as the loadout selection screen in LevelSelectScene (full-screen, single interaction, then transition).

**User guidance:**
- Discovery: Automatic after beating L3 — Block Tower unlock card appears
- Manual section: N/A — in-game reward screen
- Key steps: 1. Beat L3. 2. Card slides into view showing Block Tower. 3. Read bio. 4. Click "Collect!" 5. Proceed to level select with Block Tower now available.

**Design rationale:** PvZ's plant card drops create an earned-reward moment. The bio teaches the mechanic BEFORE the player needs it (L4 benefits from Block Tower). Showing the toy visual + cost + description in a single card gives all context needed to use it effectively.

### US-43 — Pre-round enemy bio

As a player, I want to know about a new enemy type before I face it, so that I can prepare a strategy.

**Acceptance criteria:**
- Before L5 starts (after clicking from level select, before GameScene loads), an enemy bio screen appears
- Shows: Armored Bunny visual (rendered using existing EnemyEntity drawing at >= 1.5x scale), enemy name, behavior description (1-2 sentences about armor degradation), "Continue" button
- Clicking "Continue" starts the level normally
- Bio only shows on first encounter of that enemy type per save (tracked in localStorage)
- EnemyType interface gains a `bio: string` field
- Armored Bunny bio: kid-friendly warning (e.g., "Armored Bunny wears a tough helmet! Keep shooting — the helmet cracks and breaks off.")
- Overlay follows same visual pattern as unlock card (dimmed background, centered card, matching palette)
- Overlay disables all underlying interactive zones while visible

**Interaction model:** Full-screen overlay shown before level starts. Player reads enemy description and clicks "Continue" to begin the round. Same pattern as unlock card (US-42) but shown pre-game instead of post-game.

**User guidance:**
- Discovery: Automatic before first play of L5
- Manual section: N/A — in-game info screen
- Key steps: 1. Tap L5 on level select. 2. Enemy bio screen appears showing Armored Bunny. 3. Read description. 4. Click "Continue". 5. Level starts.

**Design rationale:** Pre-round enemy bios set expectations and prime strategy. When the 8-year-old sees "helmet cracks and breaks off," she knows focused fire matters. Simple picture + description + continue button is quick — no reading wall for young players. PvZ uses a Suburban Almanac for this purpose; our approach is lighter (inline before the relevant level).

### US-44 — Guided level progression

As the player's family, we want a level progression that teaches one thing at a time, so that a 5-year-old learns the basics and an 8-year-old masters all the toys before facing tough enemies.

**Acceptance criteria:**
- Current 5-level configs in `levels.ts` replaced with guided progression matching `docs/product/stage-one.md`
- LevelConfig gains a `startingBalance: number` field (replaces global STARTING_BALANCE)
- L1: activeLanes=[2] (center row), starting balance set so only generator (50) is affordable and pistol (100) is not, 1 wave, <= 3 basic enemies, a single Water Pistol can survive the wave (enemy total HP < pistol DPS x wave duration)
- L2: activeLanes=[1,2,3], 2 waves, basic enemies across 3 lanes, starting balance scales for 3-lane defense
- L3: activeLanes=[0,1,2,3,4], 3 waves, basic enemies across 5 lanes, economy tighter than L2 (forces choices about generator vs pistol placement)
- L4: all 5 lanes, 3-4 waves, basic enemies, wave composition designed so Block Tower placement provides clear advantage (e.g., a lane with multiple enemies benefits from a wall + shooter combo vs shooter alone)
- L5: all 5 lanes, 4 waves, basic + armored enemies, armored enemies appear from wave 2 onward
- INITIAL_DEFENDERS changed from `['shooter', 'generator', 'wall']` to `['generator', 'shooter']`
- UNLOCK_MAP changed: `{ 3: 'wall' }` (completing L3 index 2 unlocks Block Tower). Trapper and mine removed from unlock map for this phase.
- TOTAL_LEVELS remains 5
- LevelConfig gains optional `tutorialMode: boolean` flag for L1 detection
- LevelConfig gains optional `enemyBio: { enemyKey: string }` for pre-round bio trigger
- npm test passes

**Interaction model:** Same as existing level select -> game flow. No new interaction patterns in this story — purely config and data changes.

**User guidance:**
- Discovery: Player starts at L1 and progresses through level select (existing flow)
- Manual section: N/A — progression is implicit
- Key steps: 1. Start L1 (tutorial). 2. Beat levels to progress. 3. L3 completion unlocks Block Tower. 4. L5 introduces Armored Bunny.

**Design rationale:** PvZ teaches one concept per level. This progression follows that model: L1=basics (tutorial), L2=multi-lane (1->3), L3=full grid (3->5, earn wall), L4=walls (practice new toy), L5=tough enemy (new challenge). No level introduces two new concepts simultaneously. The startingBalance per level allows economy tuning — L1 is very controlled (tutorial), later levels provide more freedom.

## Done-when (observable)

### US-40 — Variable lane grid
- [ ] LevelConfig interface in `src/systems/WaveManager.ts` includes `activeLanes?: number[]` field [US-40]
- [ ] GameScene drawGrid renders active lane rows with normal carpet colors; inactive rows rendered with darkened fill (alpha <= 0.3 overlay or fill at 25% brightness) so they read as non-playable background, not selectable terrain [US-40]
- [ ] GameScene createGridClickZones creates interactive zones only for rows listed in activeLanes [US-40]
- [ ] WaveManager or GameScene spawn logic constrains enemy lane values to activeLanes set [US-40]
- [ ] Level with `activeLanes: [2]` renders a single playable row at grid row 2 [US-40]
- [ ] Level with `activeLanes: [1,2,3]` renders 3 playable rows [US-40]
- [ ] Level with `activeLanes` omitted renders all 5 rows (backward compatible with existing config) [US-40]
- [ ] Atmosphere decorations (furniture silhouettes, toy details) only spawn in active lane cells [US-40]
- [ ] Unit tests for active lane filtering exist and pass (test that enemy spawn with lane outside activeLanes is rejected or remapped) [US-40]

### US-41 — Tutorial dream bubbles
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

### US-42 — Toy unlock card
- [ ] DefenderType interface in `src/config/defenders.ts` includes `bio: string` field [US-42]
- [ ] Block Tower entry in DEFENDER_TYPES has bio text (1-2 sentences, kid-friendly, explains blocking) [US-42]
- [ ] After completing a level that triggers an unlock, full-screen overlay appears: dimmed background (0x000000, alpha 0.7) at depth 199, card at depth 200 [US-42]
- [ ] Overlay card shows: toy visual rendered via DRAW_DEFENDER at scale >= 1.5 occupying >= 40% of card height, toy name (>= 18px monospace), spark cost, and bio text (>= 14px monospace) [US-42]
- [ ] Card border: #5d4037 (warm brown), width >= 3px [US-42]
- [ ] Card entry animation: card slides into center from above (tween duration 300-500ms) [US-42]
- [ ] "Collect!" button at depth 201, hit area >= 48x48px, dismisses overlay on click, transitioning to LevelSelectScene [US-42]
- [ ] While overlay is visible, all grid click zones and LevelSelectScene buttons have `disableInteractive()` called. Only the "Collect!" button is interactive [US-42]
- [ ] localStorage key `bio_shown_defender_<key>` set to `true` after card shown; re-completing L3 does not re-show the Block Tower card [US-42]
- [ ] Unlock card reads as a reward — gift-tag/toy-label styling, toy visual prominent, not mistakable for an error dialog or loading screen (aspirational — visual verification required) [US-42]

### US-43 — Pre-round enemy bio
- [ ] EnemyType interface in `src/config/enemies.ts` includes `bio: string` field [US-43]
- [ ] Armored Bunny entry in ENEMY_TYPES has bio text (1-2 sentences, kid-friendly, explains armor degradation mechanic) [US-43]
- [ ] Before L5 game starts, full-screen overlay appears: dimmed background (0x000000, alpha 0.7) at depth 199, card at depth 200, showing enemy visual (EnemyEntity renderer at scale >= 1.5), name, bio text [US-43]
- [ ] "Continue" button at depth 201, hit area >= 48x48px, dismisses overlay and starts the level normally [US-43]
- [ ] Card follows same visual pattern as unlock card: border #5d4037 >= 3px, monospace text (name >= 18px, bio >= 14px) [US-43]
- [ ] While overlay is visible, LevelSelectScene buttons have `disableInteractive()` called. Only "Continue" button is interactive [US-43]
- [ ] localStorage key `bio_shown_enemy_<key>` set to `true` after bio shown; replaying L5 does not re-show the bio [US-43]
- [ ] Armored Bunny in L5 inherits all baseline enemy behaviors: movement animation, health bar display, collision with defenders, lane pathfinding [US-43]
- [ ] Enemy bio reads as a heads-up warning about a new challenge — not a punishment or game-over screen (aspirational — visual verification required) [US-43]

### US-44 — Guided level progression
- [ ] `src/config/levels.ts` exports 5 level configs matching the progression in `docs/product/stage-one.md` [US-44]
- [ ] LevelConfig interface includes `startingBalance: number` field [US-44]
- [ ] GameScene reads `startingBalance` from LevelConfig instead of using global constant [US-44]
- [ ] L1 config: `activeLanes: [2]`, `tutorialMode: true`, 1 wave, <= 3 basic enemies, starting balance < 100 (pistol unaffordable) and >= 50 (generator affordable) [US-44]
- [ ] L2 config: `activeLanes: [1,2,3]`, 2 waves, basic enemies only [US-44]
- [ ] L3 config: `activeLanes: [0,1,2,3,4]`, 3 waves, basic enemies only [US-44]
- [ ] L4 config: 5 lanes, 3-4 waves, basic enemies only, Block Tower available [US-44]
- [ ] L5 config: 5 lanes, 4 waves, basic + armored enemies from wave 2 onward, `enemyBio: { enemyKey: 'armored' }` [US-44]
- [ ] INITIAL_DEFENDERS in DefenderUnlocks.ts is `['generator', 'shooter']` (wall removed) [US-44]
- [ ] UNLOCK_MAP in DefenderUnlocks.ts is `{ 3: 'wall' }` (L3 completion unlocks Block Tower) [US-44]
- [ ] Trapper and mine are not in INITIAL_DEFENDERS or UNLOCK_MAP [US-44]
- [ ] A single Water Pistol survives L1's wave: total enemy HP in wave <= pistol DPS (15/s) x wave duration [US-44]
- [ ] L1 starting balance is a value X where 50 <= X < 100 (generator affordable, pistol not) — verified by unit test [US-44]
- [ ] npm test passes with updated level configs and unlock progression [US-44]

### Structural
- [ ] AGENTS.md reflects: variable lane system, tutorial dream bubble system, toy unlock cards, enemy bio screens, guided level progression (L1-L5 structure), updated defender unlock schedule [phase]
- [ ] AGENTS.md includes explicit depth layer map: grid 0, atmosphere -10, entities 5, sparks 10, HUD 50, dream-bubble 105, pointer 106, overlay-bg 199, overlay-card 200, overlay-btn 201 [phase]

## AGENTS.md sections affected
- Game logic architecture (variable lanes, tutorial system, bio overlays)
- Directory layout (new Tutorial.ts module)
- Level progression (L1-L5 guided structure replaces old)
- Defender unlock progression (initial=[generator, shooter], L3 unlocks wall)
- Depth layer map (new section)
- Scene flow (overlays before/after levels)

## Golden principles (phase-relevant)
- Game logic separated from Phaser rendering — Tutorial.ts is pure TS with no Phaser dependency, testable in isolation
- Config-driven entities — bio text on DefenderType/EnemyType, activeLanes and startingBalance on LevelConfig, tutorialMode flag
- agents-consistency — AGENTS.md updated to reflect all new systems and changed progression
- no-silent-pass — Tutorial state machine has unit tests; level config changes covered by existing test suite
