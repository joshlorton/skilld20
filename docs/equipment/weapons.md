# SKILLd20 Equipment -- Weapons

Weapons are defined by a physical taxonomy (how the weapon is built and used) rather than by
individual named items. Any real-world weapon that fits a category's physical description performs
identically to any other weapon in that category at the same weight/damage-die tier -- "dagger,"
"short sword," and so on are reference names for a tier, not distinct mechanical entries.

---

## Weapon Categories

| Category | Build | Weight distribution | Swing | Thrust |
|---|---|---|---|---|
| Staves | Basic stick | Balanced | Bludgeoning | Weak bludgeoning or weak piercing |
| Blades | Stick sharpened on 1-2 sides | Balanced | Slashing | Piercing |
| Axes | Stick with heavy sharpened head | Far end | Slashing or weak piercing | None or weak piercing |
| Weighted Blades | Stick sharpened on 1 side with a heavier tip | Toward far end | Slashing or weak piercing | Weak piercing |
| Thrusting | Stick sharpened to a pointed tip | Balanced | Weak bludgeoning or weak slashing | Piercing |
| Impact (B) | Stick with heavy smooth head | Far end | Bludgeoning | None or weak piercing |
| Impact (P) | Stick with heavy spiked head | Far end | Piercing | None or weak piercing |

Weighted Blades is the combined blade/axe category: kukri, machete, scimitar, falchion, and similar
single-edge, tip-weighted blades all belong here.

### Modifiers

- **2-handed:** A heavier version of any category above.
- **Polearms:** A lengthened version of any category above. Formula: **haft weight (from the Staves
  table, scaled to the polearm's length) + head weight (from the base category, at a modest tier)**.
  Example: `spear = staff + dagger`.

  Real-world weight checks against this formula:
  - Spear: staff (~3 lb) + dagger (1 lb) = 4 lb predicted; real medieval spears run 3-6 lb (Spartan
    spears lighter, 2-3 lb). Matches.
  - Poleaxe: staff (~3 lb) + axe at the 1d8 tier (3 lb) = 6 lb predicted; real poleaxes run 6-7 lb.
    Close match.
  - Halberd: staff (~3 lb) + axe at the 1d10 tier (4.5 lb) = 7.5 lb predicted; real halberds run
    ~8 lb. Close match.

  > **Design Note:** The additive formula predicts *total weight* accurately, but total weight alone
  > doesn't capture wieldability. A heavy head at the end of a long haft creates far more rotational
  > torque than the same weight held near the hands -- historically, polearm heads stayed
  > proportionally small (rarely exceeding the base category's own 1d8-1d10 tier) specifically because
  > of this leverage effect, not by arbitrary convention. Don't pair a top-tier (1d12) category head
  > with a full staff haft; nothing built that way ever existed, for a real physical reason the weight
  > formula alone won't flag.

---

## Weight by Damage Die

All weights in pounds. Sourced entries are anchored to real-world historical/modern reference
weapons; interpolated entries fill gaps between sourced tiers using the same die-step logic as the
Blades baseline (see below).

| Die | Blades | Weighted Blades | Axes | Thrusting | Staves | Impact (B) | Impact (P) |
|---|---|---|---|---|---|---|---|
| 1d4 | 1 | 1 | 1 | 0.5 | 0.5 | 2 | 2 |
| 1d6 | 2 | 2 | 2 | 1.5 | 1.5 | 3 | 3 |
| 1d8 | 4 | 4 | 3 | 2.5 | 3 | 4 | 4 |
| 1d10 | 6 | 6 | 4.5 | 3.5 | 4.5 | 6.5 | 6.5 |
| 1d12 | 8 | 8 | 6.5 | 5 | *(see note)* | 9-11 | 9-11 |

### Category notes

- **Blades** is the reference curve: dagger (1 lb/1d4) -> short sword (2/1d6) -> longsword (4/1d8) ->
  6 lb/1d10 -> 8 lb/1d12. The 1d10 step is a functional in-between point ("heavy longsword" / "light
  greatsword"), not a specific named historical weapon -- real hand-and-a-half ("bastard") swords
  weigh about the same as longswords (2.5-4 lb), not meaningfully more, so no specific weapon name is
  pinned to that row.
- **Weighted Blades** mirrors Blades exactly. Kukri (1-2 lb), machete (1.1-2.9 lb), and
  falchion/scimitar (~2 lb) all land inside the blade range at comparable sizes -- confirmed, not
  assumed.
- **Axes** run lighter than Blades at every tier, including 1d12. One-handed axes (1.1-3.3 lb) are
  comparable to or lighter than blades of similar size; the real weight premium only appears at the
  two-handed tier (Dane axe/great axe, 2.2-6.6 lb), and even there stays below the greatsword.
- **Thrusting** stays flat and light rather than climbing steeply: épée (1.5-1.8 lb), rapier (~2.2
  lb), estoc (~3.5 lb, the heaviest attested thrusting sword). The 1d12 row (5 lb) is an extrapolation
  past sourced data -- no historical thrusting weapon reaches this weight; treat it as the
  least-confident number in the table.
- **Staves** is the one category that doesn't cleanly reach 1d12 as a plain wooden stick. The only
  sourced anchor -- a full 6-9 ft quarterstaff -- lands around 3 lb (1d8 tier). Pushing further
  requires either a longer/reinforced staff or the 2-handed modifier (~6 lb for 1d12); a plain
  wooden staff realistically caps around 1d10 (4.5 lb).
  - Heavy studded clubs (tetsubo and similar) do **not** belong in this category despite the "club"
    label -- their weight sits at the far end (heavy, tapering to a slender handle), which matches
    Impact (B)'s definition ("weight: far end"), not Staves' "balanced" weight. They're folded into
    Impact (B) below.
- **Impact (B)** now has real anchors at nearly every tier: one-handed mace (2-4 lb) covers 1d4-1d8,
  1d10 remains interpolated (no direct source between one- and two-handed tiers), and 1d12 spans the
  two-handed studded mace (8.8 lb) through a typical studded tetsubo (~11 lb). Tetsubo's extreme end
  (up to 22 lb for all-iron specimens) is a supersized/legendary outlier, not a standard 1d12 weapon.
- **Impact (P)** mirrors Impact (B). Sourced war pick data validates this directly rather than by
  default: horseman's pick (~4 lb) matches the 1d8 row, footman's war pick (~6 lb) is close to the
  1d10 row. No sourcing distinguished spiked heads from smooth ones by weight -- the spike changes
  damage type, not mass.

### Haft material

Historical maces and war hammers used wooden (hardwood) hafts as the norm; all-metal shafts were a
later evolution specific to anti-plate-armor knightly weapons and are documented as heavier, but
without a precise sourced multiplier. Treat **metal haft** as a modifier layered on top of the base
Impact tables (same pattern as 2-handed/polearm), not a separate weight class baked into the table
above.

---

## Metal Staves (fictional)

No real culture built a weapon this way, so this is an extrapolation, not a sourced category. A
solid steel staff at wooden dimensions would run ~10-11x the wood weight (steel vs. ash/oak density)
-- a 30+ lb bar, unusable as a melee weapon. The only physically plausible version is hollow/tubular
construction, which works out to roughly a **5x multiplier** over the equivalent wooden stave
(cross-checked against tetsubo's real ~11 lb weight, which lands in the middle of this calculated
range).

| Die | Staff (wood) | Metal Staff (hollow, ~5x) |
|---|---|---|
| 1d4 | 0.5 | 2.5 |
| 1d6 | 1.5 | 7.5 |
| 1d8 | 3 | 15 |
| 1d10 | 4.5 | 22.5 |

> **Design Note (Open):** The physically-grounded 5x multiplier makes a metal staff impractical to
> wield past 1d6-1d8. If metal staves are meant to be usable across the full range, a flatter,
> deliberately-gamist multiplier (2-3x wood weight) would keep them wieldable at the cost of not
> being physically defensible -- unresolved, needs a decision rather than more research.

---

## Sources

Sword weights: [SwordsSwords.com](https://swordsswords.com/blog/the-true-size-and-weight-of-medieval-swords-explained/),
[Medieval-Combat.net](https://www.medieval-combat.net/much-swords-weigh/),
[Zweihänder (Wikipedia)](https://en.wikipedia.org/wiki/Zweih%C3%A4nder),
[Hand-and-a-Half Swords Guide](https://everestforge.com/everest-forge-blog/hand-and-a-half-swords-bastard-swords-complete-guide),
[Arms & Armor: Longswords vs Bastard Swords](https://www.arms-n-armor.com/blogs/news/longswords-vs-bastard-swords-vs-hand-and-a-half-swords).
Axes: [Battle axe (Wikipedia)](https://en.wikipedia.org/wiki/Battle_axe),
[Dane axe (Wikipedia)](https://en.wikipedia.org/wiki/Dane_axe),
[Houston Axe Mag](https://houstonaxe.com/how-much-does-a-battle-axe-weigh/).
Weighted blades: [Kukri (Wikipedia)](https://en.wikipedia.org/wiki/Kukri),
[Kukri vs. Machete](https://nobliecustomknives.com/kukri-vs-machete/),
[Falchion vs Scimitar](https://workingtheflame.com/falchion-vs-scimitar/).
Thrusting: [Rapier (Wikipedia)](https://en.wikipedia.org/wiki/Rapier),
[Estoc -- The Met](https://www.metmuseum.org/art/collection/search/27434).
Staves/quarterstaff: [Arms & Armor: The Quarterstaff](https://www.arms-n-armor.com/blogs/news/the-quarterstaff),
[Quarterstaff (Wikipedia)](https://en.wikipedia.org/wiki/Quarterstaff).
Impact weapons: [Morning star (Wikipedia)](https://en.wikipedia.org/wiki/Morning_star_(weapon)),
[Maul (Wikipedia)](https://en.wikipedia.org/wiki/Maul),
[War hammer (Wikipedia)](https://en.wikipedia.org/wiki/War_hammer),
[Battlemerchant: The Mace](https://www.battlemerchant.com/en/blog/the-mace-history-and-use-in-the-middle-ages),
[Quora: How heavy is a Medieval Mace?](https://www.quora.com/How-heavy-is-a-Medieval-Mace).
Tetsubo: [Malevus: Tetsubo](https://malevus.com/tetsubo/),
[Kanabō -- Military Wiki](https://military-history.fandom.com/wiki/Kanab%C5%8D).
Picks: [Horseman's pick (Wikipedia)](https://en.wikipedia.org/wiki/Horseman's_pick),
[Malevus: Horseman's Pick](https://malevus.com/horsemans-pick/).
Polearms: [Battling Blades: Poleaxe vs Halberd](https://battlingblades.com/blogs/news/poleaxe-vs-halberd-which-is-the-best-weapon-for-battle),
[Poleaxe (Wikipedia)](https://en.wikipedia.org/wiki/Poleaxe),
[The True Weight of Medieval Weapons](https://stribogsforest.wordpress.com/2026/04/07/the-true-weight-of-medieval-weapons-fact-and-fiction/).
