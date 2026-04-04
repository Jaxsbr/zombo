## Phase goal

Expand the unit roster with two new single-use defenders (Teddy Bomb, Marble Mine) and two new enemy types (Armored Bunny, Sock Puppet), then introduce a 5-level progression structure with a level select scene, localStorage persistence, and a pre-level loadout selection screen.

### Dependencies
- game-juice

### Stories in scope
- US-28 — Two new single-use defenders: Teddy Bomb and Marble Mine
- US-29 — Two new enemy types: Armored Bunny and Sock Puppet
- US-30 — Multi-level structure with level select
- US-31 — Defender unlock progression and pre-level loadout

### Done-when (observable)
- [x] `src/config/defenders.ts` exports `bomb` and `mine` entries; DefenderType interface extended with at least a `singleUse: boolean` field and a `behavior` field to distinguish bomb/mine/shooter/wall logic [US-28]
- [x] Teddy Bomb config: cost=150, singleUse=true; on placement, all enemies within Chebyshev distance 1 of the bomb cell (up to 3x3 area) receive damage >= max enemy health (lethal), then the bomb defender is removed from the grid [US-28]
- [x] Teddy Bomb: enemies outside the 3x3 area centered on the bomb cell take zero damage [US-28]
- [x] Marble Mine config: cost=25, singleUse=true; spawns with armed=false, transitions to armed=true after MINE_ARM_DELAY (~10000ms) [US-28]
- [x] Marble Mine: when armed and an enemy's grid cell matches the mine's cell, deals damage >= max enemy health (lethal) to that enemy, then the mine is removed from the grid [US-28]
- [x] Marble Mine: while dormant (armed=false), enemy entering the mine's cell does NOT trigger the mine — enemy walks past [US-28]
- [x] Marble Mine does not block enemy movement — enemies advance through the mine's cell regardless of armed state; only the damage trigger fires when armed [US-28]
- [x] DefenderEntity.ts draws distinct procedural Graphics shapes for bomb (round red teddy with star/fuse detail) and mine (cluster of coloured marbles); Teddy Bomb reads as an explosive toy — visually distinct from the three existing persistent defenders [US-28]
- [x] Teddy Bomb placement triggers an expanding burst animation (scale + alpha tween) before removal [US-28]
- [x] Marble Mine visual state change: dormant = grey/muted appearance, armed = bright/glowing with subtle pulse tween [US-28]
- [x] Recharge timers: bomb rechargeTime >= 45000ms, mine rechargeTime >= 25000ms; defender HUD card shows cooldown overlay between placements [US-28]
- [x] `test/SingleUseDefenders.test.ts` exists with >= 8 test cases covering: bomb area damage in range, bomb zero damage out of range, bomb self-destruct after detonation, mine dormant no-trigger, mine arm timing, mine armed trigger kills enemy, mine self-destruct after trigger, mine does not block movement [US-28]
- [ ] `src/config/enemies.ts` exports `armored` and `jumper` entries with correct stats: armored health=300 speed=0.5, jumper health=150 speed=0.35 [US-29]
- [ ] Armored Bunny health equals exactly 3 * ENEMY_TYPES.basic.health; speed equals ENEMY_TYPES.basic.speed [US-29]
- [ ] Sock Puppet jump logic: when movement advances into a cell occupied by a defender and jumpsRemaining > 0, the enemy skips that cell (advances to the cell one past the defender), decrements jumpsRemaining to 0, and continues walking [US-29]
- [ ] Sock Puppet with jumpsRemaining=0 does NOT jump — interacts with defenders normally (blocks, takes/deals damage) [US-29]
- [ ] Sock Puppet walks the entire lane normally if no defender is encountered [US-29]
- [ ] EnemyEntity.ts draws distinct procedural Graphics shapes: armored = Dust Bunny silhouette with toy helmet on top, jumper = elongated sock shape with googly-eye circles; Armored Bunny reads as a tougher Dust Bunny — the helmet is the dominant visual differentiator [US-29]
- [ ] Armored Bunny helmet visual degrades: full helmet at > 50% health, cracked/partial helmet at 25-50% health, no helmet (bare Dust Bunny shape) at < 25% health [US-29]
- [ ] Sock Puppet jump renders as a visible arc tween (y-offset parabola over ~400ms) when triggered [US-29]
- [ ] `test/EnemyTypes.test.ts` exists with >= 6 test cases covering: armored health = 3x basic, armored speed = basic speed, jumper skips defender cell, jumper no-skip after jump used, jumper no-skip when no defender in path, jumper normal interaction after jump spent [US-29]
- [ ] `src/config/levels.ts` exports LEVEL_1 through LEVEL_5 with escalating configs: L1=3 waves basic only, L2=3 waves basic+armored, L3=4 waves basic+armored, L4=4 waves basic+armored+jumper, L5=5 waves all enemy types with multi-lane pressure [US-30]
- [ ] `src/scenes/LevelSelectScene.ts` exists and is registered in the Phaser game config (src/config/game.ts scene array) [US-30]
- [ ] LevelSelectScene renders 5 level entries with three distinct visual states: locked (muted, non-interactive), unlocked (active, clickable), completed (checkmark/star indicator, clickable for replay) [US-30]
- [ ] Level 1 starts unlocked; levels 2-5 start locked; completing level N sets it to completed and sets level N+1 to unlocked [US-30]
- [ ] Level progress persisted to localStorage key `zombo_progress` as JSON — verified by: save progress, reload page, progress restored [US-30]
- [ ] Scene flow: TitleScene Play button → LevelSelectScene; LevelSelectScene level click → GameScene with selected level config; GameOverScene → LevelSelectScene (not back to GameScene) [US-30]
- [ ] LevelSelectScene level entries read as themed bedroom elements (toy boxes, numbered blocks, or shelf items) — not plain rectangles or generic UI buttons [US-30]
- [ ] Locked level entries do not respond to click/tap pointer events [US-30]
- [ ] `test/LevelProgress.test.ts` exists with >= 5 test cases covering: initial unlock state (L1 unlocked rest locked), completing L1 unlocks L2, completing L5 = all completed, localStorage round-trip persistence, replaying completed level does not change unlock state [US-30]
- [ ] Defender unlock map defined in config: L1 start = [shooter, generator, wall], completing L2 = +bomb, completing L3 = +mine [US-31]
- [ ] Unlock state persisted to localStorage key `zombo_unlocks` as JSON array of defender type keys — survives page reload [US-31]
- [ ] When unlocked defender count > 4, a loadout selection UI appears between level select and game start (can be a scene or overlay) [US-31]
- [ ] When unlocked defender count <= 4, loadout is auto-filled with all unlocked defenders and selection step is skipped entirely [US-31]
- [ ] Loadout UI shows each unlocked defender as a card with name and spark cost — selected cards have a distinct visual highlight [US-31]
- [ ] Maximum 4 defenders selectable in loadout — attempting to select a 5th is rejected (selection does not change) [US-31]
- [ ] "Go!" button is enabled only when >= 1 defender is selected; clicking it transitions to GameScene [US-31]
- [ ] GameScene HUD defender panel renders only the defenders from the active loadout, not the full defender registry [US-31]
- [ ] `test/LoadoutSelection.test.ts` exists with >= 5 test cases covering: auto-fill when <= 4 unlocked, selection cap at 4, toggle deselect, Go requires >= 1 selected, loadout array passed to GameScene [US-31]
- [ ] AGENTS.md reflects new defender types (bomb, mine), enemy types (armored, jumper), level configs (LEVEL_1-LEVEL_5), new scene (LevelSelectScene), progression system (localStorage persistence), and loadout mechanic introduced in this phase [phase]

### Golden principles (phase-relevant)
- Game logic separated from Phaser rendering — single-use trigger logic (arm timer, area damage calc, jump decision) lives in pure TS systems/config, testable without Phaser
- Config-driven entities — new defender and enemy types are config registry additions with interface extensions, not hardcoded scene logic
- no-silent-pass — all new test files must have unconditional assertions in every test case
- agents-consistency — AGENTS.md must reflect the shipped code state after this phase
