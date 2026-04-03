# Phase: game-feel

Status: draft

## Design direction

Toy box — colorful, playful, developer-art quality. Thick outlines, bright primary colors, recognizable toy shapes drawn with Phaser Graphics API (no external image assets). Oversized distinguishing features for readability at 64×64 cell size (Water Pistol has visible nozzle/trigger, Block Tower is stacked colored blocks, Dust Bunny is a fluffy blob with eyes). Bedroom carpet grid in warm browns/tans. Dark wood-toned HUD panel.

## Stories

### US-15 — Toy Box Siege developer art

As a player, I want defenders, enemies, and the environment to look like toys in a bedroom, so that the game has visual identity and feels like something real rather than a canvas tutorial.

**Acceptance criteria:**
- Each defender type has a distinct, recognizable shape drawn with Phaser Graphics (not plain colored rectangles): Water Pistol (shooter), Jack-in-the-Box (generator), Block Tower (wall)
- Each enemy type has a distinct, recognizable shape (not plain colored circles): Dust Bunny (basic), Cleaning Robot (tough)
- Grid tiles use bedroom carpet colors (warm browns/tans, not lawn green)
- HUD uses themed labels ("Sparks" not "Energy") and toy-themed styling
- Config names match Toy Box Siege theme throughout

**User guidance:** N/A — visual change, existing interaction model unchanged.

**Design rationale:** Developer art using Phaser Graphics API only (no external image assets). Shapes must be recognizable at 64×64 cell size — thick outlines, bright fills, oversized distinguishing features. This is not the final art pass but it must be clearly more than colored rectangles. Each unit type needs a different shape silhouette (not just different colors of the same shape) so players can distinguish types at a glance.

**Interaction model:** Same as existing — click panel card to select defender, click grid cell to place. No interaction change.

### US-16 — Wave pacing and escalation

As a player, I want a setup period before enemies arrive and gradual wave escalation, so that I can build my economy and defenses before pressure increases, matching the PvZ gameplay rhythm.

**Acceptance criteria:**
- Game starts with a setup period (20-30 seconds) before the first enemy appears
- Inter-wave delays (15-20 seconds) between waves give the player breathing room to build
- Wave 1 is gentle: 1-2 slow Dust Bunnies, economy-building time
- Wave 2 increases pressure: 3-4 mixed enemies testing basic defense
- Wave 3 is the real test: 5-6 enemies including Cleaning Robots, multi-lane pressure — under-prepared players lose here
- Enemies within a wave spawn staggered (1-3 second delays), not all at once
- WaveManager exposes typed wave state for UI consumption

**User guidance:** N/A — pacing change, no new user interaction.

**Design rationale:** PvZ's pacing is the core of its fun — setup time creates anticipation, inter-wave pauses create relief/planning moments, and escalation creates tension. The current game spawns all waves back-to-back with no gaps, producing stress instead of enjoyment.

**Interaction model:** No change — player places defenders during setup and inter-wave pauses naturally.

### US-17 — Wave progress and announcements

As a player, I want to see wave progress and get warnings before waves arrive, so that I know what's coming and feel the tension build.

**Acceptance criteria:**
- Wave progress indicator visible showing current wave and total waves
- Text announcement appears on screen before each wave (visible for 2-3 seconds before enemies spawn)
- Final wave has a distinct, more dramatic announcement
- Progress indicator updates between waves

**User guidance:** N/A — display-only feedback, no interaction required.

**Design rationale:** PvZ's flag progress bar and "a huge wave of zombies is approaching!" text are key to the tension/release loop. Without visible progress, waves blur together and there's no sense of stakes or progression.

### US-18 — Scene flow and transitions

As a player, I want a title screen and smooth transitions between game states, so the game feels complete rather than dumping me straight into gameplay.

**Acceptance criteria:**
- Title scene is the first scene on launch, shows "Toy Box Siege" and a "Play" button
- Scene transitions use visual effects (camera fade or equivalent), not instant scene swaps
- Game over scene shows themed win/lose messaging with a "Play Again" button
- Restarting via "Play Again" resets all game state cleanly (no stale state)

**User guidance:**
- Discovery: Player launches the game and sees the title screen
- Key steps: 1. Click "Play" on title screen. 2. Play the game. 3. See win/lose result on game-over screen. 4. Click "Play Again" to restart.

**Design rationale:** The current game starts mid-action with no context and ends with plain monospace text — no bookends. A minimal title screen and transitions create the feeling of a complete game loop, which is the minimum bar for "worth building."

## Done-when (observable)

- [ ] `src/config/defenders.ts` exports defender types with Toy Box Siege names: "Water Pistol", "Jack-in-the-Box", "Block Tower" [US-15]
- [ ] `src/config/enemies.ts` exports enemy types with Toy Box Siege names: "Dust Bunny", "Cleaning Robot" [US-15]
- [ ] DefenderEntity contains distinct rendering code paths per defender key — each key draws a different shape composition (not just a color variation of the same fillRect) [US-15]
- [ ] EnemyEntity contains distinct rendering code paths per enemy key — each key draws a different shape composition (not just a color variation of the same fillCircle) [US-15]
- [ ] Grid `drawGrid()` uses bedroom carpet palette — fillStyle hex values are in the brown/tan range, not green [US-15]
- [ ] HUD displays "Sparks" label instead of "Energy" [US-15]
- [ ] All existing tests pass after theme renaming (`npm test` exits 0) [US-15]
- [ ] WaveManager accepts a `setupDelay` config parameter (seconds before first wave) with default >= 20 [US-16]
- [ ] WaveManager accepts an `interWaveDelay` config parameter (seconds between waves) with default >= 15 [US-16]
- [ ] WaveManager.update() returns no spawns during setup and inter-wave delay periods [US-16]
- [ ] WaveManager exposes a `waveState` property with values from set: setup, announcing, spawning, waiting, complete [US-16]
- [ ] LEVEL_1 config wave 1 has <= 2 spawns, all basic (Dust Bunny) type [US-16]
- [ ] LEVEL_1 config wave 2 has 3-4 spawns with mixed enemy types [US-16]
- [ ] LEVEL_1 config wave 3 has 5-6 spawns including >= 2 tough (Cleaning Robot) across >= 3 different lanes [US-16]
- [ ] Unit tests verify: setup delay holds spawns, inter-wave delay holds spawns, wave state transitions through all states correctly (`npm test` exits 0) [US-16]
- [ ] GameScene renders a wave progress indicator showing current wave number and total waves [US-17]
- [ ] A text announcement (themed, e.g. "Dust bunnies incoming!") appears on screen during the announcing wave state, displayed for >= 2 seconds before spawning begins [US-17]
- [ ] The final wave announcement uses distinct text different from earlier waves (e.g., "A HUGE mess is coming!") [US-17]
- [ ] Wave progress indicator updates to reflect current wave number after each wave completes [US-17]
- [ ] `src/scenes/TitleScene.ts` exists and is registered as the first scene in the Phaser game config [US-18]
- [ ] TitleScene displays "Toy Box Siege" text and a clickable "Play" element [US-18]
- [ ] Transitions between TitleScene -> GameScene and GameScene -> GameOverScene use Phaser camera fade (or equivalent visual effect), not bare `scene.start()` [US-18]
- [ ] GameOverScene displays themed text ("Fort Defended!" on win, "The Mess Wins!" on loss) and a "Play Again" button with transition [US-18]
- [ ] Restarting via "Play Again" resets all game state — a second playthrough behaves identically to the first (no stale defenders, enemies, or timers) [US-18]
- [ ] AGENTS.md reflects Toy Box Siege theme, new TitleScene, WaveManager wave-state system, and updated entity rendering descriptions [phase]

## Golden principles (phase-relevant)
- **Game logic separated from Phaser rendering** — wave state logic (setup delay, inter-wave delay, state machine) lives in WaveManager (pure TS, testable), visual announcements and progress bar live in GameScene
- **Config-driven entities** — Toy Box Siege theme names and properties defined in config registries, entity rendering dispatches on config keys
- **Tests run without Phaser** — wave state tests use Vitest with node environment, no browser required for logic tests
