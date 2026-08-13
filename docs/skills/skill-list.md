# SKILLd20 Skills -- Skill List

This reconciles skill content from across the project's design history. Where an older draft
(SKILLd20's original Ch. 4 chapter) conflicts with a more recent decision made during this session's
Origin/Nurture and combat-rework passes, **the more recent decision wins** -- confirmed explicitly.
Two concrete reconciliations this caused:

- **Perception is an ability score, not a skill** -- an older draft listed it as a General skill;
  superseded by its current place among the eight ability scores (Str/Agi/Dex/Con/Int/Wis/Cha/Per).
- **"Bluff," not "Deception"** -- an older draft used "Deception" as the skill name; superseded by
  "Bluff" throughout.

## Social skills (final list, 5)

| Skill | Ability | What it does |
|---|---|---|
| Diplomacy | Cha | Honest persuasion -- making friends, negotiating, bartering/haggling |
| Bluff | Cha | Deceptive persuasion -- trickery, lying convincingly |
| Intimidate | Cha | Coercive persuasion -- getting cooperation or information via threats |
| Sense Motive | Wis | Reading demeanor, detecting lies (deliberately hard -- opposed against Bluff, not a low bar), and correctly interpreting a veiled/indirect statement someone else made |
| Leadership | Cha | Boosting morale and giving orders to those already following you -- the one social skill aimed at subordinates, not persuading a stranger |

**Gather Information, Manipulate, and Innuendo are actions, not standalone skills** -- each is
achievable through Diplomacy, Bluff, or Intimidate depending on approach (friendly information
gathering, manipulative influence, or a veiled/indirect hint or insinuation), rather than needing
its own dedicated skill line. This was a deliberate consolidation: Diplomacy/Bluff/Intimidate split
cleanly by *method* (honest/deceptive/coercive), and adding parallel skills for every specific *use*
of that method (gathering info, manipulating, hinting) would just duplicate the same three skills
under different names.

## Knowledge-type skills (all Int-based)

| Skill | Description |
|---|---|
| Culture | Traditions & actions |
| Expertise | You're good at this specific thing |
| Game/Sports | Rules, etc. -- covers both mental and physical rule-based activities (originally two skills, merged -- "rules are rules" regardless of domain) |
| History | Historical facts |
| Language | Speak |
| Literacy | Read & write -- possibly better as a Feat than a skill, unresolved |
| Local | Geographical facts |
| Lore | Legendary facts |
| Scholastic | Academic facts |
| Science | Science |
| Strategy | Large scale |
| Tactics | Small scale |

**Knowledge's own Focus list** (from the original Ch. 4 draft, not superseded): Language[x],
Literacy[x], Culture[x], Arcana, History, Religion/Theology, Nature, Geography, Nobility/Heraldry,
Engineering, Astronomy, Law, Dungeoneering, Occultism, Local, Underworld. Language/Literacy/Culture
starting ranks are set during Origin; further ranks are bought normally.

## Skills requiring a subtype

| Skill | Ability | Description |
|---|---|---|
| Art | Int | Create a piece of visual art |
| Craft | Int | Build an object |
| Dance | Agi | Dance monkey, dance! |
| Disable/Sabotage | Dex | The physical act of defeating a mechanism (lock, trap, device) so it stops working -- fine-motor execution, distinct from *understanding* how the device works (see Use, below) |
| Engineering | Int | Design something |
| Gunnery | Int | Operate large weaponry -- at a medieval tech level, this means siege engines (ballista, catapult, trebuchet), not gunpowder weapons |
| Handle Animal | Wis | Teach tricks (training/command, distinct from Ride) |
| Hobby | Int | Something you find fun to do |
| Medical | Int | Advanced healing |
| Musical Instrument | Int | Play a type of instrument |
| Navigation | Int | Get around |
| Perform | Cha | Put on a show (oratory, sing) |
| Personal Vehicle/Craft | Agi | Drive/pilot a personal-sized, balance-dependent vehicle -- bicycles, motorcycles, skateboards, surfboards, canoes, hang gliders, paragliders. Broadened from an original narrower "Boat Handling" concept to any small balance-dependent craft, land/water/air alike. Distinct from **Fly** (a body's own innate flight, e.g. a winged ancestry or a magical effect) -- this skill is for piloting a craft to achieve flight/movement, not flying under your own power. |
| Profession | Wis | A job |
| Repair | Int | Fix something -- the functional opposite of Disable/Sabotage |
| Ride | Agi | Mount up & go -- the in-the-moment physical act of controlling a mount, distinct from Handle Animal's training/command. Kept as its own skill deliberately: different ability score, different action, even though both involve an animal. |
| Teamster | Int | Drive an animal-powered vehicle |
| Use | Int | Understanding how an unfamiliar device/mechanism works -- the knowledge-side counterpart to Disable/Sabotage's execution-side. Pairs naturally with it: Use tells you *how* a device works and therefore how to defeat it; Disable/Sabotage is the actual attempt. |

**Appraisal** is used by Nurture content (the Trades background) but doesn't appear in either
glossary above -- open gap, not yet resolved.

## Agility conversion (Dex -> Agi)

Dexterity was split into two ability scores: **Agility** (gross-motor, whole-body movement) and
**Dexterity** (fine-motor, precision). Skills reassigned from the original single-Dex list:

- **Moved to Agi:** Acrobatics, Fly, Stealth, Dance, Ride -- all gross-motor/whole-body.
- **Stayed Dex:** Sleight of Hand, Quickdraw -- both fine-motor/precision, even though Quickdraw
  involves speed.
- **Escape Artist dissolved entirely**, not kept as its own skill. Its two real components split
  cleanly onto skills that already exist: the whole-body contortion half is an Acrobatics check
  (recommended broadening Acrobatics' own definition to cover slow/controlled flexibility alongside
  its existing fast/quick agile feats, rather than adding a narrow new skill -- **recommended, not
  yet explicitly confirmed**), and the fine-motor lockpicking/restraint-mechanism half is a
  Disable/Sabotage check.

**Combat attacks are unified to Agility** for all weapon types (melee and ranged alike) -- a
deliberate departure from the classic D&D split (Str for melee, Dex for ranged), reasoned as more
realistic (accuracy is fundamentally about coordination, not raw force) and made viable here
specifically because SKILLd20's weapon weight system (see `docs/equipment/weapons.md`) already gives
Strength a strong, independent role in *damage* and weapon access/carry, so it doesn't also need to
govern accuracy to keep Strength-focused builds viable.

**Combat damage stays Strength-based whenever muscle is doing the work.** This is a real
differentiator, not just a restatement: a bow's stored energy comes from the archer's own draw at
the moment of the shot (Str-linked), while a crossbow's draw is typically mechanically assisted
specifically to remove the need for arm strength (not Str-linked -- fixed by the spanning mechanism).
The same logic excludes Gunnery's siege engines and any future gunpowder weapons from Str-scaling.

## Open items

- Fly: standalone skill vs. an Acrobatics Focus -- undecided.
- Full General skill list beyond what's captured above (an old 2018 workbook cites "119 primary
  skills" total; nothing close to that count has been reconciled here).
