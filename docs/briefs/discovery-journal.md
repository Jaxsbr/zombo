---
status: concept
title: Discovery Journal — Toy and enemy lookup menu
origin: playtest-feedback-2026-04-06
---

# Discovery Journal

## Problem
After guided-intro teaches mechanics one at a time, players have no way to revisit what they've learned. No reference for toy costs, enemy behaviors, or strategic tips.

## Proposed mechanics

### Lookup menu (persistent)
A menu accessible from TitleScene or LevelSelectScene where the player can browse all discovered toys and enemies. Shows bio, stats, and tips. Only discovered entries are visible — locked entries show silhouettes ("???"). Creates a collection/completionist incentive.

### Enemy bios
Each enemy type gets a short bio + behavior description. Unlocked on first encounter (tracked in localStorage). Pre-level "enemy intel" screen when a level introduces a never-seen enemy type.

## Design questions
- Does the lookup menu need a dedicated scene, or can it be an overlay?
- Should enemy bios be unlocked on first encounter or first kill?
- How much text is appropriate for a 5-8 year old audience? PvZ kept it to 1-2 sentences with personality.

## Note
Toy unlock cards and bio popups moved to the **guided-intro** phase. This concept covers only the persistent lookup/reference system.
