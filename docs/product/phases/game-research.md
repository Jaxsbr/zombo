# Phase: game-research

Status: shipped

## Stories

### US-01 — Plant catalogue

As a game designer, I want a comprehensive catalogue of all PvZ1 plants with their stats and behaviours, so that I can reference them when designing Zombo's defender units.

**Acceptance criteria:**
- Catalogue covers all PvZ1 plants (minimum 30 entries)
- Each entry includes: Name, Cost (sun), Recharge time, Damage/Effect, Range, Unlock-level, and a 1-2 sentence behaviour description

**User guidance:** N/A — internal reference document

**Design rationale:** A flat table with behaviour descriptions is the simplest format for an AI agent to consume during future game-design phases. No need for hierarchical grouping at this stage.

### US-02 — Zombie catalogue

As a game designer, I want a comprehensive catalogue of all PvZ1 zombie types with their stats and counters, so that I can reference them when designing Zombo's enemy units and balancing.

**Acceptance criteria:**
- Catalogue covers all PvZ1 zombie types (minimum 20 entries)
- Each entry includes: Name, Health, Speed, Special-ability, First-appears, behaviour description, and known counters

**User guidance:** N/A — internal reference document

**Design rationale:** Including known counters per zombie links the plant and zombie catalogues implicitly, which will be valuable for balancing Zombo's own units.

### US-03 — Level and map reference

As a game designer, I want a reference of all PvZ1 level types and their unique mechanics, so that I can design Zombo levels that start familiar but diverge creatively.

**Acceptance criteria:**
- Documents all PvZ1 world types: Day, Night, Pool, Fog, Roof (minimum)
- Each entry includes: World name, Level-range, Grid-layout (rows x cols), Day/Night, Special-mechanic, and a description of unique mechanics

**User guidance:** N/A — internal reference document

**Design rationale:** Level mechanics (fog, pool lanes, roof trajectory) are the primary design levers for differentiation. Documenting them structurally makes it easy to identify which to keep, remix, or replace.

### US-04 — Game systems reference

As a game designer, I want a reference of PvZ1's core systems (sun economy, wave structure, progression, Crazy Dave), so that I can calibrate Zombo's pacing and difficulty curve.

**Acceptance criteria:**
- Documents sun economy: generation rates, starting sun, sun drop values
- Documents wave/round structure: wave count per level, spawn timing, flag waves, final wave indicator
- Documents progression unlocks: what unlocks after which level
- Documents Crazy Dave's role: shop, tutorials, hints, appearance triggers

**User guidance:** N/A — internal reference document

**Design rationale:** Systems documentation is grouped in one file because sun economy, wave pacing, and progression are tightly coupled in PvZ — separating them would lose the interplay context.

### US-05 — Art and audio direction reference

As a game designer, I want a description of PvZ1's visual and audio style, so that I can brief AI tools for asset generation in Zombo's own aesthetic.

**Acceptance criteria:**
- Describes visual style: colour palette feel, character design language, animation style, UI aesthetic — in enough detail to serve as an AI image-generation style brief
- Describes audio tone: key tracks, sound effect categories, musical mood

**User guidance:** N/A — internal reference document

**Design rationale:** Textual descriptions rather than stored assets avoid copyright issues while still providing enough direction for AI-assisted art generation.

### US-06 — Creative spin-off proposals

As a game designer, I want 2 creative spin-off direction proposals, so that the team can choose a differentiation path for Zombo before starting game development.

**Acceptance criteria:**
- Exactly 2 proposals, each with: title, concept pitch, 3+ unique differentiating mechanics, target audience note, and a "why kids will love it" sentence
- Proposals are distinct from each other in theme and mechanics

**User guidance:** N/A — internal reference document

**Design rationale:** Two proposals gives a meaningful choice without decision paralysis. Each must stand on its own mechanics rather than just being a PvZ reskin.

## Done-when (observable)

- [ ] `docs/reference/plants.md` exists and contains a table with columns: Name, Cost (sun), Recharge, Damage/Effect, Range, Unlock-level — minimum 30 plant entries covering all PvZ1 plants [US-01]
- [ ] Each plant entry includes a 1-2 sentence behaviour description (e.g., "Fires peas in a straight line at regular intervals") [US-01]
- [ ] `docs/reference/zombies.md` exists and contains a table with columns: Name, Health, Speed, Special-ability, First-appears — minimum 20 zombie entries covering all PvZ1 zombie types [US-02]
- [ ] Each zombie entry includes a 1-2 sentence behaviour description and known counters [US-02]
- [ ] `docs/reference/levels.md` exists and documents all PvZ1 level types with columns: World, Level-range, Grid-layout (rows x cols), Day/Night, Special-mechanic — covering at minimum: Day, Night, Pool, Fog, Roof [US-03]
- [ ] Each level type entry includes a description of unique mechanics (e.g., "Night levels: no passive sun production, mushrooms are free to plant") [US-03]
- [ ] `docs/reference/systems.md` exists and documents: sun economy (generation rates, starting sun, sun drop values), wave/round structure (wave count per level, zombie spawn timing, flag waves), and progression unlocks (what unlocks after which level) [US-04]
- [ ] `docs/reference/systems.md` includes a wave timing section with at minimum: initial delay, wave interval range, flag wave frequency, and final wave indicator [US-04]
- [ ] `docs/reference/systems.md` includes a Crazy Dave section documenting his role (shop, tutorials, hints) and when he appears [US-04]
- [ ] `docs/reference/art-and-audio.md` exists and describes the PvZ1 visual style (colour palette feel, character design language, animation style, UI aesthetic) in sufficient detail to serve as an AI image-generation style brief [US-05]
- [ ] `docs/reference/art-and-audio.md` includes a music/sound section describing the audio tone, key tracks (e.g., "Grasswalk" main theme), and sound effect categories [US-05]
- [ ] `docs/reference/spinoff-ideas.md` exists and contains exactly 2 creative spin-off proposals [US-06]
- [ ] Each spin-off proposal includes: title, 1-paragraph concept pitch, 3+ unique mechanics that differentiate it from PvZ, target audience note, and a "why kids will love it" sentence [US-06]
- [ ] All files in `docs/reference/` use consistent markdown formatting (tables render correctly, no broken links) [phase]

## Golden principles (phase-relevant)
- no-silent-pass (every research file must have substantive content, not placeholder stubs)
- agents-consistency (AGENTS.md should reflect the new docs/reference/ directory when this phase ships)
