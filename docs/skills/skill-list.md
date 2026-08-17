# SKILLd20 Skills -- Skill List

This reconciles skill content from across the project's design history. Where an older draft
(SKILLd20's original Ch. 4 chapter) conflicts with a more recent decision, **the more recent
decision wins** -- confirmed explicitly. Two concrete reconciliations this caused early on:

- **Perception is an ability score, not a skill** -- an older draft listed it as a General skill;
  superseded by its current place among the eight ability scores (Str/Agi/Dex/Con/Int/Wis/Cha/Per).
- **"Bluff," not "Deception"** -- an older draft used "Deception" as the skill name; superseded by
  "Bluff" throughout.

## Six categories

| Category | Specialty required? | Notes |
|---|---|---|
| General Skills | No | Used as-is, no declared subtype |
| Specialty Skills | Yes | |
| Knowledge Skills | Yes | All Int-based |
| Combat Skills | Yes | |
| Spellcraft Skills | Yes (Tradition) | Half of spellcasting |
| Foundation Skills | Yes (specific spell) | Half of spellcasting |

Every subtype-requiring skill stays **2 deep** (`Skill (Subtype)`), never 3 deep -- this was a
deliberate rejection of an older draft's Focus-based "Knowledge" parent skill (which would have
produced `Knowledge (Culture [Hobbiton])`) in favor of flat, independently-ranked skills
(`Culture (Hobbiton)`), matching how every other subtype-requiring skill already works (Craft, Perform,
Lore, etc.). "Knowledge" survives only as this category's organizational label, not as a literal
parent skill -- it exists so these skills stay grouped when browsing a list, not scattered
alphabetically among everything else.

## General Skills (no specialty)

| Name | Description | Ability |
|---|---|---|
| Acrobatics | Agile feats, fast or slow | Agi |
| Athletics | Forceful physical feats | Str |
| Blend | Go unnoticed in crowd | Cha |
| Bluff | Deceptive persuasion | Cha |
| Camouflage | Hide object in scenery | Wis |
| Carouse | Con-based equivalent of Diplomacy | Con |
| Diplomacy | Honest persuasion | Cha |
| Disguise | Change your appearance | Cha |
| Endurance | Sustained physical stamina | Con |
| First Aid | Simple, immediate healing | Wis |
| Fly | Innate flight | Agi |
| Gamble | Games of chance | Int |
| Intimidate | Coercive persuasion | Cha |
| Leadership | Command those following you | Cha |
| Meditation | Focus before acting | Wis |
| Profession | Monetize your other skills | Wis |
| Quickdraw | Draw a weapon fast | Dex |
| Read Lips | Read speech visually | Int |
| Research | Dig up information | Int |
| Resolve | Keep your cool | Wis |
| Scrounge | Find what you need | Wis |
| Search | Actively search within reach | Per |
| Sense Motive | Read demeanor, detect lies | Wis |
| Shadow | Follow someone at a distance | Per |
| Sleight of Hand | Stash object in plain sight | Dex |
| Smuggle | Hide goods within goods | Wis |
| Spot | Actively look at a distance | Per |
| Stealth | Move quietly and unseen | Agi |
| Streetwise | Navigate urban environments | Wis |
| Survival | Survive in wilderness | Wis |
| Swim | Swim, don't drown | Str |
| Teach | Pass on a skill | Wis |

**Social skills detail:**
- **Diplomacy / Bluff / Intimidate** split cleanly by *method* (honest/deceptive/coercive), sharing
  Cha. **Carouse** is a fourth, orthogonal path differentiated by *resource* instead (Con, outlasting
  via drinking/social endurance rather than charm) -- its actions mirror Diplomacy's, including Gather
  Information access, until a real exception surfaces.
- **Sense Motive** is deliberately hard against Bluff specifically (opposed roll, not a low bar), and
  also covers interpreting a veiled/indirect statement someone else made.
- **Leadership** is the one social skill aimed at subordinates (boosting morale, giving orders), not
  at persuading a stranger.
- **Gather Information, Manipulate, and Innuendo are actions**, not skills -- achievable through
  Diplomacy, Bluff, Intimidate, or Carouse depending on approach. Adding parallel skills for every
  specific *use* of Diplomacy/Bluff/Intimidate/Carouse would just duplicate the same four skills
  under different names.
- **Current Affairs is not a skill** -- it's headline-level Gather Information, a low-difficulty check
  for the immediate/well-known area that scales harder as the desired area gets farther or less
  well-known.
- **Tracking is a Survival action**, not its own skill -- Survival covers interpreting and following
  signs of passage once noticed; a separate Perception check is used to actually spot them first.
- **Appraisal and Forgery are both actions, not skills** -- achievable through Craft and/or Expertise
  depending on approach (someone who can build something is well-positioned to judge or fake its
  quality; someone with specialized subject knowledge can do the same without being a craftsperson).
  The two mirror each other: Appraisal detects a forgery, Forgery creates one, both riding on the same
  underlying Craft/Expertise investment.
- **Fly stays a standalone skill**, confirmed -- same treatment as Swim, not folded into Acrobatics.

**Perception-based skills** (Search, Shadow, Spot) -- all three run on the **Perception** ability
score, not Int. This gives Perception real skills built directly on top of it for the first time
since it stopped being a skill itself and became a pure ability score -- these three (plus whichever
of Shadow survives, see below) are its active expression.
- **Shadowing renamed to Shadow, Smuggling renamed to Smuggle** -- both dropped their "-ing" suffix to
  conform with the project's skill-naming convention (top-level names avoid "-ing" endings).
- **Search** is active, within reach, opposed to Smuggle or Craft (hidden drawers, trap mechanisms,
  and similar concealment).
- **Spot** is a new skill -- active, at a distance, opposed to Camouflage, Blend, or Stealth. Filled a
  real gap left when Perception became an ability score rather than a skill: the active, at-range
  "actively look for something" function needed a new home, and nothing existing already covered it
  (checked against Search specifically, which is deliberately scoped to within-reach instead).
- **Shadow may not need to survive as its own skill** -- possibly just a combo action: Stealth (to not
  be seen) + Spot (to keep the target in sight) when trying to stay hidden while following someone, or
  Spot alone when not bothering to stay hidden. Flagged as a real possibility, not yet confirmed --
  Shadow stays listed above as a skill until/unless this dissolution is confirmed.

## Specialty Skills (specialty required)

| Name | Description | Ability |
|---|---|---|
| Art | Create visual art | Wis |
| Craft | Build an object | Int |
| Dance | Dance a specific style | Agi |
| Disable/Sabotage | Physically defeat a mechanism | Dex |
| Gunnery | Operate large weaponry | Int |
| Handle Animal | Train/command an animal | Wis |
| Musical Instrument | Play an instrument | Dex |
| Navigation | Find your way | Wis |
| Perform | Put on a show | Cha |
| Personal Vehicle/Craft | Pilot personal balance-vehicle | Agi |
| Repair | Fix a broken object | Int |
| Ride | Control a mount | Agi |
| Teamster | Drive animal-powered vehicle | Int |
| Use | Understand an unfamiliar device | Int |

**Notes:**
- **Art moved from Int to Wis** -- creating visual art is closer to aesthetic judgment/perception
  (proportion, color, composition) than to social presence, and doesn't inherently involve an
  audience the way Perform does. Cha was considered and rejected for that reason.
- **Musical Instrument moved from Int to Dex** -- playing an instrument is fundamentally fine-motor
  control, matching Sleight of Hand and Quickdraw's reasoning rather than a knowledge-type skill.
- **Repair stays Int** -- despite reading like Disable/Sabotage's opposite (fix vs. break), that
  pairing was incidental. Repair's real scope (walls, garments, pottery, not just precision
  mechanisms) pairs more naturally with Craft -- building and fixing are the same underlying
  competency in opposite directions.
- **Gunnery stays here rather than moving to Combat** -- siege engines are mechanically-powered and
  trajectory-calculated, not personal-coordination-based, so Int fits better than Combat's otherwise
  universal Agi basis. Keeping it in Specialty sidesteps having to force a category-wide ability score
  exception.
- **Navigation moved from Int to Wis** -- splits in practice between calculating a route from known
  reference points (Int-flavored) and maintaining a sense of direction/making the right call on
  natural cues and judgment alone (Wis-flavored); landed on Wis since that's the harder, less
  substitutable half of the skill. Sits well next to Survival (also Wis) without becoming redundant --
  Survival is about sustaining yourself in the wild, Navigation is specifically about not getting lost.
- **Disable/Sabotage** is fine-motor *execution* (defeating a mechanism); its knowledge-side
  counterpart is **Use** (Int, understanding how the mechanism works, which then informs how to defeat
  it) -- a deliberate pair, unlike Repair/Disable-Sabotage above.
- **Personal Vehicle/Craft** covers personal-sized, balance-dependent vehicles (bicycles, motorcycles,
  skateboards, surfboards, canoes, hang gliders, paragliders) -- distinct from **Fly** (a body's own
  innate flight), since this is piloting a craft to achieve movement, not flying under your own power.
- **Ride** (the in-the-moment physical act of controlling a mount) stays separate from **Handle
  Animal** (training/command) deliberately -- different ability score, different action, even though
  both involve an animal.

## Knowledge Skills (specialty required, all Int)

| Name | Description |
|---|---|
| Area | Familiarity with a place |
| Culture | Traditions and customs |
| Engineering | Design a solution |
| Expertise | Specific practical/academic competency |
| Game/Sports | Rules of games/sports |
| History | Historical facts |
| Hobby | Something you enjoy |
| Language | Speak a language |
| Lore | Legendary/mythical facts |
| Medical | Advanced medical healing |
| Science | Scientific discovery/theory |
| Strategy | Large-scale planning |
| Tactics | Small-scale planning |

**Category-defining pipeline:** **Science** (discovery of knowledge) -> **Engineering** (applying
knowledge to design solutions) -> **Craft** (building those solutions, stays in Specialty as the
hands-on step). Engineering and Medical moving here follow the same logic: the theoretical/
diagnostic/design layer belongs in Knowledge, the practical execution stays elsewhere (Craft for
building, First Aid for immediate hands-on treatment vs. Medical's deeper diagnostic knowledge).
Hobby fits the same way GURPS' own source category framed it -- appreciation/trivia about a pastime,
not performing it.

**Detail per skill:**
- **Area** -- familiarity with a specific place at *any* scale: a plane of existence, a city's inns
  and taverns, a castle's layout and guard rotation, caravan stops along a trade route, sites along a
  river regardless of political borders. Renamed from "Local," then briefly "Geography," before
  landing here -- "Geography" implied natural/political landmass-level knowledge too narrowly to cover
  human-made or building-scale content (knowing Colorado's geography doesn't tell you Denver's
  layout).
- **Expertise** -- absorbed former Scholastic content (no mechanical difference was ever established
  between "practical competency" and "academic fact," both Int, both resolve identically) plus, from
  an older Focus list: Nobility/Heraldry, Law, Dungeoneering, and Underworld (the *criminal*
  underworld -- contacts, black markets, cant -- not the mythical land of the dead, which lives in
  Lore).
- **Lore** -- the fantastical/mythical counterpart to Expertise and Science's practical/real-world
  knowledge. Also holds Arcana, Nature, Occultism, and Religion/Theology from the older Focus list --
  placed here *tentatively*, since these four were originally the primary spellcasting/magical-
  knowledge skills in the d20 lineage this project draws from, and SKILLd20's spellcasting has since
  been completely reworked (see `docs/feats/core-spellcasting-feats.md`), so their old tight coupling
  to specific casting mechanics no longer applies directly.
- **Science** -- kept separate from Expertise: scientific fields build on each other in a structured
  way most Expertise topics don't (matters if anything downstream wants a prerequisite/bonus keyed off
  real scientific grounding); Science implies a specific methodology, a different flavor of knowing
  even where the check math is identical; and it's large enough (physics, chemistry, biology, geology,
  astronomy) to likely need its own internal subtype structure. None of these are an already-coded
  mechanical difference -- structural/future-hook reasons, stated honestly as such. Also holds
  Astronomy from the older Focus list.
- **GURPS' Geography category was reviewed and split, not adopted whole** -- Physical geography
  (landforms, natural features) is genuinely an earth science and folds into Science; Political and
  Regional geography (borders, governments, area-specific divisions) fold into Area, inseparable in
  practice from "knowing your way around a place."
- **Engineering** -- the older Focus list's "Engineering" maps directly onto this same skill (design
  solutions from knowledge), not a separate thing -- there was never a real overlap to resolve.

All ten items from the older Ch. 4 Focus list (Arcana, Astronomy, Dungeoneering, Engineering, Law,
Nature, Nobility/Heraldry, Occultism, Religion/Theology, Underworld) are now placed -- none remain
unreconciled. Language and Culture starting ranks are set during Origin; further ranks are bought
normally. Literacy has no starting rank of its own -- see the Dissolved section below.

## Combat Skills (specialty required)

| Name | Description | Ability |
|---|---|---|
| Tight Weapon Group | Proficiency with weapon family | Agi |
| Unarmed Combat | Unarmed fighting style | Agi |
| Combat Maneuvers | Specific combat maneuver skill | Agi |

**Combat attacks are unified to Agility** for all weapon types (melee and ranged alike) -- a
deliberate departure from the classic D&D split (Str for melee, Dex for ranged), reasoned as more
realistic (accuracy is fundamentally about coordination, not raw force) and made viable specifically
because the weapon weight system (`docs/equipment/weapons.md`) already gives Strength a strong,
independent role in *damage* and weapon access/carry, so it doesn't also need to govern accuracy.

**Combat damage stays Strength-based whenever muscle is doing the work.** A bow's stored energy comes
from the archer's own draw (Str-linked); a crossbow's draw is typically mechanically assisted
specifically to remove the need for arm strength (not Str-linked). The same logic excludes Gunnery's
siege engines and any future gunpowder weapons from Str-scaling.

**Combat Maneuvers** (Disarm, Trip, and eventually Sunder/Bull Rush/Grapple/Reposition/Steal/Dirty
Trick/Overrun/Drag) each get their own Focus rank under this one shared skill -- see
`docs/skills/combat-maneuvers.md` for the full opposed-roll formula and worked Disarm/Trip drafts.

## Spellcraft Skills (specialty = Tradition; half of spellcasting)

| Name | Description | Ability |
|---|---|---|
| Spellcraft | Cast within a tradition | **Varies** |

**Open:** Spellcraft's ability score isn't fixed -- it varies by Tradition (Int for Arcane, Cha for
Bardic/Bloodline, Wis for Divine, varies for Pact; see `docs/feats/core-spellcasting-feats.md`). Also
worth flagging: Bardic Performance's actual casting skill is **Perform**, not Spellcraft, per that
same table -- Perform (already listed under Specialty Skills, Cha) effectively doubles as a
Spellcraft-category entry for that one Tradition. Not yet resolved whether this needs its own
explicit second row here or stays a cross-reference note.

## Foundation Skills (specialty = specific spell; half of spellcasting)

| Name | Description | Ability |
|---|---|---|
| Foundation | Cast one specific spell | See below |

**Resolved:** in a standard spellcasting check (`d20 + Spellcraft skill + Foundation skill +
modifiers`), Foundation contributes **no separate ability-score bonus of its own** -- it's a bare
rank bonus riding alongside Spellcraft's. This avoids doubling up ability-score bonuses on a single
check; every check in this system receives exactly one ability-score bonus, and spellcasting checks
are no exception even though they combine two skill ranks.

For any *other* check that calls for Foundation skill **alone** (no accompanying Spellcraft roll),
use the ability score of whichever Tradition the specific Foundation belongs to -- or, if the check
is tradition-agnostic, whichever Tradition the character has the highest rank in overall. Example: a
character with a rank-1 Bloodline-origin Foundation and a rank-10 Arcane Foundation uses Cha (Bloodline's
governing ability) for a Foundation-alone check tied to the Bloodline spell specifically, but Int
(their highest-rank Tradition, Arcane) for a tradition-agnostic Foundation-alone check.

## Dissolved -- folded into other skills, not listed above

- **Climb** -> Athletics
- **Escape Artist** -> split between Acrobatics (contortion) and Disable/Sabotage (restraint
  mechanisms) -- the Acrobatics broadening to cover slow/controlled flexibility alongside its
  existing fast/quick agile feats is recommended, not yet explicitly confirmed
- **Gather Information / Manipulate / Innuendo** -> actions of Diplomacy/Bluff/Intimidate/Carouse
- **Mimic** -> folded into Perform
- **Track** -> a Survival action (Perception to notice first)
- **Current Affairs** -> headline-level Gather Information, scaling DC by distance/obscurity
- **Appraisal** -> an action of Craft and/or Expertise, specifically used to spot forgeries
- **Forgery** -> an action of Craft and/or Expertise, the mirror of Appraisal (creating a fake rather
  than detecting one)
- **Literacy** -> not a purchased skill or a separately-flagged trait. Reaching **rank 3 in a
  Language** grants literacy in that language automatically, for any Language a character has ranks
  in, not just their primary/origin one -- resolves the earlier "should this be a Feat instead"
  question by removing it as a standalone purchase entirely. See `docs/origin/nurture.md`'s Culture
  section for the full rule, including what happens when a Language's *underlying* rank goes negative
  (a rank floor of 0 applies to checks, but a categorical penalty and a flat 2-XP-per-rank buyback
  apply to the deficit).

## Open items

- **Shadow's possible dissolution** into a Stealth + Spot combo action -- flagged as a real
  possibility, not yet confirmed.
- **Spellcraft and Foundation's ability-score questions**: Foundation is now resolved (see above);
  Spellcraft's own varies-by-Tradition nature, and whether Perform needs its own explicit row here for
  Bardic Performance, remain open.
