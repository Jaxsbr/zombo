---
status: concept
title: Tactical Depth — Distinct enemy behaviors, difficulty curve, extended content
origin: playtest-feedback-2026-04-06
---

# Tactical Depth

## Problem
The game lacks strategic decisions. Only the Sock Puppet (jumper) has unique behavior — Dust Bunny, Cleaning Robot, and Armored Bunny differ only in HP/speed/damage stats. One strategy (shooters + walls) wins everything. The difficulty cliff between L3 and L4 (jumper introduction with zero preparation) means younger players hit a wall while adults breeze through.

## Playtesting evidence
- Jaco: beats all 5 levels first try, no losses
- Daughter (8): breezes L1-3, can't beat L4+ (jumper cliff)
- Son (5): wins despite struggling with placement speed — pistol alone is enough
- PvZ comparison: each zombie type forces different defensive responses, creating replay value

## Proposed mechanics

### Rework existing enemy behaviors
Give each current enemy a distinct behavior beyond stats:
- **Dust Bunny:** Swarm behavior — spawns in groups, moves faster when no other enemies nearby (punishes ignoring stragglers)
- **Cleaning Robot:** Shield aura — blocks projectiles for enemies directly behind it in the same lane (forces front-line or area solutions)
- **Armored Bunny:** Charge — speeds up significantly when health drops below 50% (punishes slow-kill strategies)

### New enemy types (1-2)
Ideas that force genuinely different strategies:
- **Tunneler** — Burrows past front-line defenders, emerges mid-field (forces depth in defense, not just front-loading)
- **Splitter** — Divides into 2 weaker enemies on death (punishes single-target focus, rewards area control)
- **Caller** — Summons reinforcement enemies periodically (must be prioritized / killed fast)

### Difficulty curve rework
- Smooth L1→L5 progression: each level introduces ONE new mechanic
- More waves in later levels (L4: 5 waves, L5: 6 waves)
- Tighter economy in mid-game (force choices about where to invest)
- Fix L3→L4 cliff by introducing jumper earlier (L3) at lower intensity

### Extended levels (5→8)
- L6-L8 use full enemy roster with complex compositions
- Later levels genuinely hard — expected to cause losses and require replays
- Design for: 5yo enjoys L1-2, 8yo progresses through L1-5 with retries, adult faces real challenge in L6-8

## Architecture notes
- Enemy behaviors follow existing pattern: optional fields on EnemyType config + handling in EnemyMovement/Combat systems
- Pure TS systems, no Phaser dependencies in game logic
- Config-driven: new enemy types added to ENEMY_TYPES record
- 5x9 grid/lane model unchanged

## Design direction
Stay with toy-box developer art (geometric shapes). New behaviors communicated through movement patterns and visual cues (color, shape, animation).

## Dependency
None — can be built on current shipped state. Discovery-journal benefits from shipping after this (enemies need distinct behaviors worth explaining).
