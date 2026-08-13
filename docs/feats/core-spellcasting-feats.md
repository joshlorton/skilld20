# SKILLd20 Feats -- Core Spellcasting Feats

Five parallel routes by which a character gains access to casting Foundations. See
`docs/skills/core-mechanics.md` for how Spellcraft rank and Foundation rank combine into an actual
casting check once access is unlocked.

| Tradition | Governing ability | Sub-choice | Casting skill |
|---|---|---|---|
| Arcane Schooling | Intelligence | School | Spellcraft |
| Bardic Performance | Charisma | Form | Perform |
| Bloodline | Charisma | Bloodline | Spellcraft |
| Divine Teachings | Wisdom | Domain, Deity | Spellcraft |
| Pact | Varies | Contract, Patron | Spellcraft |

Access-route flavor (original design intent, not yet fully reconciled against Origin's Ancestry
content -- see the Open Items note below): Arcane via culture/"schooling"; Bard via equipment;
Bloodline via ancestry/"innate"; Divine via culture/"schooling"; Pact via patron type (fey/elder fey,
shaman/ancestors).

Bardic Performance's "Form" sub-choice has its own full glossary (~90 real musical forms) and stated
design intent (combine with Foundations for more specific effects; determine instrumental
accompaniment) -- not yet built into a formal doc.

## Tier progression (0-4)

Each tradition is a Core Feat family with 5 tiers. **Tier 0 is normally granted free via Origin, not
bought** -- its `cost` column is specifically the buy-in price to acquire this tradition *later*
(e.g. picking up a second tradition post-character-creation).

Format: `cost / foundations (cumulative total known) / mana pool (total) / safe mana`.

| Tradition | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---|---|---|---|---|
| Arcane Schooling | 6 / 1 / 20 / 3 | 9 / 1 / 35 / 5 | 18 / 2 / 50 / 10 | 27 / 4 / 65 / 15 | 36 / 6 / 80 / 20 |
| Bardic Performance | 4 / 1 / 5 / 1 | 6 / 1 / 10 / 3 | 12 / 1 / 15 / 6 | 18 / 2 / 20 / 9 | 24 / 3 / 25 / 12 |
| Bloodline | 6 / 1 / 25 / 2 | 9 / 1 / 45 / 3 | 18 / 1 / 65 / 6 | 27 / 2 / 85 / 9 | 36 / 3 / 105 / 12 |
| Divine Teachings | 6 / 1 / 20 / 3 | 9 / 1 / 35 / 5 | 18 / 2 / 50 / 10 | 27 / 4 / 65 / 15 | 36 / 6 / 80 / 20 |
| Pact | 4 / 0 / 15 / 2 | 6 / 1 / 25 / 4 | 12 / 2 / 35 / 8 | 18 / 3 / 45 / 12 | 24 / 4 / 55 / 16 |

**Notes on the numbers:**
- Arcane Schooling and Divine Teachings are numerically identical at every tier -- both are
  "culture/schooling"-flavored access routes.
- Mana pool grows linearly per tradition: Arcane/Divine +15/tier, Bloodline +20/tier (richest,
  consistent with being innate/hereditary rather than trained), Pact +10/tier, Bardic +5/tier
  (leanest).
- The cost column splits into two identical curves (Arcane/Divine/Bloodline: 6->9->18->27->36;
  Bardic/Pact: 4->6->12->18->24) -- confirmed coincidental, not a deliberate design rule. Don't treat
  "schooled/hereditary costs more than performance/patron" as a real principle; each tradition's
  costs stay independently tunable.
- **Tier 0's mana pool may be too generous** -- flagged as an open balance concern, not resolved.

**Safe Mana** is a risk mechanic: spending mana beyond the safe-mana threshold (but within the full
pool) triggers some kind of risk/backlash. What that backlash actually is has never been specified.

## Confirmed connections to Origin

- **Bloodline** is confirmed as the tradition Ancestry-granted innate magic uses (e.g. Gnome's
  innate spellcasting in `docs/origin/nature.md` uses Bloodline's Tier 0 numbers directly -- 25 mana
  pool). Don't generalize Bloodline's Tier 0 mana pool (25) to the other traditions; each has its own
  distinct Tier 0 (Arcane/Divine 20, Pact 15, Bardic 5).
- **High Elves'** arcane aptitude is Arcane Schooling acquired via Nurture.
- The other traditions are plausibly acquired during Origin's Adulthood stage rather than Nature,
  though this is a probable connection, not a confirmed structural decision.

## Open items (not resolved)

- **Drow's tradition is unsettled.** Original design intent lists Drow under Arcane Schooling, but a
  separate note in `docs/origin/nature.md` currently has Drow under Pact instead. Current working
  interpretation (2026-08-13): both can apply -- Pact as one path, Arcane Schooling as a later stage
  of Origin (Adulthood) rather than an either/or choice. Final flavor pending the user's own research
  into Drow's thematic backstory; same open-ended treatment applies to High Elves.
- Safe Mana's actual backlash mechanic.
- Tier 0 mana pool balance across traditions.
