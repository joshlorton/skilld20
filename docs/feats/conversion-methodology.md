# SKILLd20 Feats -- Conversion Methodology

SKILLd20 is a skill-based system with no character levels. Feats reflect that:

- No `level` field on a Feat -- there's nothing to gate by.
- No skill-rank prerequisites on a Feat. Where a legacy d20 feat chain gated a harder maneuver behind
  a feat tax (e.g. Improved/Greater Disarm), that maneuver is just the base skill action here, at a
  higher DC -- the DC curve replaces the feat chain entirely (see `docs/skills/combat-maneuvers.md`).
- Feat-gated prerequisites are limited to **core feats** -- concept-defining feats (Wizard, Fighter)
  offered as an Origin option but never mandatory. Whether *other* feats can prerequisite-chain off
  non-core feats is still an open question.
- A feat's `grants` should unlock a brand-new action/recipe/ritual, not a flat skill-rank-style
  bonus -- bonuses of that shape get folded into skill/ability math instead (see the rubric below).

This replaces an earlier PF2e-style Feat schema (with `level` and generic skill/feat prerequisites).

## Feat conversion rubric (D&D 3e-5e, PF1e+Unchained -> SKILLd20)

When converting a legacy feat into SKILLd20 content, classify it first, then apply the matching rule:

1. **Improves an existing skill action/ability** (e.g. Improved Disarm) -> **not a purchasable feat
   at all**. Roll it into the base action's DC math: DC +1 per level, per BAB, per save bonus, per
   ability bonus, per feat "slot" it used to cost, and per skill rank, as applicable.

2. **Grants a genuinely new skill action/ability** (nothing to roll into) -> needs hand-balancing;
   compare against known "improvement"/"bonus" feat costs rather than deriving from a formula.
   - Weapon Proficiency (negates the untrained penalty) estimated as roughly the cost of 2 skill
     ranks x how many weapons it actually covers, scaled by grouping (single weapon < tight group <
     broad group < all simple/martial).
   - Armor Proficiency, same idea, tiered by armor class (leather/hide < chain/scale/lamellar <
     plate).
   - "Class core" feats live here too: weapon/armor proficiency, Spellcraft + mana pool access (see
     `core-spellcasting-feats.md` for the five distinct access routes), and old class features like
     Sneak Attack or "improve save result one step."

3. **Grants a bonus on an existing skill action/ability roll** -- split further by shape:
   - **Per-level bonus** -> convert to "a bonus from X ranks in a related skill" instead of scaling
     with character level.
   - **Single flat bonus** -> compare directly against just spending points to raise the relevant
     skill/ability rank; often this bucket doesn't need to exist as a separate feat at all.
   - **Multi-effect themed bonus** (several small bonuses under one theme) -> cost roughly like one
     skill rank. Example: Trap Sense/Danger Sense (+1 save vs. traps, +1 AC vs. traps, +1 Perception
     vs. surprise).
   - **Themed bonus + new abilities together** -> costs more than the multi-effect-only bucket.
     Example: Trapfinding (a scaling bonus plus outright new abilities to find/disable magical
     traps).

**How to apply:** The classification (bucket 1 vs. 2 vs. 3, and which 3-subtype) determines whether
something becomes a DC adjustment, a new Feat entry, or gets folded into a skill/ability formula --
don't invent new mechanics for something that already has a home here.

## Quantified DC formula (for bucket-1 conversions)

> Skill DC = base + 1 per level / BAB / save bonus / ability bonus / prereq feat / skill rank

**Counting rule:** each prerequisite *feat* in the chain counts as +1 (including a lower tier of the
same feat line -- the feat being priced does not count itself). BAB, ability-score, and skill-rank
requirements add their full stated number (BAB +6 = +6 DC, not divided or scaled down).

**Formal override step:** compute the naive prereq-sum DC first, then apply designer judgment when
the result clearly mis-prices the effect (e.g. a feat granting a free reaction off an ally's failure
priced at only +1 DC from its own naive BAB requirement -- too low for what it grants; needs either
to stay a standalone purchased Feat or an artificially raised floor).

## Redundancy filter (maneuver-specific, see `docs/skills/combat-maneuvers.md` for the full
worked application)

Once a maneuver check scales with rank the same way an attack roll does, a legacy "Improved/Greater
X" feat whose entire effect is a flat numeric bonus is already redundant -- skip it. Only the
non-numeric riders need conversion. Verify per-maneuver rather than assuming this clears everything;
it doesn't always (Trip's "Greater Trip" carried a real non-numeric rider once checked).

## Cost formula for real-feat pricing passes (used across the PF1e conversion files)

**Cost = 2 (flat base) + 1 per prerequisite dimension**, same dimensions as the DC formula above,
base 2 instead of base 0:
- Each prerequisite feat/talent in the chain = +1.
- Each ability-score prerequisite = +1, regardless of the specific threshold.
- A numeric BAB requirement = +1 **per point** (BAB+6 = +6).
- A numeric skill-rank requirement = +1 **per rank**, same logic as BAB. Confirmed final, not
  dampened, even though this produces large numbers for deep skill-rank gates (e.g. a "Spellcraft 10
  ranks" prereq prices at +10) -- the user was asked directly whether this double-charges XP since
  rank investment is already paid for via the rank-cost curve, and decided against dampening.
- A numbered-level prerequisite (class-specific level, caster level, or generic character level) = +1
  **per point**, same as BAB and skill ranks. This does NOT apply to non-numeric capability
  prerequisites with no attached number ("able to cast Nth-level spells" is a spell-slot capability,
  not a level; "100+ years old" is an age, not a level) -- those stay flat +1.
- Non-numeric/non-mappable prerequisites (spellcasting-capability with no number, size category) =
  +1 generic "prereq," flagged for human review of the exact mapping.
- Pure weapon/armor proficiency prerequisites (not a feat, just "must be proficient") = 0.
- Any feat gated on a specific race or a specific class-feature resource (rage, ki pool, bardic
  performance, grit, panache, bombs, hexes, discoveries, revelations, rogue talents, arcane
  bond/familiar, wild shape, wild empathy, eidolon, favored enemy, etc.) is **excluded** from the
  general pricing pass entirely -- SKILLd20 has no confirmed race/ancestry-feature system for most of
  these yet. Race-gated feats specifically get priced separately, with race counted as a real +1
  dimension instead of an exclusion trigger -- see `docs/origin/nature.md`'s Racial Feats section.

**How to apply:** Use this rubric when authoring real Feat content or reviewing/proposing conversions
from source material. See `core-spellcasting-feats.md`, `pf1e-feat-costs.md`,
`pf1e-rogue-talents.md`, and `pf1e-advanced-training.md` for the applied results.
