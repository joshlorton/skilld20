# SKILLd20 Skills -- Core Mechanics

Skills are the sole character-building lever -- there are no classes and no character levels. What
a character can do is purely a function of skill ranks invested (see [[origin nature/nurture]] for
how ranks are granted during character creation).

## Check

`d20 + Skill Rank + Attribute Modifier vs. DC`. DC is set by the action being attempted, modified by
difficulty and any action-specific modifiers.

**Four degrees of success**, universal across every skill action: Critical Success (beat DC by 10+,
or natural 20), Success (meet/beat DC), Failure (miss DC), Critical Failure (miss by 10+, or natural
1). Each action defines what each degree means for itself -- never a generic pass/fail.

**Untrained vs. trained access is set per action, not per skill.** A single skill can have some
rank-0-accessible actions and some trained-only ones.

**Player-Facing Rolls:** players roll against DCs whenever the check directly affects them or is
directly caused by them. The GM only rolls for: (a) any check to end an ongoing effect on an NPC,
and (b) any check made against a non-player target (objects, unattended creatures, environment).
When an NPC attempts an action against a player (e.g. a combat maneuver), the roll flips -- the
player rolls a defensive check against a DC derived from the NPC's stats, rather than the NPC
rolling to hit the player.

## Rank cost

Increment per rank: **1, 1, 2, 2, 3, 3, then 4 flat for every rank after that.**

| Rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cost | 1 | 1 | 2 | 2 | 3 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| Cumulative | 1 | 2 | 4 | 6 | 9 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64 | 68 |

This is the master formula for the whole rank-based cost family -- other rank-based cost tracks
should be checked against it as a multiplier first before inventing a new shape. Two confirmed
multiples of it:

- **Save vs. a tag** (fear, fire, charm, poison, etc.): **2x** the base curve. Increment
  2,2,4,4,6,6,8-flat. Cumulative: 2, 4, 8, 12, 18, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112,
  120, 128, 136.
- **Save for an entire ability score** (Str/Agi/Dex/Con/Int/Wis/Cha/Per): **4x** the base curve.
  Increment 4,4,8,8,12,12,16-flat. Cumulative: 4, 8, 16, 24, 36, 48, 64, 80, 96, 112, 128, 144, 160,
  176, 192, 208, 224, 240, 256, 272.

**This entire cost family is priced in XP** -- the same currency as everything else in the system
(skill ranks, Feats, Weapon Group/Core Spellcasting Feat tiers). Encounter XP = the encounter's
level, split evenly across the party.

## Focus (sub-skill rank tracks)

A **Focus** is a separate rank track within one parent skill -- e.g. Knowledge is a single skill
made entirely of Focuses (Language[x], Literacy[x], Culture[x], Arcana, History, Religion/Theology,
Nature, Geography, Nobility/Heraldry, Engineering, Astronomy, Law, Dungeoneering, Occultism, Local,
Underworld). Spellcraft is likewise a single skill with Tradition as its Focus axis
(Spellcraft[Arcane], Spellcraft[Divine], etc.) -- see `docs/feats/core-spellcasting-feats.md` for the
five traditions.

Each individual Foundation (spell) also has its own separate trainable rank ("foundation skill"),
independent of Spellcraft's own rank -- the same "practice in one thing shouldn't fully transfer to
another" principle that governs Combat Maneuvers (see `combat-maneuvers.md`).

**Spellcasting formulas:**
> Spellcasting check = d20 + Spellcraft skill + Foundation skill + modifiers, vs. Spellcasting DC = 10 + spell's mana + modifiers
> Item creation check = d20 + Craft skill + Foundation skill + modifiers, vs. Item creation DC = 10 + spell's **base** mana + modifiers

Unlike Combat Maneuvers (an opposed roll against another creature's defense), both of these check
against a DC derived from the spell/Foundation's own mana cost -- a higher-mana spell is inherently
both more expensive to cast and harder to cast reliably, a built-in balancing lever.

Having Spellcraft ranks alone does **not** grant casting access -- a Core Feat
(`Spellcasting [Tradition]`) is required to unlock casting at all; Spellcraft ranks only govern the
check once access is unlocked. See `docs/feats/core-spellcasting-feats.md`.

## Item creation

Item creation is a **cumulative check made daily**. Base crafting time is **8 hours**; exact time
modifiers are still TBD. Multiple checks can be made in one day, but incur a **TBD** penalty without
rest between checks.

Each item type applies its own mana and gp multiplier to the Foundation's **base** mana (not the
total mana actually spent completing the item -- keep these two numbers distinct):

| Item type | Craft skill | Mana | GP cost |
|---|---|---|---|
| Potions, Oils (single-use, usable by anyone) | Craft/Brewing | 3x base mana | 10x base mana |
| Charged Item (multi-use, rechargeable) | Craft/(varies by material) | 5x base mana **per charge** | 20x base mana per charge |
| Continuous Use Item (always-active effect) | Craft/(varies by material) | 20x base mana | 400x base mana |
| Scroll (single-use, spellcasters only) | Craft (Calligraphy or Writing) | 2x base mana | 5x base mana |
| Skill Amplification Item (multi-use, command word/ritual activation) | Craft/(varies by material) | 10x base mana | 300x base mana |
| Tattoo (limited-use, consumable) | Craft (Drawing or Painting) | 5x base mana | 10x base mana |

### Amplification items

**Amplification** (backup name: Catalyst) is the working term for the broader item category that
Skill Amplification Items belong to -- any item that provides mana and/or a skill bonus to a
Spellcraft/Foundation check. This is deliberately broader than "wand": a wand is one specific
physical shape commonly used for this purpose, but the category also includes staves, books, and any
other object a designer wants to build this way -- a deliberate divergence from D&D-style wands with
charges. **Powerful Amplification items can let a wielder with no mana or Spellcraft ranks of their
own produce a spell effect anyway** -- see the Necronomicon example below.

Each Amplification item defines:
- **Requirements** -- what the wielder must have (a Foundation rank, Spellcraft ranks, literacy, or
  nothing at all) to use the item. This is the item's own gate; there's no separate universal
  "attempt to use an item you don't qualify for" mechanic layered on top.
- **Skill boost** -- a flat bonus to the relevant Foundation/Spellcraft check, if the item grants one.
- **Mana boost** -- mana the item itself contributes toward a cast, up to a stated maximum per use,
  drawn from the item's own pool.
- **Mana pool** -- the item's total reserve, and its recharge rate (mana restored per hour without
  use).

Amplification items -- including unique, artifact-tier ones -- are still created through the same
Skill Amplification Item formula above (10x base mana / 300x base gp), not a separate ruleset; the
examples below simply sit at very different points along that same scale, from a common item to a
world-defining artifact.

> **Design Note (Open):** Recharge rate and per-use mana boost don't yet follow a stated formula
> relative to pool size -- in the examples below they vary designer-to-designer per item (e.g. the
> Necronomicon's recharge is deliberately slow relative to its huge pool, a specific narrative choice
> tied to its own effect, not a derived number). Whether a general formula should govern these two
> stats for ordinary (non-artifact) items is still open.

**Examples:**

**Wand of Magic Missile**
- Requirements: Foundation (Force Bolt) 1 rank
- Mana boost: provides up to 4 mana when the wielder successfully casts Foundation (Force Bolt)
- Mana pool: 80 mana; recharges 12 mana per hour without use

**Wand of Project Fire**
- Requirements: Spellcraft (any 1) 4 ranks
- Skill boost: +4 on Foundation (Create Fire) checks that create a line or cone
- Mana boost: provides up to 8 mana when the wielder successfully casts a line- or cone-shaped
  Foundation (Create Fire)
- Mana pool: 40 mana; recharges 4 mana per hour without use

**Necronomicon** (book; intended as a true artifact, not a normally-craftable item)
- Requirements: literacy (any 1); text changes to be readable by user -- the book actively adapts
  itself to whoever picks it up, rather than merely happening to be in a language they know
- Skill boost: +100 on Foundation (Animate Dead) checks -- intended as near-unfailable, matching the
  book's flavor: anyone literate can read it and produce devastating necromancy with no training at
  all
- Mana boost: provides up to 100 mana when the wielder successfully casts Foundation (Animate Dead)
- Mana pool: 1000 mana; recharges 20 mana per hour without use -- deliberately slow relative to the
  pool size. Animate Dead requires ongoing mana (a Renew Control sustain action, see
  `docs/archive/SKILLd20_Ch09_Components.md`) to maintain control over animated undead; a careless or
  overconfident reader who drains the pool risks losing control of whatever they've animated.

An item name isn't a fixed set of stats -- two items both called "Wand of Magic Missile" could carry
different numbers; the name describes flavor and rough function, not a template.

> **Design Note (Open):** This mana/gp table conflicts with an earlier 2018 draft workbook's
> quadratic formula (`cost = mana^2` for potions, vs. this table's flat `3x base mana`) at the same
> base-mana value -- e.g. base mana 5 gives 225 gp under the 2018 formula vs. 50 gp under this table.
> Never explicitly reconciled; this table is the more recently confirmed version, but the conflict
> itself was never formally closed out.

## Action economy & difficulty

Skill actions use the site's shared Time Step Table vocabulary (1 action / 10m / 8h / etc.). Each
action is tagged with one or more modes: **Encounter, Exploration, Downtime.**

Difficulty uses the shared 7-tier Rarity/Difficulty scale (Routine -> Monumental) used everywhere
else in the project (Materials, Equipment, Feats, Foundations) -- this supersedes an older 4-code
A/H/VH/IH (Average/Hard/Very Hard/Incredibly Hard) scale from an earlier chapter draft. Don't use
A/H/VH/IH in any new content.

## Skill entry format (for content authoring)

Each skill: name, attribute, description, related items/feats (lookup references only, never inline
text), then **Untrained Actions** and **Trained Actions** (same sub-structure): mode(s), action cost,
traits, requirements, difficulty code, description, the four degrees of success, situational
modifiers, related rules. Traits and difficulty live at the **action** level, never the skill level.

## Open TBDs

- Meditation's Success/Critical Success bonus magnitudes, and its interaction with a not-yet-designed
  Luck magic reroll mechanic.
- A draft "Specialization" feat mechanic (choose one Focus within a skill, gain a bonus specifically
  there at the cost of a penalty to the skill's other Focuses) -- explicitly flagged as possibly
  premature; don't build against it as if confirmed.
- Item creation's exact time-modification rules and the multi-check-per-day fatigue penalty.
- The 2018-workbook mana/gp formula conflict noted above.
