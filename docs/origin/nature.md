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
  fixed even-split or greater/lesser-split template.
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
  - Drow (dark elf) innate magic is Nurture (a Pact tradition), not an ancestry trait -- reflects
    cultural/hereditary transmission rather than biology.
  - High elf arcane aptitude is Nurture (arcane schooling), not an ancestry trait, for the same
    reason.

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
