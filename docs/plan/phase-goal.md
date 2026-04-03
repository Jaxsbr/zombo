## Phase goal

Research and document PvZ1's game design — plants, zombies, levels, core systems, art/audio direction — to build a comprehensive reference library for designing Zombo's own mechanics. Culminates in 2 creative spin-off proposals for differentiation.

### Stories in scope
- US-01 — Plant catalogue
- US-02 — Zombie catalogue
- US-03 — Level and map reference
- US-04 — Game systems reference
- US-05 — Art and audio direction reference
- US-06 — Creative spin-off proposals

### Done-when (observable)
- [x] `docs/reference/plants.md` exists and contains a table with columns: Name, Cost (sun), Recharge, Damage/Effect, Range, Unlock-level — minimum 30 plant entries covering all PvZ1 plants [US-01]
- [x] Each plant entry includes a 1-2 sentence behaviour description (e.g., "Fires peas in a straight line at regular intervals") [US-01]
- [x] `docs/reference/zombies.md` exists and contains a table with columns: Name, Health, Speed, Special-ability, First-appears — minimum 20 zombie entries covering all PvZ1 zombie types [US-02]
- [x] Each zombie entry includes a 1-2 sentence behaviour description and known counters [US-02]
- [x] `docs/reference/levels.md` exists and documents all PvZ1 level types with columns: World, Level-range, Grid-layout (rows x cols), Day/Night, Special-mechanic — covering at minimum: Day, Night, Pool, Fog, Roof [US-03]
- [x] Each level type entry includes a description of unique mechanics (e.g., "Night levels: no passive sun production, mushrooms are free to plant") [US-03]
- [ ] `docs/reference/systems.md` exists and documents: sun economy (generation rates, starting sun, sun drop values), wave/round structure (wave count per level, zombie spawn timing, flag waves), and progression unlocks (what unlocks after which level) [US-04]
- [ ] `docs/reference/systems.md` includes a wave timing section with at minimum: initial delay, wave interval range, flag wave frequency, and final wave indicator [US-04]
- [ ] `docs/reference/systems.md` includes a Crazy Dave section documenting his role (shop, tutorials, hints) and when he appears [US-04]
- [ ] `docs/reference/art-and-audio.md` exists and describes the PvZ1 visual style (colour palette feel, character design language, animation style, UI aesthetic) in sufficient detail to serve as an AI image-generation style brief [US-05]
- [ ] `docs/reference/art-and-audio.md` includes a music/sound section describing the audio tone, key tracks (e.g., "Grasswalk" main theme), and sound effect categories [US-05]
- [ ] `docs/reference/spinoff-ideas.md` exists and contains exactly 2 creative spin-off proposals [US-06]
- [ ] Each spin-off proposal includes: title, 1-paragraph concept pitch, 3+ unique mechanics that differentiate it from PvZ, target audience note, and a "why kids will love it" sentence [US-06]
- [ ] All files in `docs/reference/` use consistent markdown formatting (tables render correctly, no broken links) [phase]

### Golden principles (phase-relevant)
- no-silent-pass (every research file must have substantive content, not placeholder stubs)
- agents-consistency (AGENTS.md should reflect the new docs/reference/ directory when this phase ships)
