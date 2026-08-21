# SKILLd20 Origin -- Nurture

Nurture is the second half of Origin (see `nature.md` for Ancestry). It runs: **Culture** ->
**Early Childhood** -> **Late Childhood** -> **Adulthood** (a repeatable Later Life loop; renamed
from "Real Life" -- even children are living a real life, and "Adulthood" follows the
Childhood-stage naming pattern).

**Terminology, v1 rework:** Early Childhood, Late Childhood, and Adulthood are collectively
**Phases** (people are often described as going through phases in life). Each Phase's own
sub-choice -- what an earlier draft called "Focus/Specialty" or "Subpath" -- gets a **thematic name
specific to that Phase's content** rather than one generic mechanical term (e.g. an Arcane-flavored
Phase might use Element/Major/Minor/School; a Divine one might use Major/Minor/Specialty Priest,
reusing vocabulary already established in the deity docs; a Military Order might use
Frontline/Historian/Leadership; a Nobility-flavored one might use Foreign Diplomat/Knighthood/Royal
Court). The underlying mechanic behind these named sub-choices is shared across all Phases even
though the display name varies -- see Lifepath Rework below for what that mechanic is.

Skill ranks throughout Nurture are purchased on the standard skill rank point-buy curve: **1, 1, 2,
2, 3, 3, 4, 4, 4, ...** (cost per successive rank). Note that ranks 1 and 2 both cost 1 point each --
every Early Childhood entry below stays within rank 2 of any single skill, so its point totals can be
read directly off the "+N" values without extra conversion.

All skill names below follow `docs/skills/skill-list.md` -- that file is the authoritative skill
reference for this whole project; don't duplicate its content here, cross-reference it instead.

---

## Culture

- **Language(s):** Primary language ("origin" language) rank is set by Standard of Living, below --
  this **replaces** the older flat "rank 5 for everyone" rule entirely, not something that stacks on
  top of it. Additional languages determined by lifepath choices.
- **Literacy is not a purchased skill or a separately-flagged lifepath trait.** Reaching **rank 3 in
  a Language** grants literacy in that language automatically -- this applies to any Language, not
  just the origin one. See `docs/skills/skill-list.md`'s Dissolved section.
- **Skill rank floor of 0** applies to all calculations -- no check ever applies a literal negative
  rank modifier. However, if a character's *underlying* (unfloored) rank in a skill is negative
  (e.g. from a lifepath penalty exceeding their starting rank), checks that depend on it suffer a
  categorical penalty rather than nothing at all: for Language specifically, any check requiring
  language -- many Cha-based skills, and any spellcasting with a Verbal component -- resolves **one
  degree-of-success category worse** than it otherwise would. This can be bought off at **2 XP per
  negative rank** to bring the underlying rank back to 0 (a flat repair cost, distinct from the normal
  rank-cost curve used to gain new positive ranks).
- **Tech Level (TL):** Medieval is the standard baseline for testing. (See the broader TL/CL research
  in prior design work -- unresolved which of several candidate systems this ultimately maps to.)
- **Climate**, **Government**, and **Standard of Living**, below, are Culture's three structured
  sub-steps. **Climate is picked first, Government second** -- this ordering matters specifically
  because of Government's Anarchy/No-One special case (see below), which needs Climate already
  locked in to work cleanly. Standard of Living has no such ordering dependency -- explored as a
  potential Government modifier, but confirmed to have no direct mechanical interaction with it (see
  Standard of Living below), so it can be picked at any point relative to the other two.

### Climate (Pick 1)

Twelve terrain/settlement types. **Survival is now a Specialty skill** (requires a subtype, e.g.
`Survival (desert)`), confirmed -- moved from General Skills, since knowing how to survive in one
climate genuinely shouldn't transfer fully to another (arctic survival skill doesn't make you
tropics-competent). This project deliberately does **not** import GURPS' "Defaults" mechanic
(rolling a related-but-unlearned skill at a penalty) to handle the gap between climates -- left to
GM/player table negotiation instead, to avoid the added complexity.

**Urban:** Culture (origin) +1, Expertise (any 1) +1, Language (origin) +1, Streetwise +1
**Nomadic** (complete separation from both templates below): Culture (origin) +1, Expertise (any 1)
+1, Language (origin) +1, pick 1: Endurance +1 or Handle Animal +1 -- Survival is deliberately
**not** granted here, even generically. A nomadic lifestyle moving between multiple terrains would
plausibly prevent the deep, focused competency Survival's subtype now represents; time split across
several climates removes the specialization rather than granting a generic version of it. (A
nomadic character who split time between urban and rural settings specifically, rather than across
wild terrains, would more plausibly end up with a Streetwise/Survival split instead -- not
represented by this template, left to the player's specific background story.)
**All other types** (Arctic, Coastal, Desert, Forest, Jungle, Mountains, Ocean, Plains, Subterranean,
Swamp): Culture (origin) +1, Expertise (any 1) +1, Language (origin) +1, Survival (own climate) +1

Differentiation between the ten non-Urban, non-Nomadic types lives entirely in what "Culture
(origin)"/"Language (origin)" actually mean per type (flavor), not in which skills get granted
(mechanics) -- deliberately simplified from an earlier draft that gave each type its own bespoke
skill pair, which kept producing mismatches against Early Childhood's own backgrounds and against
real-world culture-by-geography sources (HARP) used to sanity-check the type list itself. Jungle and
Swamp were added after an initial gap check found them missing from the original ten.

### Government

Three independent axes, each contributing its own skill grant. **Total content to author is additive
per axis-value, not a cross-product** -- Seat of Power's 6 values x 2 skills, Who Has Power's 20
values x 3 skills, Structure of Power's 5 values x 1 skill, not 6x20x5 combinations.

**Seat of Power** (2 skills; who/what holds the seat is intentionally form-agnostic -- a dragon, a
lich, or a literal god can fill "Single Individual" without needing its own category):

| Value | Grant |
|---|---|
| Anarchy/No One | Scrounge +1, Stealth +1 |
| Citizenry / Multiple Groups / Multiple Individuals / Single Group / Single Individual | Culture (origin) +1, Diplomacy +1 |

**Who Has Power** (3 skills each):

| Value | Grant |
|---|---|
| Anarchy/No One | Search +1, Sense Motive +1, Unarmed Combat (Brawling) +1 |
| Ancestry | Expertise (Genealogy) +1, History (Ancestry) +1, Research +1 |
| Arcane (Magic/Spellcasting Elite) | History (Magic) +1, Spellcraft (pick 1: Arcane, Bloodline, or Pact) +1, Lore (Arcane) +1 |
| Businesses/Traders/Corporations | Pick 1: Bluff or Diplomacy +1; Craft (any 1) +1; Profession +1 |
| Divine (Clergy/Religious Elite) | Expertise (Theology) +1, Spellcraft (pick 1: Divine, Bloodline, or Pact) +1, Lore (Divine) +1 |
| Courts/Law Enforcement | Expertise (Bureaucracy) +1, Expertise (Law) +1, Expertise (any 1) +1 |
| Creatives/Artists | Pick 3, repeats allowed, from: Art (any) +1, Musical Instrument (any) +1, Perform (any) +1 |
| Elderly/Wisest | Meditation +1, Resolve +1, Sense Motive +1 |
| Elected Representatives | Bluff +1, Diplomacy +1, Expertise (Bureaucracy) +1 |
| Foreigners/Client State | Culture (dominant foreign power) +1, Language (dominant foreign power) +1, pick 1: Bluff or Diplomacy +1 |
| Merit/Contribution/Honor | Diplomacy +1, Expertise (any 1) +1, Leadership +1 |
| Military | Athletics +1, Tight Weapon Group (any 1) +1, Unarmed Combat (any 1) +1 |
| Mob Rule | Athletics +1, Blend +1, Intimidate +1 |
| Nobility/Aristocracy | Carouse +1, Expertise (Heraldry) +1, pick 1: Diplomacy +1, History (origin) +1, or Area (origin) +1 |
| Professionals/Experts/Educated | Expertise (any 1) +1, Profession +1, Research +1 |
| Property Owners | Expertise (Administration) +1, Expertise (Law) +1, Area (origin) +1 |
| Secret Elite | Uses whichever *other* Who Has Power value is their public "cover" -- e.g. a secret coven of hags running a culture that outwardly presents as Nobility/Aristocracy uses that entry's grants, not a grant of its own |
| Strongest/Toughest | Acrobatics +1, Athletics +1, Endurance +1 |
| Thieves/Most Cunning | Bluff +1, Sleight of Hand +1, Smuggle +1 |
| Wealthy/Banks | Expertise (Accounting) +1, Expertise (Law) +1, Profession +1 |

**Structure of Power** (1 skill each, uniformly -- no exceptions):

| Value | Grant |
|---|---|
| Anarchy/No One | Resolve +1 |
| Unified Centralized / Unified Decentralized / Confederation-Alliance / Federation-Split Governance | Expertise (any 1) +1 |

Anarchy/No One was the added 5th value here -- the original Structure of Power list only had the four
governance-shape options above; Seat of Power and Who Has Power both already had their own dedicated
Anarchy/No One entries, so this addition just brought Structure into line with the other two axes
rather than introducing a new structural type.

**Anarchy/No One is a single atomic Government pick**, not a value re-selected independently on all
three axes. Choosing it at Seat of Power skips Who Has Power and Structure of Power entirely as
separate menu picks, moving straight to Early Childhood -- but the character still receives the sum
of what all three axes' own Anarchy entries would have granted, bundled together: Scrounge +1 (Seat),
Stealth +1 (Seat), Search +1, Sense Motive +1, Unarmed Combat (Brawling) +1 (Who), Resolve +1
(Structure) -- six distinct skills, each at +1, no stacking.

### Standard of Living (Pick 1)

Five tiers, each granting a skill pick and a Language rank. Deliberately kept independent of
Government -- explored as a potential Government-grant modifier (a poor populace under a
power-hoarding elite having restricted access to that elite's skills), but rejected: a player
actively choosing an unusual Standard-of-Living/Government combination already signals an
exceptional character concept, which is exactly what background fluff is for. Mechanically forcing
that rarity would add real cross-axis complexity for a payoff fluff already delivers for free, and
the thematic case doesn't even point one direction reliably -- a power-hoarding elite might just as
plausibly force the populace to train, fishing for talented recruits. Standard of Living's skill
grant **stacks normally** with Climate's and Government's.

| Tier | Skill Grant | Language (origin) |
|---|---|---|
| Elite | Pick 1: any Knowledge-category skill +1 | +7 |
| Upper Class | Pick 1: any Knowledge-category skill +1 | +5 |
| Middle Class | Pick 1: Craft (any 1) or Profession +1 | +3 |
| Lower Class | Pick 1: Athletics or Endurance +1 | +2 |
| Impoverished | Pick 1: Athletics or Scrounge +1 | +1 |

Elite and Upper Class share an identical skill grant deliberately -- broad flexibility was chosen
over forcing artificial differentiation between the two; may be a template worth reusing at other
lifepath stages. Language ranks are explicitly **not balanced yet** ("start here" -- cumulative XP
cost under the rank curve is 16/9/4/2/1, an accelerating gap rather than a linear one, not yet
reviewed for fairness). At rank 3 (Middle Class and up), a character is literate per the rule above;
Lower Class and Impoverished are not, by default.

---

## Lifepath Rework (v1 draft)

A ground-up rework of how Phases work, started after Standard of Living absorbed the old "social
standing" concept out of Early Childhood specifically so it wouldn't be represented twice. **Scope:
framework decisions and Early Childhood's new structure only -- Late Childhood and Adulthood aren't
reworked yet** and still use the older content further below. Early Childhood's own new background
list has a confirmed *structure* but not yet drafted skill-grant numbers.

### What Phase choices can change

- **Ability scores:** must balance; a +1 costs 10 XP.
- **Skill ranks:** can increase normally; can also *decrease* Language (origin) specifically -- ties
  directly into the floor/penalty/buyback mechanic under Culture, above.
- **Feats/Complications:** 3-4 at most for this first draft, deliberately scope-limited.

### Complication (replaces "Flaw")

The term for a negative-feat-equivalent trait a character can take for budget. **Complication** was
chosen deliberately, reusing the same term already used for fail-forward's "yes, but..." consequence
-- the two are thematically the same underlying idea (English already links "a development" to "a
complication" in common usage) even though they're mechanically distinct: fail-forward's Complication
is an *emergent* consequence of an unusual Phase transition (see Determine Next Phase, below), while
this one is a *deliberate, budget-motivated pick* like any other trait. Since the same word covers
both, rules text needs to keep disambiguating which kind is meant from context. ("Hindrance" and
"Drawback" were both considered and rejected in favor of reusing Complication -- Hindrance
specifically was flagged as a strong option, precedented by Savage Worlds' own identical-scope term,
in case this decision gets revisited.)

**Complications shouldn't represent things wrong with the player** -- e.g. an Enemy or a Dependent is
a complication *for* the character, not a flaw *in* them, which was the actual reason "Flaw" got
rejected as a name in the first place.

### Phase Choice Balance

- Each Phase has an XP budget.
- Ability scores, skill ranks, and Feats/Complications-taken-as-feats subtract from that budget.
- Complications (the negative-trait kind) add to the budget, spent as normal at that Phase --
  intended to auto-balance against ability score and Feat costs rather than being pure free XP.
- **Negative Language (origin) ranks are ignored for this budget** -- deliberately excluded from the
  normal "negative skill rank refunds points" pattern, since Language going negative already has its
  own dedicated consequence system (see Culture, above); letting it *also* refund Phase budget would
  double-dip the same lever.

### Determine Next Phase

**No hard restrictions** between Phases -- confirmed. Whatever a character picks next is always
available; the system only calibrates how much narrative justification an unusual choice needs, not
whether it's allowed.

**Mechanism:** a partial Rarity Spectrum (reusing the project's existing 7-tier Routine->Monumental
Difficulty/Rarity scale rather than inventing a new one), driven by a **Phase Choice Matrix** --
each background is rated once, on a small set of shared 1-7 axes, and the *distance* between two
backgrounds' ratings determines how rare (and how much backstory/Complications) a transition between
them needs. This avoids hand-rating every possible pairwise transition directly (which would be a
combinatorial explosion) in favor of rating each background once and deriving transition rarity from
that -- the same additive-not-cross-product principle already used for Government's skill grants.

**Important scope note:** the matrix itself is a one-time, behind-the-scenes calculation tool.
Players never see the raw axis numbers -- they only ever see the derived output (a transition is
Rare, requiring N sentences of backstory and M Complications). Once the matrix has done its job of
generating those outputs, it doesn't need to be revisited or exposed anywhere in play.

**Draft Rarity tiers** (titles unofficial, not yet reconciled with the real 7-tier scale's actual
names):

| Tier | Requirement | Worked example |
|---|---|---|
| Common | No backstory needed | Farm -> Farm, Back Woods -> Back Woods |
| Uncommon | 1-sentence backstory + 1 Complication | Closed Community -> Street |
| Rare | 3-4 sentence backstory + 2 Complications | Farm -> Militant Organization, Trades -> Orphan |
| Very Rare | 6-7 sentence backstory + 3 Complications | Back Woods -> Noble |

> **Open:** "Trades -> Orphan" as a Rare example is worth double-checking -- Orphan is normally an
> initial-Phase starting condition, not something a character transitions *into* from an established
> background, so this example implies a specific story (apprenticed in a trade, then lost their
> support system) that may or may not be the intended reading.

**Draft Phase Choice Matrix (Early Childhood), quick draft awaiting player feedback -- not final.**
Six axes, all 1-7, all viewed from a social perspective: **power** (social standing/political
power), **wealth**, **freedom** (constraint from wealth or obligation, distinct from wealth itself),
**net-str** (network strength -- how reliable/deep are your existing connections), **net-size**
(network breadth -- how far-reaching/diverse they are), **safety** (general vulnerability/exposure to
danger, broader than just "is someone actively hunting you"). Ratings are feeling-based with 1s and
7s deliberately reserved for true extremes, not derived from a formula.

| Background | Power | Wealth | Freedom | Net-Str | Net-Size | Safety | Total |
|---|---|---|---|---|---|---|---|
| Back Woods | 2 | 2 | 4 | 2 | 3 | 3 | 16 |
| Closed Community | 4 | 3 | 1 | 6 | 2 | 2 | 18 |
| Elite | 7 | 7 | 6 | 7 | 7 | 7 | 41 |
| Farm | 2 | 3 | 3 | 3 | 3 | 3 | 17 |
| Nobility | 6 | 6 | 3 | 6 | 6 | 6 | 33 |
| On the Run | 1 | 1 | 1 | 3 | 3 | 1 | 10 |
| Orphan | 2 | 1 | 3 | 2 | 2 | 2 | 12 |
| Outcast | 1 | 1 | 4 | 2 | 1 | 2 | 11 |
| Street | 2 | 2 | 3 | 2 | 3 | 2 | 14 |
| Trades | 4 | 4 | 4 | 4 | 4 | 4 | 24 |
| Unsettled | 3 | 3 | 7 | 5 | 5 | 4 | 27 |
| Wealthy | 5 | 6 | 6 | 6 | 6 | 5 | 34 |

Notable design reasoning worth preserving, not obvious from the numbers alone:
- **Freedom measures constraint, not mobility.** Nobility scores low Freedom (3) despite high
  Power/Connections specifically because duty and political obligation outweigh raw status. On the
  Run scores low Freedom (1) despite presumably high physical mobility, because constantly evading
  pursuit is its own constraint -- freedom-of-movement and freedom-from-constraint aren't the same
  thing here.
- **Net-Str vs. Net-Size splitting is what makes Closed Community's profile work**: high Net-Str (6,
  deep bonds within the group) against low Net-Size (2, narrow reach outside it) -- a real,
  differentiated profile a single "Connections" axis (an earlier, since-abandoned 3-axis draft)
  couldn't have produced.
- **Outcast vs. Orphan, deliberately close but not identical**: Outcast may still have family (cast
  out of a community, not necessarily orphaned), so it shares Safety (2) and Net-Str (2) with Orphan
  while differing on Net-Size (1 vs. 2), Freedom (4 vs. 3), and Power (1 vs. 2).
- **Back Woods and Street, deliberately brought close together (16 vs. 14)** after an earlier draft
  had them too far apart -- they're meant as urban/rural analogs of the same underlying archetype.
  The remaining gap (Freedom 4 vs. 3, Safety 3 vs. 2) reflects rural hardship reading as more
  isolated-but-safe, urban hardship as more exposed-but-connected.
- **Elite (7,7,6,7,7,7) and Wealthy (5,6,6,6,6,5)** anchor the top of the scale a full step apart,
  consistent with Elite representing the literal ruling group and Wealthy representing
  rich-but-not-ruling status.

### Early Childhood: new background structure (confirmed direction, skill grants not yet drafted)

- **Elite** -- new; add "ruling group" specifically (ties to Government's Who Has Power axis --
  being born into whichever group actually holds power).
- **Nobility and Wealthy** -- combine via "pick" lists; 5 of Nobility's 6 existing grants and 4 of
  Wealthy's 5 are already Knowledge-category, so simplify most of both to "pick N: any
  Knowledge-category skill +1," matching the same broad-flexibility pattern already used for Standard
  of Living's Elite/Upper Class tiers.
- **Exiled** -- renamed **Outcast**.
- **Farm** -- broadens toward "manual labor" generally, with Subphases, rather than staying
  farming-specific.
- **Fugitive/On the Run** -- does **not** get its own top-level background; folds into Unsettled's
  "Reason" Subphase instead (see below).
- **Nomadic** -- becomes **Unsettled** (Early Childhood's analog to Climate's Nomadic type; chosen
  over Constant Travel/On the Move/Mobile for its double meaning -- literally rootless, and
  potentially psychologically restless too). Gets a **"Reason"** Subphase: seasonal migration,
  drifter/wanderer, pilgrim, vagabond, explorer -- and Fugitive/On the Run folds in here as one more
  Reason option rather than its own background.
- **Closed Community** -- becomes one base pick with a Subphase: academic, indentured servitude,
  militaristic, monastic (was two separate entries, Militaristic and Monastic; academic and
  indentured servitude are new additions).
- **Trades** -- renamed **Skilled Trades**, one base pick with a Subphase: Guild Member,
  Independent.
- **Orphan** -- stays its own background, **not** folded into Closed Community's Orphanage-adjacent
  content -- "Closed Community/institution" implies exactly the stable structure most orphan
  archetypes are defined by *lacking* (unless the intent is specifically institutionally-raised
  orphans, a narrower concept than "orphan" broadly implies). Orphan's existing Blend +1 grant is
  likely its real thematic anchor (learning to go unnoticed), and its environment flexibility (pick
  Streetwise or Survival) is plausibly a *feature* -- Street and Back Woods are each tied to one fixed
  environment, Orphan isn't. The Phase Choice Matrix's Net-Size axis (breadth of connections) is the
  intended long-term mechanism for keeping Orphan numerically distinct from Street specifically, now
  that Street's own rating was adjusted (see matrix above).

**Urban/Rural reflavoring, not hard limiting:** Climate's Urban/Rural split doesn't block Early
Childhood background combinations -- every tested mismatch reflavors into a coherent story instead
(Urban + Farm -> a farm at the city's edge; Urban + Back Woods -> isolation/loner within the city;
Rural + Street -> the streets of a small village or hamlet). Consistent with the broader "no hard
restrictions" decision above.

---

## Early Childhood (pre-rework content, kept for reference)

**Superseded in structure by the Lifepath Rework above** -- organized around "Social Standing," a
concept that now lives in Culture's Standard of Living instead. Kept here because its actual skill
grants haven't been ported to the new background structure yet; treat the background *names* and
*organization* below as outdated, but the specific skill values as a real starting point for
whoever drafts the new structure's numbers.

A **10-point budget** applies to skill ranks. Each social-standing choice lists mandatory skills;
their point cost is subtracted from the base 10, and whatever remains is free for player choice.

### Social Standing

**Nobility**
- Culture (culture) +1
- Diplomacy +1
- History (culture) +1
- Language +1
- Second language +1
- Pick 1: Scholastic (government, heraldry, or law) +1

**Wealthy**
- Hobby +1
- Language +1
- Local (any 1) +1
- Profession (any 1) +1
- Scholastic (any 1) +1

**Commoner -- Farm**
- Pick 1: Handle Animal or Expertise (farming) +2
- Craft (any 1) +1
- Swim +1

**Commoner -- Trades**
- Appraisal +1
- Craft (any 1) +2
- Expertise (any 1) +1

**Impoverished -- Back Woods (rural)**
- Athletics +1
- Endurance +1
- Language -2 -- *the point deficit is paid back into the 10-point budget*
- Survival +2
- Swim +1

**Impoverished -- Exiled**
- Blend +1
- Bluff +1
- Second language +1
- Pick 1: Streetwise or Survival +1

**Impoverished -- Orphan**
- Blend +1
- Scrounge +1
- Pick 1: Streetwise or Survival +1

**Impoverished -- Street**
- Carouse +1
- Language -1 -- *paid back into the 10-point budget*
- Scrounge +1
- Streetwise +2

**Closed Community -- Militaristic**
- Pick 1: Acrobatics or Athletics +1
- Pick 1: Tactics (any 1) or Scholastic (military) +1
- Tight weapon group (any 1) +1
- Unarmed combat (any 1) +1

**Closed Community -- Monastic**
- Scholastic (religion) +2
- Meditation +1
- Pick 1: Craft (any 1), Lore (any 1), Expertise (any 1), or Scholastic (any 1) +1

> **Note:** "Scholastic," "Local," and "Disable Device"-style names above predate `skill-list.md`'s
> Knowledge-category reconciliation (Scholastic merged into Expertise, Local renamed to Area). This
> table hasn't been re-passed to match yet -- treat the newer skill names as authoritative when they
> conflict with what's written here, same reconciliation rule as everywhere else in this project.

### Design notes

- Negative language modifiers (Back Woods, Street) refund points into the 10-point budget rather than
  being a pure flavor penalty. Chosen deliberately over strict realism for balance -- these
  backgrounds needed more mandatory skills overall (young children in poorer/less structured
  circumstances still have real choices made for them, just fewer of them), and the refund keeps
  their net spend in line with the other Impoverished sub-paths (Back Woods and Street both net 3
  points spent after the refund, matching Orphan's 3 and close to Exiled's 4).
- Point totals are now roughly graded by social standing: Nobility spends the most (6 of 10, least
  free choice), Wealthy spends 5, Commoner/Closed Community/Exiled spend 4, and rural Impoverished
  backgrounds net 3 (most free choice). Reads as a deliberate gradient -- higher status means more of
  your training is decided for you; lower status means more freedom, less guidance.
- **Appraisal** appears here as a flat skill grant (Trades), but is now resolved elsewhere as an
  *action* of Craft/Expertise, not a skill of its own (see `docs/skills/skill-list.md`). This row
  needs the same kind of revisit as Wealthy/Banks' Government entry above.
- **Back Woods and Street's "(literacy: no)" tags were removed**, not just reworded. Literacy is now
  fully derived from a character's final Language rank (see Culture, above) rather than a
  separately-set flag, so the tag was often simply wrong once Standard of Living's tiered Language
  ranks replaced the old flat baseline -- e.g. an Elite-tier character taking Back Woods (7-2=5) or
  Street (7-1=6) still clears the literacy threshold and would contradict an explicit "no." Letting
  literacy fall out of the actual math is more interesting anyway: a well-born character exiled to
  rough circumstances plausibly keeps their literacy while losing polish elsewhere; a poorer
  background taking the same penalty plausibly doesn't.

---

## Late Childhood

**Framework, confirmed:** a 3-stage lifepath (Early Childhood -> Late Childhood -> Adulthood),
synthesized from comparing MechWarrior 3e, Darklands, and Traveller 2e's own lifepath systems.
MW3/Traveller's 3-stage approach was preferred over Darklands' 2-stage (combined childhood)
structure. Higher Education is **not** a separate 4th stage -- it's a restricted first pass through
Adulthood's repeatable loop, which is how it avoids overlapping with Late Childhood content like
Preparatory School/Apprenticeship.

**Terminology:** "Focus" or "Specialty" (not MW3's "subpath") for the sub-choice that flavors a
background once picked.

**Draft backgrounds, converted from MW3's background listing, not yet finalized:** Warzone,
Militaristic Organization, Back Woods, Apprenticeship, Farm, Military Training, School, Military
Kid, Military School, Preparatory School, Nomadic Family, Street, Militaristic Culture.

> **Open, unresolved:** two different draft rows both ended up named "Militaristic Organization"
> with different point totals and different content (one ~11 points emphasizing broad combat/
> survival training, one ~9 points emphasizing soldier profession + medicine + cultural history) --
> this naming collision was flagged during drafting and never actually renamed or merged.

**Restructuring in progress, not finalized:** the five military-flavored backgrounds above
(Militaristic Organization x2, Military Training, Military Kid, Military School, Militaristic
Culture) were being consolidated into one "Military" parent background with Focus options (warfare,
general physical training, militia, bodyguard, leadership, academic) -- two of those six Focuses
(militia, bodyguard) have no existing content to draw from, and "academic" has two competing
candidate sources. Street's three Focus options (thug, sneak thief, con artist) map cleanly onto its
existing flat skill list. Back Woods' Focus was proposed as "climate + geography" but it's unresolved
whether that's mechanical (swaps skill subtypes) or purely descriptive. Orphan's Focus is
deliberately open-ended -- borrow from other backgrounds' skill lists rather than author its own,
though whether that pool is unrestricted or curated is undecided.

**Breadth-split mechanic, confirmed:** where Darklands' single background chart grants a full spread
across many skills in one pick, that spread splits across Early and Late Childhood by dividing each
value by 2 (round down) for Early Childhood, with the remainder going to Late Childhood -- Early
Childhood keeps its current tight, sharply-defining scope; Late Childhood absorbs the broader,
rounding-out content this way instead.

**Late Childhood <-> Early Childhood Social Standing relationship, confirmed:** open choice, not
restricted by which Early Childhood standing was picked -- but mismatches ("fail forward") should
carry a complication rather than being blocked outright. Mechanics for what that complication looks
like are not yet designed.

**Weapon-skill conversion, confirmed:** legacy per-weapon skill values (e.g. from a Darklands-style
source chart) convert to Tight Weapon Group picks. A character can end up with several separate Tight
Weapon Group entries this way; a future mechanic to consolidate multiple tight groups into one
broader group is planned but not designed yet.

---

## Adulthood

Not yet designed. Established elsewhere as a repeatable "Later Life" loop, structure TBD. May
connect to the five spellcasting tradition access routes (Arcane Schooling, Bardic Performance,
Bloodline, Divine Teachings, Pact) -- Bloodline is confirmed granted via Origin/Nature (Ancestry);
the other four are plausibly acquired here instead, though this is a probable connection, not yet
confirmed.
