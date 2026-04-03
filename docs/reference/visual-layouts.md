# PvZ1 Visual Layout Reference

Wireframe diagrams of the key game screens. These convey spatial relationships, UI composition, and gameplay flow that text descriptions alone cannot.

---

## 1. Home Menu

```
┌─────────────────────────────────────────────────────────┐
│                    ☀  PLANTS vs. ZOMBIES  🧟            │
│                                                         │
│           ┌─────────────────────────────┐               │
│           │    🌻  ADVENTURE  🌻        │  ◄── main CTA │
│           └─────────────────────────────┘               │
│                                                         │
│       ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│       │ Mini-    │  │ Puzzle   │  │ Survival │         │
│       │ games    │  │          │  │          │         │
│       └──────────┘  └──────────┘  └──────────┘         │
│                                                         │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │
│   │  Zen   │  │ Almanac│  │  Store │  │Options │      │
│   │ Garden │  │        │  │        │  │        │      │
│   └────────┘  └────────┘  └────────┘  └────────┘      │
│                                                         │
│  ┌──────────────────────┐                               │
│  │ 🌱  User: Dave       │   ◄── save slot              │
│  │    Change User       │                               │
│  └──────────────────────┘                               │
│                                                         │
│                        🧟 (zombie arm poking from edge) │
└─────────────────────────────────────────────────────────┘

Layout notes:
- Adventure is the dominant button (large, centred, wooden plank style)
- Secondary modes (Mini-games, Puzzle, Survival) unlock progressively
- Bottom row: utility features (Zen Garden, Almanac, Store, Options)
- Background: animated front lawn at night, zombie silhouettes shambling
- Title text: irregular, hand-lettered style with leaf accents
- Wooden frame texture around the entire menu
```

---

## 2. Level Layout — Day (5-lane standard)

```
                    ZOMBIE SPAWN EDGE
                          │
  Col 1    Col 2    Col 3    Col 4    Col 5    Col 6    Col 7    Col 8    Col 9
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ MOWER  │        │        │        │        │        │        │        │  ~~~>  │ Row 1
│  ◄──   │        │        │        │        │        │        │        │ zombie │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ MOWER  │        │        │        │        │        │        │        │  ~~~>  │ Row 2
│  ◄──   │        │        │        │        │        │        │        │ zombie │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ MOWER  │        │        │        │        │        │        │        │  ~~~>  │ Row 3
│  ◄──   │        │        │        │        │        │        │        │ zombie │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ MOWER  │        │        │        │        │        │        │        │  ~~~>  │ Row 4
│  ◄──   │        │        │        │        │        │        │        │ zombie │
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ MOWER  │        │        │        │        │        │        │        │  ~~~>  │ Row 5
│  ◄──   │        │        │        │        │        │        │        │ zombie │
└────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
     │                          PLANTABLE AREA                          │
     │                                                                  │
  last-resort                                               zombies enter
  lawn mowers                                               from right edge

Layout notes:
- 5 rows × 9 columns, all grass
- Column 1: lawn mower lane (last-resort defence, fires once, clears lane)
- Columns 2-8: primary planting zone
- Column 9: zombie spawn point (zombies walk left ←)
- Each tile holds exactly one plant
- Tiles are uniform squares, bright green grass
- Alternating light/dark green rows for visual distinction
- House wall visible at left edge, fence/path at right edge
```

### Pool Variant (6-lane with water)

```
  Col 1    Col 2    Col 3    Col 4    Col 5    Col 6    Col 7    Col 8    Col 9
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ MOWER  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ Row 1
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ MOWER  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ Row 2
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ CLEANER│≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈water≈│ Row 3
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ CLEANER│≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈≈water≈≈≈water≈│ Row 4
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ MOWER  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ Row 5
├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ MOWER  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ grass  │ Row 6
└────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘

Key difference: Rows 3-4 are water. Need Lily Pad to plant. Pool cleaners replace mowers.
```

### Roof Variant (5-lane sloped)

```
                            ╱ chimney
  Col 1    Col 2    Col 3  ╱  Col 4    Col 5    Col 6    Col 7    Col 8    Col 9
┌────────┬────────┬───────╱┬────────┬────────┬────────┬────────┬────────┬────────┐
│ (none) │ slope↗ │slope↗│ flat   │ flat   │ flat   │ flat   │ flat   │ flat   │ Row 1
├────────┼────────┼───────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ (none) │ slope↗ │slope↗│ flat   │ flat   │ flat   │ flat   │ flat   │ flat   │ Row 2
├────────┼────────┼───────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ (none) │ slope↗ │slope↗│ flat   │ flat   │ flat   │ flat   │ flat   │ flat   │ Row 3
├────────┼────────┼───────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ (none) │ slope↗ │slope↗│ flat   │ flat   │ flat   │ flat   │ flat   │ flat   │ Row 4
├────────┼────────┼───────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ (none) │ slope↗ │slope↗│ flat   │ flat   │ flat   │ flat   │ flat   │ flat   │ Row 5
└────────┴────────┴───────┴────────┴────────┴────────┴────────┴────────┴────────┘

Key differences:
- No lawn mowers (no last-resort defence!)
- Cols 1-3 are sloped: straight-shooting plants hit the roof slope
- Only lobbers (Cabbage-pult, Melon-pult) work reliably from sloped tiles
- Every tile requires a Flower Pot before placing a plant
- Bungee Zombies drop from above
```

---

## 3. Plant Selection (Seed Tray UI)

```
┌─ SUN COUNTER ──────────────── SEED TRAY (top of screen) ──────────────────────┐
│                                                                                │
│  ☀ 150        ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐      │
│               │ 🌻   ││ 🫛   ││ ❄🫛  ││ 🧱   ││ 💣   ││ 🌶   ││ 🔁   │      │
│  (sun total)  │  50  ││ 100  ││ 175  ││  50  ││ 150  ││ 125  ││  ---  │      │
│               │ READY ││▓▓░░░░││ READY ││▓▓▓▓▓▓││ READY ││░░░░░░││ READY │      │
│               └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘      │
│                  │        │        │                │                          │
│               Sunflwr  Peashtr  Snow Pea        Cherry    Jalapeno             │
│               ready   recharging ready          recharging  recharging          │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

Seed packet anatomy (single card):
┌──────────┐
│  ┌────┐  │  ◄── plant illustration (top half)
│  │ 🌻 │  │
│  └────┘  │
│   ☀ 50   │  ◄── sun cost (yellow circle, bottom)
│ ▓▓▓░░░░░ │  ◄── recharge bar (grey = recharging, fills left→right)
└──────────┘
    │
    ├── Bright card: affordable + recharged = ready to plant
    ├── Dimmed card: can't afford (sun cost > current sun) OR still recharging
    └── Grey overlay recedes as recharge completes (like a curtain lifting)

Pre-level selection screen:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Choose your plants!          Slots: [6] [7] [8] [+] [+]  │
│                                       ↑ unlocked  ↑ locked │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│   │ 🌻 │ │ 🫛 │ │ 💣 │ │ 🧱 │ │ 💥 │ │ ❄  │  ← selected │
│   └────┘ └────┘ └────┘ └────┘ └────┘ └────┘    (6 slots)  │
│   ─────────────────────────────────────────                 │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│   │ 🫛 │ │ 🌻 │ │ 💣 │ │ 🧱 │ │ ❄🫛│ │ 🌾 │ │ 🔄 │       │
│   ├────┤ ├────┤ ├────┤ ├────┤ ├────┤ ├────┤ ├────┤       │
│   │ 🍄 │ │ ☀🍄│ │ 💨 │ │ 😱 │ │ 🪦 │ │ 🌙 │ │ 💀 │  ← all│
│   ├────┤ ├────┤ ├────┤ ├────┤ ├────┤ ├────┤ ├────┤  unlockd│
│   │ 🪷 │ │ 🎃 │ │ 🌿 │ │ 🫘 │ │ 🌵 │ │ 💨 │ │ ⭐ │  plants│
│   └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘       │
│                                                             │
│   ┌──────────────────┐                                      │
│   │ Let's Rock! ▶    │  ◄── start button (wooden plank)    │
│   └──────────────────┘                                      │
│                                                             │
│  "Zombies found:"  🧟 🧟‍♂️ 🪣🧟 🏈🧟 ?   ◄── zombie preview │
│                                        (silhouettes)        │
└─────────────────────────────────────────────────────────────┘

Layout notes:
- Top: selected plants (limited by seed slots, default 6, max 10)
- Bottom: full plant roster, greyed out when already selected
- Click to add/remove from selection
- Zombie preview at bottom shows which types will appear (unknown = silhouette)
- Crazy Dave may lock 1-3 slots with his pre-picks (shown with a lock icon)
```

---

## 4. Gameplay — Mid-game State

```
┌─ HUD ──────────────────────────────────────────────────────────────────────────┐
│ ☀ 325    [🌻50][🫛100][❄🫛175][🧱50][💣150][🌶125]        ☰ Menu            │
│          READY  READY  ░░░░░  READY  ░░░░░  READY                             │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│ Col1   Col2   Col3   Col4   Col5   Col6   Col7   Col8   Col9                  │
│                                                                                │
│ 🚜    🌻     🌻     🫛    ·····>  ·····>  ·····>         🧟 Row1             │
│        +25☀                 pea     pea     pea    ← zombie eating nothing    │
│                                                                                │
│ 🚜    🌻     🌻    ❄🫛    ··*··>  ··*··>          🪣🧟  🧟🧟 Row2           │
│        +25☀                frozen   frozen    ← slowed!  bucket  normal       │
│                            peas     peas                                       │
│ 🚜    🌻     🫛     🫛    ·····>  ·····>  🧱▓▓▓  🏈🧟        Row3           │
│        +25☀                                 ↑wall    ↑fast                     │
│                                          being eaten                           │
│ 🚜    🌻     🌻     🫛    ·····>  ·····>  ·····>  ·····>       Row4           │
│        +25☀                 (clear lane — no zombies yet)                      │
│                                                                                │
│ 🚜    🌻     🌻     💣    ·····>  ·····>         🧟 🧟 🧟🚩 Row5            │
│        +25☀         cherry  peas                    FLAG WAVE!                 │
│                     (ready                                                     │
│                     to boom)                                                   │
│                                                                                │
├─ PROGRESS BAR ─────────────────────────────────────────────────────────────────┤
│  🚩──────🚩──────🚩──────🚩──────🚩══════🏁                                  │
│  wave 1   wave 3   wave 5   wave 7  ▲wave 9  final                            │
│                                    (current)                                   │
├─ FALLING SUN ──────────────────────────────────────────────────────────────────┤
│      ☀                  ☀                                                      │
│       ↓ (click to       ↓                    ☀ (from Sunflower)               │
│         collect)                               ↑ (click to collect)            │
└────────────────────────────────────────────────────────────────────────────────┘

Key interactions during gameplay:
- Click falling sun (sky or Sunflower-produced) to add to sun counter
- Click a seed packet in the tray, then click an empty tile to plant
- Seed packet dims during recharge; unaffordable packets also dim
- Zombies walk left ←, eat plants on contact, plant fires right →
- Lawn mower (🚜) auto-fires once when a zombie reaches column 1
- Progress bar at bottom shows wave progression with flag markers
- "A HUGE WAVE of zombies is approaching!" text flashes before final wave

Visual rhythm:
- Left side (cols 1-3): economy zone — Sunflowers, safe, calm
- Middle (cols 4-6): combat zone — shooters, active projectiles
- Right side (cols 7-9): threat zone — walls, approaching zombies
- This left-to-right gradient from safe→danger is core to PvZ's visual feel
```

---

## 5. Screen Flow (navigation between screens)

```
                    ┌─────────┐
                    │  TITLE  │
                    │ SCREEN  │
                    └────┬────┘
                         │
                    ┌────▼────┐
              ┌─────│  MAIN   │─────┐
              │     │  MENU   │     │
              │     └────┬────┘     │
              │          │          │
     ┌────────▼──┐  ┌───▼────┐  ┌──▼────────┐
     │ Mini-games│  │ADVENTURE│  │  Survival │
     │  Puzzle   │  │  MAP    │  │           │
     └───────────┘  └───┬────┘  └───────────┘
                        │
                   ┌────▼────┐
                   │ ZOMBIE  │  ← "Zombies found" preview
                   │ PREVIEW │
                   └────┬────┘
                        │
                   ┌────▼────┐
                   │  PLANT  │  ← choose loadout
                   │ SELECT  │
                   └────┬────┘
                        │
                   ┌────▼────┐
          ☀ sun ──►│GAMEPLAY │◄── 🧟 zombies
       projectiles─►│  FIELD  │
                   └────┬────┘
                        │
                 ┌──────┴──────┐
            ┌────▼────┐   ┌───▼─────┐
            │  WIN!   │   │  LOST   │
            │ reward  │   │ restart │
            └────┬────┘   └─────────┘
                 │
            ┌────▼────┐
            │  BACK   │
            │ TO MAP  │
            └─────────┘
```
