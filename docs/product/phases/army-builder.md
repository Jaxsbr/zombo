# Phase: army-builder

Status: shipped

## Design direction

Bedroom toy-box aesthetic — level select themed as a toy shelf or numbered toy boxes. Loadout selection styled as picking toys from a chest. New defenders and enemies follow existing procedural Graphics patterns (Phaser Graphics primitives, not sprites). Same warm, playful feel as existing title and game-over scenes. Bold, colorful shapes that communicate purpose at a glance.

## Stories

### US-28 — Two new single-use defenders: Teddy Bomb and Marble Mine

As a player, I want new single-use defender types that create strategic variety, so that I have more tactical options for handling tough situations.

**Acceptance criteria:**
- Teddy Bomb: costs 150 sparks, Very Slow recharge (~50s), placed on any empty cell, immediately explodes dealing lethal damage to all enemies within 1-cell Chebyshev distance of the placement cell (up to 3x3 area), then destroys itself
- Marble Mine: costs 25 sparks, Slow recharge (~30s), placed on any empty cell, starts dormant, arms after ~10 seconds (visual state change), instant-kills the first enemy that enters its cell when armed, then destroys itself
- Dormant mine does not trigger on enemy contact
- Marble Mine does not block enemy movement — enemies walk through/over it; trigger is cell overlap while armed
- Both types appear as selectable cards in the defender HUD panel
- Both types render distinct procedural Graphics shapes
- DefenderType interface extended with fields to support single-use behavior (singleUse flag, behavior type)

**User guidance:**
- Discovery: New defender cards appear in the bottom HUD panel alongside existing defenders
- Manual section: N/A — game mechanics are self-evident from in-game cards
- Key steps: 1. Click the Teddy Bomb/Marble Mine card in the HUD. 2. Click an empty grid cell to place it.

**Design rationale:** Cherry Bomb and Potato Mine are PvZ's first "utility" plants — single-use defenders that trade economy for instant impact. They teach resource management (spend 150 on a bomb vs save for shooters) and forward planning (mine placement before enemies arrive). Simplest new archetypes because they don't require ongoing combat loops — just placement, trigger, destroy.

**Interaction model:** Same click-card-then-click-cell flow as existing defenders. Teddy Bomb detonates instantly on placement (no further interaction). Marble Mine sits passively until an enemy walks onto its armed cell.

### US-29 — Two new enemy types: Armored Bunny and Sock Puppet

As a player, I want tougher and trickier enemies that force me to adapt my strategy, so that the game stays challenging as I progress.

**Acceptance criteria:**
- Armored Bunny: same speed as Dust Bunny (0.5 cells/s), 3x health (300 HP), renders as Dust Bunny shape with a toy helmet overlay, helmet visual degrades at 50% and 25% remaining health
- Sock Puppet: medium speed (0.35 cells/s — between Dust Bunny and Cleaning Robot), 150 HP, has jumpsRemaining=1 — jumps over the first defender it encounters (advances past defender cell), then walks normally
- Sock Puppet jump: if no defender in path, walks entire lane without jumping; jump triggers only once (jumpsRemaining decremented on use)
- Both types render distinct procedural Graphics shapes
- EnemyType interface extended with optional fields for type-specific behavior (e.g., jumpsRemaining, armorStages)

**User guidance:** N/A — enemies are encountered during gameplay, not player-controlled.

**Design rationale:** Buckethead and Pole Vaulter are PvZ's first "counter" enemies — Buckethead demands concentrated firepower or area damage, Pole Vaulter punishes front-row-only defense. Together they force defense depth and burst damage thinking. Armored Bunny at 300 HP matches Cleaning Robot toughness but with Dust Bunny speed — a "fast tank" vs "slow tank" distinction requiring different strategies.

### US-30 — Multi-level structure with level select

As a player, I want multiple levels with escalating difficulty, so that I have a progression of challenges to work through and a reason to keep playing.

**Acceptance criteria:**
- 5 level configurations with escalating wave count and enemy composition
- Level enemy composition: L1=basic only, L2=basic+armored, L3=basic+armored, L4=basic+armored+jumper, L5=all types
- LevelSelectScene: renders 5 level entries with three visual states — locked, unlocked, completed
- Level 1 starts unlocked; completing level N unlocks level N+1
- Level completion state persisted to localStorage and restored on reload
- Scene flow: TitleScene → LevelSelectScene → GameScene → GameOverScene → LevelSelectScene
- Completed levels can be replayed

**User guidance:**
- Discovery: After pressing Play on the title screen, the level select screen appears
- Manual section: N/A — game flow is self-evident
- Key steps: 1. Press Play on title screen. 2. Select an unlocked level. 3. Complete the level to unlock the next one.

**Design rationale:** PvZ's "just one more level" loop is one of its three core engagement pillars. Without multiple levels, there's no progression hook — the player beats the single level and stops. Five levels provide a meaningful difficulty curve while keeping scope manageable. Level select is a new scene (not a modal) to keep the scene flow clean and consistent with existing transitions.

**Interaction model:** Click/tap level buttons on the select screen. Locked levels are visually distinct and non-interactive. Completed levels show a completion indicator and remain clickable for replay.

### US-31 — Defender unlock progression and pre-level loadout

As a player, I want to unlock new defenders as I progress and choose which ones to bring into each level, so that I feel rewarded for advancing and can experiment with different strategies.

**Acceptance criteria:**
- Defender unlock map: Level 1 starts with Water Pistol, Jack-in-the-Box, Block Tower; completing Level 2 unlocks Teddy Bomb; completing Level 3 unlocks Marble Mine
- Unlock state persisted to localStorage alongside level completion
- Pre-level loadout screen appears when player has > 4 unlocked defenders
- Loadout screen shows unlocked defenders as selectable cards with name and spark cost; max 4 selectable; "Go!" button starts the level
- When player has ≤ 4 unlocked defenders, loadout auto-fills and selection screen is skipped
- GameScene receives the selected loadout and only shows those defender types in the HUD panel

**User guidance:**
- Discovery: After selecting a level, the loadout screen appears (when > 4 defenders unlocked)
- Manual section: N/A — game flow is self-evident
- Key steps: 1. Select a level. 2. Choose up to 4 defenders by clicking their cards. 3. Press "Go!" to start.

**Design rationale:** PvZ's seed slot system is the strategic meta-game above individual level tactics. Limiting the loadout to 4 from an eventual roster of 5 forces meaningful trade-offs even with a small collection — do you bring the bomb for emergencies or the mine for economy? Auto-skip when ≤ 4 avoids unnecessary screens early in progression. This system scales naturally as more defenders are added in future phases.

**Interaction model:** Click defender cards to toggle selection (highlighted = selected). Selecting a 5th when 4 are already selected does nothing (cap enforced). "Go!" button only active when >= 1 defender selected.

## Done-when (observable)

### US-28 — Teddy Bomb and Marble Mine

- [ ] `src/config/defenders.ts` exports `bomb` and `mine` entries; DefenderType interface extended with at least a `singleUse: boolean` field and a `behavior` field to distinguish bomb/mine/shooter/wall logic [US-28]
- [ ] Teddy Bomb config: cost=150, singleUse=true; on placement, all enemies within Chebyshev distance 1 of the bomb cell (up to 3x3 area) receive damage >= max enemy health (lethal), then the bomb defender is removed from the grid [US-28]
- [ ] Teddy Bomb: enemies outside the 3x3 area centered on the bomb cell take zero damage [US-28]
- [ ] Marble Mine config: cost=25, singleUse=true; spawns with armed=false, transitions to armed=true after MINE_ARM_DELAY (~10000ms) [US-28]
- [ ] Marble Mine: when armed and an enemy's grid cell matches the mine's cell, deals damage >= max enemy health (lethal) to that enemy, then the mine is removed from the grid [US-28]
- [ ] Marble Mine: while dormant (armed=false), enemy entering the mine's cell does NOT trigger the mine — enemy walks past [US-28]
- [ ] Marble Mine does not block enemy movement — enemies advance through the mine's cell regardless of armed state; only the damage trigger fires when armed [US-28]
- [ ] DefenderEntity.ts draws distinct procedural Graphics shapes for bomb (round red teddy with star/fuse detail) and mine (cluster of coloured marbles); Teddy Bomb reads as an explosive toy — visually distinct from the three existing persistent defenders [US-28]
- [ ] Teddy Bomb placement triggers an expanding burst animation (scale + alpha tween) before removal [US-28]
- [ ] Marble Mine visual state change: dormant = grey/muted appearance, armed = bright/glowing with subtle pulse tween [US-28]
- [ ] Recharge timers: bomb rechargeTime >= 45000ms, mine rechargeTime >= 25000ms; defender HUD card shows cooldown overlay between placements [US-28]
- [ ] `test/SingleUseDefenders.test.ts` exists with >= 8 test cases covering: bomb area damage in range, bomb zero damage out of range, bomb self-destruct after detonation, mine dormant no-trigger, mine arm timing, mine armed trigger kills enemy, mine self-destruct after trigger, mine does not block movement [US-28]

### US-29 — Armored Bunny and Sock Puppet

- [ ] `src/config/enemies.ts` exports `armored` and `jumper` entries with correct stats: armored health=300 speed=0.5, jumper health=150 speed=0.35 [US-29]
- [ ] Armored Bunny health equals exactly 3 * ENEMY_TYPES.basic.health; speed equals ENEMY_TYPES.basic.speed [US-29]
- [ ] Sock Puppet jump logic: when movement advances into a cell occupied by a defender and jumpsRemaining > 0, the enemy skips that cell (advances to the cell one past the defender), decrements jumpsRemaining to 0, and continues walking [US-29]
- [ ] Sock Puppet with jumpsRemaining=0 does NOT jump — interacts with defenders normally (blocks, takes/deals damage) [US-29]
- [ ] Sock Puppet walks the entire lane normally if no defender is encountered [US-29]
- [ ] EnemyEntity.ts draws distinct procedural Graphics shapes: armored = Dust Bunny silhouette with toy helmet on top, jumper = elongated sock shape with googly-eye circles; Armored Bunny reads as a tougher Dust Bunny — the helmet is the dominant visual differentiator [US-29]
- [ ] Armored Bunny helmet visual degrades: full helmet at > 50% health, cracked/partial helmet at 25-50% health, no helmet (bare Dust Bunny shape) at < 25% health [US-29]
- [ ] Sock Puppet jump renders as a visible arc tween (y-offset parabola over ~400ms) when triggered [US-29]
- [ ] `test/EnemyTypes.test.ts` exists with >= 6 test cases covering: armored health = 3x basic, armored speed = basic speed, jumper skips defender cell, jumper no-skip after jump used, jumper no-skip when no defender in path, jumper normal interaction after jump spent [US-29]

### US-30 — Multi-level structure

- [ ] `src/config/levels.ts` exports LEVEL_1 through LEVEL_5 with escalating configs: L1=3 waves basic only, L2=3 waves basic+armored, L3=4 waves basic+armored, L4=4 waves basic+armored+jumper, L5=5 waves all enemy types with multi-lane pressure [US-30]
- [ ] `src/scenes/LevelSelectScene.ts` exists and is registered in the Phaser game config (src/config/game.ts scene array) [US-30]
- [ ] LevelSelectScene renders 5 level entries with three distinct visual states: locked (muted, non-interactive), unlocked (active, clickable), completed (checkmark/star indicator, clickable for replay) [US-30]
- [ ] Level 1 starts unlocked; levels 2-5 start locked; completing level N sets it to completed and sets level N+1 to unlocked [US-30]
- [ ] Level progress persisted to localStorage key `zombo_progress` as JSON — verified by: save progress, reload page, progress restored [US-30]
- [ ] Scene flow: TitleScene Play button → LevelSelectScene; LevelSelectScene level click → GameScene with selected level config; GameOverScene → LevelSelectScene (not back to GameScene) [US-30]
- [ ] LevelSelectScene level entries read as themed bedroom elements (toy boxes, numbered blocks, or shelf items) — not plain rectangles or generic UI buttons [US-30]
- [ ] Locked level entries do not respond to click/tap pointer events [US-30]
- [ ] `test/LevelProgress.test.ts` exists with >= 5 test cases covering: initial unlock state (L1 unlocked rest locked), completing L1 unlocks L2, completing L5 = all completed, localStorage round-trip persistence, replaying completed level does not change unlock state [US-30]

### US-31 — Defender unlocks and loadout

- [ ] Defender unlock map defined in config: L1 start = [shooter, generator, wall], completing L2 = +bomb, completing L3 = +mine [US-31]
- [ ] Unlock state persisted to localStorage key `zombo_unlocks` as JSON array of defender type keys — survives page reload [US-31]
- [ ] When unlocked defender count > 4, a loadout selection UI appears between level select and game start (can be a scene or overlay) [US-31]
- [ ] When unlocked defender count <= 4, loadout is auto-filled with all unlocked defenders and selection step is skipped entirely [US-31]
- [ ] Loadout UI shows each unlocked defender as a card with name and spark cost — selected cards have a distinct visual highlight [US-31]
- [ ] Maximum 4 defenders selectable in loadout — attempting to select a 5th is rejected (selection does not change) [US-31]
- [ ] "Go!" button is enabled only when >= 1 defender is selected; clicking it transitions to GameScene [US-31]
- [ ] GameScene HUD defender panel renders only the defenders from the active loadout, not the full defender registry [US-31]
- [ ] `test/LoadoutSelection.test.ts` exists with >= 5 test cases covering: auto-fill when <= 4 unlocked, selection cap at 4, toggle deselect, Go requires >= 1 selected, loadout array passed to GameScene [US-31]

### Structural

- [ ] AGENTS.md reflects new defender types (bomb, mine), enemy types (armored, jumper), level configs (LEVEL_1-LEVEL_5), new scene (LevelSelectScene), progression system (localStorage persistence), and loadout mechanic introduced in this phase [phase]

## AGENTS.md sections affected

- **Directory layout** — new scene file (LevelSelectScene.ts)
- **Game logic architecture** — new defender behaviors (single-use bomb/mine), new enemy behaviors (armor degradation, jump), level progression, loadout selection
- **Testing conventions** — new test files for single-use defenders, enemy types, level progress, loadout

## User documentation

N/A — this is a game. Mechanics are communicated through in-game UI, not external documentation.

## Golden principles (phase-relevant)

- Game logic separated from Phaser rendering — single-use trigger logic (arm timer, area damage calc, jump decision) lives in pure TS systems/config, testable without Phaser
- Config-driven entities — new defender and enemy types are config registry additions with interface extensions, not hardcoded scene logic
- no-silent-pass — all new test files must have unconditional assertions in every test case
- agents-consistency — AGENTS.md must reflect the shipped code state after this phase
