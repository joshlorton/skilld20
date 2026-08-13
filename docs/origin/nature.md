# SKILLd20 Origin -- Nature (Ancestry)

Origin is built from two parts: **Nature** (a one-time Ancestry pick, this document) and **Nurture**
(Culture, Social Standing, Late Childhood, and a repeatable Later Life loop -- see `nurture.md`).
Nature covers what a character's ancestry grants biologically; behavioral and mental traits
(personality, cultural dispositions) are deliberately excluded from Nature and live in Nurture
instead -- see Design Decisions below.

---

## Design Decisions (Confirmed)

- **Half-ancestries** are handled through XP costing rather than a bespoke split mechanic. Every
  ancestry trait carries an XP cost (see Ancestries Draft Table), so a "half-elf" is simply a
  character who spent a shared Nature XP budget across traits from two ancestries, rather than a
  fixed even-split or greater/lesser-split template. **Current interpretation, confirmed
  2026-08-13:** race-gated content that historically required a distinct "half-X" ancestry (e.g. real
  PF1e feats gated on "Half-Elf" or "Half-Orc" specifically, see Racial Feats below) becomes available
  once a character has invested Nature XP in *both* constituent full ancestries, not by picking a
  separate named half-ancestry slot.
  > **Open:** The Nature XP budget itself (the fixed total every character spends on ancestry,
  > regardless of how it's split across one or more ancestries) is not yet a set number. This is the
  > one piece that makes half-ancestries actually balanced rather than a discount or a tax relative
  > to full ancestries -- needs to be pinned down before the system is usable.
- **Behavioral/mental traits are Nurture, not Nature.** Traits like "dwarven greed," "gnome
  obsessiveness," or "orc ferocity-as-personality" are treated as cultural/learned rather than
  hereditary. (Note: Orc Ferocity as a *mechanical* death-prevention ability, below, is still a Nature
  trait -- this decision is about personality/disposition, not every trait with a racial flavor name.)
- **Innate magic baseline:** Tier 0 (25 mana pool) is the standard for all innate spellcasting,
  whether granted by ancestry or acquired through Nurture. This gives racial Bloodline grants and
  nurture-acquired traditions one shared baseline rather than per-source special-cased numbers.
  - Drow (dark elf) innate magic is Nurture, not an ancestry trait. **Current interpretation
    (2026-08-13):** both Pact and Arcane Schooling can apply -- not an either/or choice. Pact
    reflects cultural/hereditary transmission; Arcane Schooling represents a later stage of Origin
    (Adulthood) rather than something granted immediately. Original design intent had put Drow under
    Arcane Schooling specifically -- final flavor pending the user's own research into Drow
    backstory. Same open-ended treatment applies to High Elves' arcane aptitude (also Nurture, also
    not settled to a single route). See `docs/feats/core-spellcasting-feats.md` for the full
    tradition list this draws from.

---

## Sizing (Open -- TBD)

Ancestry-driven sizing effects are not yet designed. Open sub-questions:

- Damage (does size modify damage dealt or received?)
- Attacking creatures of a different size (larger or smaller than the attacker)
- Physical skill checks (does size grant or penalize specific checks?)
- Carry capacity
- Reach

No resolution yet on any of these -- listed here as the open agenda, not as decisions.

---

## Vision & Lighting

### Lighting tiers (named, not yet valued)

Blinding/brilliant light (usually magical) -> Daylight -> Bright light -> Normal light -> Dim light ->
Darkness -> Deeper darkness (usually magical; blocks darkvision).

> **Open:** Radius and vision-quality values per tier are not yet defined. This is the missing piece
> that makes Low-light multipliers, Darkvision radii, and Light Sensitivity penalties (see Orc, below)
> fully mechanical rather than descriptive.

### Vision type definitions

- **Normal vision:** No special interaction with lighting tiers.
- **Low-light vision:** Multiplies the effective radius of dim and normal light sources by a
  race-specific factor (e.g. 4x).
- **Darkvision:** Low-light vision, plus a fixed-radius grayscale vision component that penetrates
  darkness (blocked by deeper darkness).

---

## Ancestries Draft Table

| Ancestry | Str | Agi | Dex | Con | Int | Wis | Cha | Per | Movement | Vision | Saves | Immunities | Other |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dwarf | - | - | - | +2 | - | +2 | -2 | - | 20 | Darkvision 40'; Low-light 8x | poison +2; magic +2 | - | Slow and Steady: encumbrance has no speed penalty |
| Elf | - | - | +2 | -2 | +2 | - | - | +2 | 30 | Low-light 4x | enchantment +2 | - | Saves vs. magical sleep effects treated as one result better (stacks with enchantment +2) |
| Gnome | -2 | - | - | +2 | - | - | +2 | +2 | 25 | Low-light 2x | - | - | Gnome Bloodline: foundations restricted to illusion & communication (animals only); mana pool 25 (Tier 0) |
| Halfling | -2 | - | +2 | - | - | - | +2 | - | 25 | Normal | fear +2 | - | Lucky: bonus TBD (pending player feedback -- candidates: bonus on some/all saves, bonus on checks to avoid notice, Foundation: Luck synergy, overlooked-in-a-crowd/Blend mechanic, flat check to avoid surprise) |
| Human | - | - | - | - | - | - | - | - | 30 | Normal | - | - | Any One Ability Score (bonus magnitude TBD) |
| Orc | +4 | - | - | - | -2 | -2 | -2 | - | 30 | Darkvision 20'; Low-light 4x; Light Sensitivity (-1 on vision-based skill checks in bright light, worse in brighter conditions -- values TBD against the lighting tiers above) | - | - | Orc Ferocity: 1/day, remains conscious when reduced to 0 HP; slowed 1 (round 1), slowed 2 (round 2), slowed 3 and unconscious at end of turn (round 3) |

### Notes on confirmed values

- Halfling's Con was a blank cell in an earlier draft -- confirmed as no modifier ("-"), not a missing
  value.
- Orc's Str +4 (double every other ancestry's modifier magnitude) is intentional, balanced by three
  -2 penalties. Confirmed as legacy content whose real balance will be checked by the XP-costing pass
  once the Nature budget is set, not by inspection of the raw numbers.
- Orc's light sensitivity is a vision-based skill check penalty only -- an earlier draft also carried
  a separate save penalty against light/dark effects, which was cut to avoid representing the same
  trait twice.
- Orc's vision (Darkvision 20'/Low-light 4x) intentionally matches Elf's Low-light rate (4x) exactly,
  with a flat Darkvision radius added on top -- Orc and Elf share the same base low-light quality;
  Dwarf's 8x is the one true outlier, confirmed intentional (dwarves are the best-sighted of the
  three).
- Elf's sleep-save trait lives in the Other column, not Immunities, because it's a save-tier shift
  ("treated as one result better," using the four-degree success system) rather than a binary
  immunity. The Immunities column stays defined but empty for Elf -- reserved for a future ancestry
  (e.g. an elemental race) that needs a true immunity.
- Gnome's innate mana pool was originally drafted at 40 (from tallying four 1/day spells), corrected
  to 25 to match the Tier 0 standard once two of those four grants turned out to be too limited to
  justify the higher number.

---

## Racial Feats (candidate content, to be gone through)

41 real PF1e feats specifically pre-scoped as candidate Ancestry-linked content, priced via the
formula in `docs/feats/conversion-methodology.md`. **Not yet reviewed against the Ancestries Draft
Table above** -- placed here as a working section, not settled content.

> **Hypothesis to check during review:** many of these may actually belong on the Culture/geography
> axis (see `nurture.md`) rather than pure Ancestry -- e.g. traits tied to living underground, in
> forests, or in a particular climate could be more accurately environmental than biological. Worth
> testing each row against that question rather than assuming everything here is a Nature trait just
> because the source material gates it by race.

Source race set is PF1e's 7 core races (Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Human) --
not SKILLd20's own ancestry list, which currently has Orc rather than Half-Orc and no separate
Half-Elf entry (see the Half-Ancestries interpretation above -- Half-Elf/Half-Orc content below
should be read as "available once both constituent ancestries are invested in," not as its own
ancestry). Core Rulebook has zero race-gated feats -- every entry below is APG or Ultimate Combat.

**Pricing rule, modified from the general Feats formula:** a race prerequisite counts as a real +1
dimension instead of being an exclusion trigger. Class-resource prerequisites some of these also
carry (bardic performance, flurry of blows, etc.) are still counted as a generic +1 "unmapped" and
flagged as an unresolved blocker, since picking the right Ancestry doesn't grant the class resource
too. **Every entry is a candidate for becoming a free unlock tied to picking that Ancestry** (mirroring
the Tier-0-free pattern used for Core Spellcasting Feats) rather than a settled priced-Feat-vs-
free-grant decision.

| Feat Name | Source | Qualifying Race(s) | Other Prerequisites | XP Cost | Notes |
|---|---|---|---|---|---|
| Improved Stonecunning | APG | Dwarf | Wis 13, stonecunning racial trait | 4 | |
| Steel Soul | APG | Dwarf | hardy racial trait | 3 | |
| Stone-Faced | APG | Dwarf | -- | 3 | |
| Stone Singer | APG | Dwarf | Cha 13, bardic performance | 5 | bardic performance = unresolved blocker even post-Ancestry |
| Elven Accuracy | APG | Elf | -- | 3 | |
| Light Step | APG | Elf | Acrobatic Steps, Nimble Moves | 5 | |
| Gnome Trickster | APG | Gnome | Cha 13, gnome magic | 4 | |
| Groundling | APG | Gnome | Cha 13, gnome magic | 4 | |
| Haunted Gnome | UC | Gnome | Cha 13, gnome magic, Knowledge (arcana) 1 rank | 5 | |
| Haunted Gnome Assault | UC | Gnome | Cha 13, gnome magic, Haunted Gnome, Knowledge (arcana) 3 ranks | 8 | |
| Haunted Gnome Shroud | UC | Gnome | Cha 13, gnome magic, Haunted Gnome, Haunted Gnome Assault, Knowledge (arcana) 6 ranks | 12 | capstone of 3-tier chain |
| Shared Insight | APG | Half-Elf | Wis 13 | 4 | |
| Sociable | APG | Half-Elf | Cha 13 | 4 | |
| Keen Scent | APG | Half-Orc | Wis 13 (also valid for orc) | 4 | |
| Razortusk | APG | Half-Orc | -- | 3 | |
| Smash | APG | Half-Orc | Power Attack | 4 | |
| Smell Fear | APG | Half-Orc | Keen Scent (also valid for orc) | 4 | |
| War Singer | APG | Half-Orc | Cha 13, bardic performance (also valid for orc) | 5 | bardic performance = unresolved blocker |
| Deathless Initiate | UC | Half-Orc | Str 13, Con 13, Diehard, Endurance, BAB +6 (also valid for orc) | 13 | |
| Deathless Master | UC | Half-Orc | Str 13, Con 15, Deathless Initiate, Diehard, Endurance, Ironhide, BAB +9 | 18 | |
| Deathless Zealot | UC | Half-Orc | Str 13, Con 17, Deathless Initiate, Deathless Master, Diehard, Endurance, Ironhide, BAB +12 | 22 | most expensive feat in this whole pass |
| Childlike | APG | Halfling | Cha 13 | 4 | |
| Lucky Halfling | APG | Halfling | -- | 3 | |
| Well-Prepared | APG | Halfling | -- | 3 | |
| Eclectic | APG | Human | -- | 3 | |
| Racial Heritage | APG | Human | -- | 3 | |
| Breadth of Experience | APG | Dwarf, Elf, Gnome | 100+ years old | 4 | age requirement, no SKILLd20 age mechanic exists |
| Earth Child Style | UC | Dwarf, Gnome | Wis 13, Improved Unarmed Strike, Acrobatics 3 ranks | 8 | |
| Earth Child Topple | UC | Dwarf, Gnome | Wis 13, Earth Child Style, Improved Trip, Improved Unarmed Strike, Acrobatics 6 ranks | 13 | requires Improved Trip -- maneuver-family feat as an input |
| Earth Child Binder | UC | Dwarf, Gnome | Wis 13, Earth Child Style, Earth Child Topple, Greater Trip, Improved Trip, Improved Unarmed Strike, Stunning Fist, Acrobatics 9 ranks | 19 | capstone; requires Greater Trip + Improved Trip |
| Twin Thunders | UC | Dwarf, Gnome | Two-Weapon Fighting or flurry of blows, Weapon Focus (both weapons) | 5 | flurry-of-blows alt path is class-resource, unresolved for non-TWF builds |
| Twin Thunders Flurry | UC | Dwarf, Gnome | Improved TWF + TWF (or flurry), Twin Thunders, Weapon Focus, BAB +6 | 13 | flurry alt flagged |
| Twin Thunders Master | UC | Dwarf, Gnome | Improved TWF + TWF (or flurry), Twin Thunders, Twin Thunders Flurry, Weapon Focus, BAB +9 | 17 | capstone; flurry alt flagged |
| Deepsight | APG | Dwarf, Half-Orc | darkvision 60 ft. (native racial trait) | 3 | |
| Fight On | APG | Dwarf, Half-Orc | Con 13 (also valid for orc) | 4 | |
| Ironguts | APG | Dwarf, Half-Orc | Con 13 (also valid for orc) | 4 | |
| Ironhide | APG | Dwarf, Half-Orc | Con 13 (also valid for orc) | 4 | |
| Eagle Eyes | APG | Elf, Half-Elf | Wis 13, keen senses | 4 | |
| Leaf Singer | APG | Elf, Half-Elf | Cha 13, bardic performance | 5 | bardic performance = unresolved blocker |
| Arcane Talent | APG | Elf, Half-Elf, Gnome | Cha 10 | 4 | |
| Pass For Human | APG | Half-Elf, Half-Orc, Halfling | -- | 3 | ironically named -- prereq is being one of these 3 non-human races, not being human |

**Coverage by race** (a feat counts once per qualifying race): Dwarf 15, Gnome 13, Half-Orc 13, Elf 6,
Half-Elf 6, Halfling 4, Human 2. Human is dramatically underserved -- just Eclectic and Racial
Heritage, both flat race-only, no feat chain or synergy support at all. Halfling is next-thinnest.
Dwarf/Gnome/Half-Orc are richest, mostly from three long chains (dwarf/gnome share Earth Child + Twin
Thunders; half-orc gets the 3-tier Deathless chain) -- a known real asymmetry in PF1e's own
racial-feat support, not a research gap.

**Still undecided, per the same "price and flag, don't commit yet" approach used elsewhere:**
1. Free-Ancestry-grant vs. XP-purchased-with-Ancestry-prereq for each row (or a mix).
2. The class-resource-blocked entries (Stone Singer/War Singer/Leaf Singer need bardic performance;
   Twin Thunders' flurry-of-blows alt path) -- picking the matching Ancestry clears the race
   dimension, but the class-resource dimension stays unresolved the same way it is throughout
   `docs/feats/`.
3. The climate/geography hypothesis noted at the top of this section -- unchecked against any row yet.
