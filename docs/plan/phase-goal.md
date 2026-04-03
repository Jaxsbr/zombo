## Phase goal

Add game juice — entity animations, hit reactions, procedural sound effects, bedroom atmosphere, and floating spark collection — to transform the functional Toy Box Siege prototype into a game that feels alive, sounds satisfying, and has environmental personality.

### Stories in scope
- US-19 — Entity animations and idle life
- US-20 — Hit reactions and death effects
- US-21 — Procedural sound effects
- US-22 — Bedroom atmosphere
- US-23 — Floating spark collection

### Done-when (observable)
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
- [ ] `src/systems/SFX.ts` exists and exports sound-trigger functions using Web Audio API (OscillatorNode/GainNode) with no Phaser audio dependency [US-21]
- [ ] Defender placement code path calls the SFX placement sound function [US-21]
- [ ] Water Pistol fire code path calls the SFX fire sound function [US-21]
- [ ] Projectile-hit code path calls the SFX impact sound function [US-21]
- [ ] Enemy death code path calls the SFX death sound function, with different parameters for basic vs tough enemy keys [US-21]
- [ ] Spark collection code path calls the SFX chime sound function [US-21]
- [ ] Wave announcement code path calls the SFX alert/stinger sound function [US-21]
- [ ] A mute/unmute toggle is rendered in the HUD and toggling it sets a flag that suppresses all SFX.play calls [US-21]
- [ ] `npm test` exits 0 — SFX module creates AudioContext lazily (not on import), so tests pass in Node environment [US-21]
- [x] Furniture silhouette shapes (minimum 2 distinct pieces) are rendered along the top edge of the play area, at depth lower than gameplay entities [US-22]
- [x] 3-5 decorative toy detail shapes are rendered on grid cells at level start, at depth lower than defenders and enemies [US-22]
- [x] Floating dust mote particles (10-20 semi-transparent dots/circles) drift across the play area continuously during gameplay [US-22]
- [x] TitleScene renders bedroom-themed background elements beyond a solid color fill [US-22]
- [x] GameOverScene renders bedroom-themed background elements beyond a solid color fill [US-22]
- [x] No atmosphere element has depth >= defender/enemy entity depth, and no atmosphere element receives pointer input that could block grid clicks [US-22]
- [ ] Spark token game objects spawn at random x positions above the grid and move downward via position update in the game loop [US-23]
- [ ] Clicking a spark token adds its value to the Economy balance and removes the token from the scene [US-23]
- [ ] Collected sparks play a visible collection animation (arc tween toward HUD counter position, or expanding particle burst) before final removal [US-23]
- [ ] Uncollected sparks that pass below the grid bottom (y > grid bottom edge) are removed without adding to balance [US-23]
- [ ] The previous passive income timer (`PASSIVE_INCOME_INTERVAL` / `PASSIVE_INCOME_AMOUNT` addEvent in GameScene.create) is removed or disabled [US-23]
- [ ] Spark spawn rate and value are defined as named constants or a config object (not magic numbers inline) [US-23]
- [ ] Generator income (Jack-in-the-Box `generatesIncome` ticks) remains automatic and functions identically to pre-phase behavior [US-23]
- [ ] Spark tokens are visually distinct from projectiles (different color palette, shape, or glow effect — not yellow circles) [US-23]
- [ ] All active tweens, particle emitters, and spark tokens are cleaned up on scene transition — no orphaned animations or objects persist after GameScene ends [phase]
- [ ] AGENTS.md reflects new SFX module, entity animation system, spark collection mechanic, and bedroom atmosphere rendering [phase]
- [ ] All existing tests pass after all changes (`npm test` exits 0) [phase]

### Golden principles (phase-relevant)
- **Game logic separated from Phaser rendering** — SFX module is pure TS (Web Audio API, no Phaser), animation triggers live in entity/scene code but don't pollute system logic modules
- **Config-driven entities** — spark spawn rate/value, animation parameters driven by constants/config, not hardcoded in scene code
- **Tests run without Phaser** — SFX module uses lazy AudioContext so it doesn't break Node-based Vitest; existing system tests remain Phaser-free
