# Phase: game-juice

Status: shipped

## Design direction

Same Toy Box aesthetic from game-feel — colorful, playful, developer-art quality. Animations should feel bouncy and toylike (springs, wobbles, pops, overshoots). Sound effects should be cartoony and satisfying (pops, squirts, chimes, boings) — all procedurally generated via Web Audio API, no external audio files. Bedroom atmosphere should make the grid feel like it exists in a room, not a void. Everything handcrafted/procedural — zero external assets.

## Stories

### US-19 — Entity animations and idle life

As a player, I want defenders and enemies to move, bob, and react during gameplay, so that the battlefield feels alive and fun to watch rather than a static diorama.

**Acceptance criteria:**
- Each defender type has a distinct idle animation loop (Water Pistol bobs, Jack-in-the-Box spring-wiggles, Block Tower sways)
- Water Pistol plays a recoil animation when firing a projectile
- Jack-in-the-Box plays a produce animation when generating income (lid bounces)
- Each enemy type has a distinct movement animation (Dust Bunny bounces/squashes, Cleaning Robot rocks/vibrates)
- All animations use Phaser tweens or timer-based property changes — no external sprite sheets

**User guidance:** N/A — visual enhancement, existing interaction model unchanged.

**Design rationale:** Static shapes are the single biggest contributor to the "dead" feeling. PvZ plants bob and sway even when idle. Adding tween-based motion transforms the field from a diagram into a toy box. Tweens are lightweight and match the bouncy toy aesthetic.

**Interaction model:** No change — animations are passive visual feedback on existing entities.

### US-20 — Hit reactions and death effects

As a player, I want satisfying visual feedback when things get hit, placed, and destroyed, so that my actions and combat outcomes feel impactful rather than numbers quietly changing.

**Acceptance criteria:**
- Enemies flash white briefly (100-200ms) when taking projectile damage
- Enemy death plays a particle burst effect (dust puff for Dust Bunny, sparks/bolts for Cleaning Robot) before removal
- Defender destruction plays a break/crumble effect before removal
- Placing a defender plays a pop/bounce-in animation (scale tween from 0 to overshoot to 1)
- Projectile impact shows a small splash/burst at the hit point
- Camera shakes subtly on final-wave announcement

**User guidance:** N/A — visual feedback enhancement, no new interaction.

**Design rationale:** "Game juice" — the visual payoff that makes actions satisfying. Without hit reactions, killing an enemy feels like deleting a spreadsheet row. PvZ reference: zombies flash white on hit, body parts detach with bounce, explosions are bright circles.

**Interaction model:** No change — reactive visual effects triggered by existing game events.

### US-21 — Procedural sound effects

As a player, I want to hear sounds when I place defenders, when they fire, when enemies get hit and die, and when I collect resources, so that the game has audio feedback that makes actions feel real.

**Acceptance criteria:**
- Defender placement plays a "pop" sound
- Water Pistol firing plays a "squirt" sound
- Projectile hitting an enemy plays an impact sound
- Enemy death plays a "poof" sound (different pitch/character per enemy type)
- Spark collection plays a chime sound (ascending pitch for rapid collection)
- Wave announcement plays a short alert stinger
- All sounds generated procedurally using Web Audio API (OscillatorNode, GainNode, noise buffers) — no external audio files
- A mute/unmute toggle is accessible from the game HUD
- SFX generation logic lives in a pure TypeScript module with no Phaser dependency

**User guidance:**
- Discovery: Mute toggle visible in HUD area
- Key steps: 1. Sounds play automatically during gameplay. 2. Click mute toggle to silence/restore all audio.

**Design rationale:** Audio is the other half of "game feel" that's completely absent. PvZ reference lists 10+ SFX categories — every action has audio feedback. Web Audio API generates cartoony sounds procedurally (oscillator sweeps for pops, filtered noise for puffs, sine chirps for chimes) without external files.

**Interaction model:** Audio is passive feedback for existing actions. New interaction: mute toggle — a single button in the HUD, same pattern as existing HUD elements.

### US-22 — Bedroom atmosphere

As a player, I want the game environment to look and feel like a bedroom with toys scattered around, so that the setting has personality and the screen is interesting even when no combat is happening.

**Acceptance criteria:**
- Furniture silhouettes are drawn along the top edge of the play area (minimum 2 distinct pieces: bookshelf, dresser/nightstand), in dark muted tones
- 3-5 decorative toy details are drawn on random grid cells at level start (small crayon, marble, building brick), not interfering with gameplay
- Floating dust mote particles (10-20 semi-transparent dots) drift across the play area continuously
- Title screen and game-over screen have bedroom-themed background elements (not just solid brown)
- All atmosphere elements are drawn behind gameplay entities and never obstruct grid cells, defenders, or enemies

**User guidance:** N/A — environmental visual enhancement, no interaction.

**Design rationale:** The current grid is brown tiles in a void. Title and game-over screens are solid brown with text. Adding environmental context transforms "abstract grid" into "bedroom floor" — the entire theme premise. Floating dust motes give the eye something to follow between waves. PvZ's lawn, fence, and house background serve the same purpose.

**Interaction model:** No interaction — purely visual decoration rendered at lower depth than gameplay.

### US-23 — Floating spark collection

As a player, I want sparks to float down from the top of the screen so I can tap them to collect resources, giving me something fun and rewarding to do during setup and between waves instead of just waiting.

**Acceptance criteria:**
- Spark tokens (small glowing shapes, visually distinct from projectiles and defenders) spawn at random horizontal positions above the grid and float downward
- Sparks appear during all wave states (setup, waiting, spawning)
- Clicking a spark token collects it, adding its value to the player's Sparks balance
- Collected sparks play a collection animation (arc toward HUD counter or particle burst) before removal
- Uncollected sparks that reach the bottom of the grid disappear without adding to balance
- The previous invisible passive income timer is replaced by spark token spawns
- Spark spawn rate and value are configurable, defaulting to approximately 25 value per spawn at one spawn every 8 seconds
- Generator income (Jack-in-the-Box) remains automatic and unchanged

**User guidance:**
- Discovery: Sparks visibly float down from the top of the screen during gameplay
- Key steps: 1. Watch for glowing spark tokens floating down. 2. Click/tap a spark to collect it and add to your Sparks balance. 3. Uncollected sparks disappear at the bottom — don't miss them!

**Design rationale:** PvZ's sun collection is one of its most engaging micro-interactions — constant low-effort, high-reward activity filling gaps between strategic decisions. The current invisible passive income ("every 8s, balance += 25") is a missed engagement opportunity. Making it visible and clickable transforms dead air into "grab that spark!" moments. Generator income stays automatic because the Jack-in-the-Box's income IS its power.

**Interaction model:** New input — clicking/tapping floating spark tokens on the play field. Same click-to-collect pattern as PvZ's sun tokens. Does NOT conflict with grid cell clicks: sparks float above grid as separate interactive game objects with their own hit zones. Sparks are small targets (~20-24px) that only register on direct hit. Grid cells remain clickable for defender placement as before.

## Done-when (observable)

- [x] Water Pistol defender has a visible idle animation loop (continuous bobbing tween) when placed on the grid [US-19]
- [x] Jack-in-the-Box defender has a visible idle animation loop (spring wiggle or lid bounce tween) when placed on the grid [US-19]
- [x] Block Tower defender has a visible idle animation loop (subtle sway tween) when placed on the grid [US-19]
- [x] Water Pistol plays a recoil animation (brief position/scale kick and return tween) each time it fires a projectile [US-19]
- [x] Jack-in-the-Box plays a produce animation (lid bounce or body pulse tween) each time generator income ticks [US-19]
- [x] Dust Bunny enemy has a visible movement animation (bouncing vertical offset or squash-stretch) as it advances [US-19]
- [x] Cleaning Robot enemy has a visible movement animation (rocking or vibrating motion) as it advances [US-19]
- [x] All animations use Phaser tweens or timer-based transforms — no external sprite sheet or image files exist in the project [US-19]
- [x] Enemy entities flash white (tint change to 0xffffff) for 100-200ms when taking projectile damage [US-20]
- [x] Dust Bunny death triggers a particle burst (dust-colored particles expanding outward) at the enemy's position before entity removal [US-20]
- [x] Cleaning Robot death triggers a particle burst (spark/bolt-colored particles) at the enemy's position before entity removal [US-20]
- [x] Defender destruction triggers a visual break effect (fade + scale-down or particle scatter) at the defender's position before entity removal [US-20]
- [x] Placing a defender plays a bounce-in animation (scale tween from ~0.3 to ~1.1 overshoot to 1.0) [US-20]
- [x] Projectile impact shows a small visual burst (expanding circle or particle puff) at the hit point [US-20]
- [x] Camera shakes (1-2px amplitude, 200-500ms duration) when the final-wave announcement triggers [US-20]
- [x] `src/systems/SFX.ts` exists and exports sound-trigger functions using Web Audio API (OscillatorNode/GainNode) with no Phaser audio dependency [US-21]
- [x] Defender placement code path calls the SFX placement sound function [US-21]
- [x] Water Pistol fire code path calls the SFX fire sound function [US-21]
- [x] Projectile-hit code path calls the SFX impact sound function [US-21]
- [x] Enemy death code path calls the SFX death sound function, with different parameters for basic vs tough enemy keys [US-21]
- [x] Spark collection code path calls the SFX chime sound function [US-21]
- [x] Wave announcement code path calls the SFX alert/stinger sound function [US-21]
- [x] A mute/unmute toggle is rendered in the HUD and toggling it sets a flag that suppresses all SFX.play calls [US-21]
- [x] `npm test` exits 0 — SFX module creates AudioContext lazily (not on import), so tests pass in Node environment [US-21]
- [x] Furniture silhouette shapes (minimum 2 distinct pieces) are rendered along the top edge of the play area, at depth lower than gameplay entities [US-22]
- [x] 3-5 decorative toy detail shapes are rendered on grid cells at level start, at depth lower than defenders and enemies [US-22]
- [x] Floating dust mote particles (10-20 semi-transparent dots/circles) drift across the play area continuously during gameplay [US-22]
- [x] TitleScene renders bedroom-themed background elements beyond a solid color fill [US-22]
- [x] GameOverScene renders bedroom-themed background elements beyond a solid color fill [US-22]
- [x] No atmosphere element has depth >= defender/enemy entity depth, and no atmosphere element receives pointer input that could block grid clicks [US-22]
- [x] Spark token game objects spawn at random x positions above the grid and move downward via position update in the game loop [US-23]
- [x] Clicking a spark token adds its value to the Economy balance and removes the token from the scene [US-23]
- [x] Collected sparks play a visible collection animation (arc tween toward HUD counter position, or expanding particle burst) before final removal [US-23]
- [x] Uncollected sparks that pass below the grid bottom (y > grid bottom edge) are removed without adding to balance [US-23]
- [x] The previous passive income timer (`PASSIVE_INCOME_INTERVAL` / `PASSIVE_INCOME_AMOUNT` addEvent in GameScene.create) is removed or disabled [US-23]
- [x] Spark spawn rate and value are defined as named constants or a config object (not magic numbers inline) [US-23]
- [x] Generator income (Jack-in-the-Box `generatesIncome` ticks) remains automatic and functions identically to pre-phase behavior [US-23]
- [x] Spark tokens are visually distinct from projectiles (different color palette, shape, or glow effect — not yellow circles) [US-23]
- [x] All active tweens, particle emitters, and spark tokens are cleaned up on scene transition — no orphaned animations or objects persist after GameScene ends [phase]
- [x] AGENTS.md reflects new SFX module, entity animation system, spark collection mechanic, and bedroom atmosphere rendering [phase]
- [x] All existing tests pass after all changes (`npm test` exits 0) [phase]

## Auto-added safety criteria

No new API endpoints, user text input fields, or query interpolation introduced in this phase. All interactions are click-based game mechanics (spark collection, mute toggle, existing grid placement). No safety criteria required.

## Golden principles (phase-relevant)
- **Game logic separated from Phaser rendering** — SFX module is pure TS (Web Audio API, no Phaser), animation triggers live in entity/scene code but don't pollute system logic modules
- **Config-driven entities** — spark spawn rate/value, animation parameters driven by constants/config, not hardcoded in scene code
- **Tests run without Phaser** — SFX module uses lazy AudioContext so it doesn't break Node-based Vitest; existing system tests remain Phaser-free

## AGENTS.md sections affected by this phase
- Directory layout (`src/systems/SFX.ts` new module, `src/entities/SparkEntity.ts` likely new)
- Game logic architecture (SFX system, spark collection mechanic, entity animation descriptions)
- Testing conventions (SFX module testability note — lazy AudioContext)

## User documentation impact
No user manual exists for this project. No user guide needed — this is a game, not a tool. The game itself is the documentation. Skip justified: game for kids, all interactions are self-evident (click sparks, click grid, click mute).
