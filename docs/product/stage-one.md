# Stage One — Level Progression

Gradual introduction of toys and enemies across 10 levels. Each level teaches one thing.

| Level | Lanes | Available toys | New enemy | End reward | Special |
|---|---|---|---|---|---|
| L1 | 1 | Generator, Pistol (gated by sparks) | Dust Bunny | — | Dream bubble tutorial |
| L2 | 3 | Generator, Pistol | Dust Bunny | — | Lane jump is the challenge |
| L3 | 5 | Generator, Pistol | Dust Bunny | Block Tower + Water Cannon unlock | Full grid with only 2 toys = real pressure |
| L4 | 5 | Generator, Pistol, Block Tower, Water Cannon | Dust Bunny | — | Practice walls + cannon |
| L5 | 5 | Generator, Pistol, Block Tower, Water Cannon | Armored Bunny | Glitter Bomb unlock | Pre-round enemy bio screen |
| L6 | 5 | Gen, Pistol, Block Tower, Water Cannon, Glitter Bomb | Cleaning Robot | Honey Bear unlock | Pre-round enemy bio screen; warmup wave 1 basic only |
| L7 | 5 | Pick 5 of 6 | Cleaning Robot | — | First loadout selection; Honey Bear practice; every wave has Cleaning Robots |
| L8 | 5 | Pick 5 of 6 | Sock Puppet | Marble Mine unlock | Pre-round enemy bio screen; wave 1 no jumpers |
| L9 | 5 | Pick 5 of 7 | All 4 types | — | Full enemy roster; full toy roster |
| L10 | 5 | Pick 5 of 7 | Mega Mop (boss) | — | Formation rush waves (≤0.8s intervals); boss fight in wave 5; pre-round boss bio |

## Toy unlock progression

| Level completed | Toys unlocked | Total toys | Loadout |
|---|---|---|---|
| Start | Generator, Water Pistol | 2 | All available |
| L3 | + Block Tower, Water Cannon | 4 | All available |
| L5 | + Glitter Bomb | 5 | All available (5 ≤ 5 max) |
| L6 | + Honey Bear | 6 | Pick 5 of 6 (selection screen) |
| L8 | + Marble Mine | 7 | Pick 5 of 7 |

## Design notes

- L1-L3 deliberately limit the player to Generator + Pistol. The player feels the limitation before Block Tower and Water Cannon solve it.
- Lane count escalation (1 → 3 → 5) is itself a difficulty mechanic — no new toy needed at each step.
- Block Tower + Water Cannon unlock together after L3 — Block Tower provides defense, Water Cannon provides offense. Two tools at once gives younger players a significant boost.
- Water Cannon knockback pushes enemies back ~1 cell, giving other defenders more firing time. Disabled on bosses.
- L4 is a practice level — same enemies, two new toys to experiment with.
- L5 introduces the first tough enemy (Armored Bunny) with a pre-round bio screen. Glitter Bomb unlocks as reward — a crowd-control panic button for overwhelming waves.
- Glitter Bomb detonates immediately on placement, killing all non-boss enemies in a 3×3 area. Boss-type enemies take large chunk damage instead.
- L6 introduces the Cleaning Robot (slow, very tough) with a warmup wave before mixing in tough enemies. Honey Bear unlocks as reward.
- L7 is the first loadout selection moment (6 toys unlocked, pick 5). Mirrors L4 pattern: just-unlocked toy (Honey Bear) is the intended tool; no new enemy to split attention.
- L8 introduces the Sock Puppet (jumps over first defender) with a pre-round warning; warmup wave before jumpers appear. Marble Mine unlocks as reward.
- L9 is the stage one pre-boss: all 4 enemy types, all 7 toys available (pick 5 of 7).
- L10 is the boss fight: formation rush waves (≤0.8s spawn intervals) followed by the Mega Mop boss in wave 5.

## Difficulty tuning (difficulty-tuning phase)

Enemy speeds and wave pacing were tuned for kid-friendly play — PvZ-style where most players should clear L1 comfortably and feel the difficulty increase as a gentle staircase, not a cliff.

**Enemy speed hierarchy (tank archetype):** Sock Puppet (0.30) > Dust Bunny (0.25) > Armored Bunny (0.20) > Cleaning Robot (0.15). High HP = slow — previously Armored Bunny was faster than basic Dust Bunny, violating the archetype and making L5-L7 punishing.

**Wave pacing:** Minimum spawn interval raised to 2.0s across L1-L9 (was 1.0-1.5s in L2-L3, 1.5s in L5-L9 wave 4, 1.2s in L9 wave 5). Difficulty graduates between levels via widening minimum gaps (L1=5.0s → L9=2.0s), not within levels. Setup delays for bio-screen levels (L5, L6, L8) extended to 25s to give adequate prep time. L10 breaks the 2.0s floor intentionally (formation rush at 0.7-1.0s intervals) for climactic pacing.
