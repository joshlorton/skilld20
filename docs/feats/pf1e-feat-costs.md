# SKILLd20 Feats -- PF1e Feat XP Costs

Draft SKILLd20 XP costs for real Pathfinder 1e feats, computed via the cost formula in
`conversion-methodology.md`, sourced from d20pfsrd.com and aonprd.com (Archives of Nethys). Covers
**bucket-2 "grants a new ability" feats** specifically -- combat-maneuver feats (Disarm, Trip,
Sunder, Bull Rush, Grapple, Overrun, Reposition, Steal, Dirty Trick and their chains) are explicitly
out of scope here; they're bucket-1 and already resolved as skill-action DC math in
`docs/skills/combat-maneuvers.md`, not standalone Feats.

Scope: **Core Rulebook + Advanced Player's Guide**, plus **Ultimate Combat** for Teamwork/Critical/
Style/Grit (categories that didn't exist pre-Pathfinder). Any feat gated on a specific race or
class-feature resource (rage, ki pool, bardic performance, grit, panache, etc.) is excluded from this
table entirely, not just flagged -- SKILLd20 has no confirmed race/class-resource equivalent for most
of these yet.

**Grand total: 317 feats priced** across all categories below.

## Item Creation (Core Rulebook only)

| Feat Name | Prerequisites | XP Cost | Notes |
|---|---|---|---|
| Brew Potion | Caster level 3rd | **5** | |
| Craft Magic Arms and Armor | Caster level 5th | **7** | |
| Craft Rod | Caster level 9th | **11** | |
| Craft Staff | Caster level 11th | **13** | |
| Craft Wand | Caster level 5th | **7** | |
| Craft Wondrous Item | Caster level 3rd | **5** | |
| Forge Ring | Caster level 7th | **9** | PF1e's ring-crafting feat is "Forge Ring," not "Craft Ring" |
| Scribe Scroll | Caster level 1st | 3 | level is 1, so flat and per-point treatment coincide |

## Metamagic

**Core Rulebook** (all no-prereq, all cost 2): Empower Spell, Enlarge Spell, Extend Spell, Heighten
Spell, Maximize Spell, Quicken Spell, Silent Spell, Still Spell, Widen Spell -- 9 feats.

**Advanced Player's Guide:**

| Feat Name | Prerequisites | XP Cost | Notes |
|---|---|---|---|
| Bouncing Spell | none | 2 | |
| Dazing Spell | none | 2 | |
| Disruptive Spell | none | 2 | |
| Ectoplasmic Spell | none | 2 | |
| Elemental Spell | none | 2 | |
| Focused Spell | none | 2 | |
| Intensified Spell | none | 2 | |
| Lingering Spell | none | 2 | |
| Merciful Spell | none | 2 | |
| Persistent Spell | none | 2 | |
| Reach Spell | none | 2 | |
| Selective Spell | Spellcraft 10 ranks | **12** | Major outlier -- literal 1-per-rank rule applied to a 10-rank threshold |
| Sickening Spell | none | 2 | |
| Thundering Spell | none | 2 | |

**31 Item Creation + Metamagic feats total** (8 + 9 + 14).

## General / Skill (filtered -- race/class-resource-gated feats excluded)

Of 112 real General-type feats found in Core Rulebook + APG, **55 remain** after exclusion (33 of 48
Core, 22 of 64 APG).

| Feat Name | Source | Prerequisites | XP Cost | Notes |
|---|---|---|---|---|
| Acrobatic | Core | none | 2 | |
| Alertness | Core | none | 2 | |
| Animal Affinity | Core | none | 2 | |
| Athletic | Core | none | 2 | |
| Augment Summoning | Core | Spell Focus (conjuration) | 3 | |
| Combat Casting | Core | none | 2 | General-type per Paizo despite the name |
| Deceitful | Core | none | 2 | |
| Deft Hands | Core | none | 2 | |
| Diehard | Core | Endurance | 3 | |
| Endurance | Core | none | 2 | |
| Eschew Materials | Core | none | 2 | |
| Fleet | Core | none | 2 | |
| Great Fortitude | Core | none | 2 | |
| Improved Counterspell | Core | none | 2 | |
| Improved Great Fortitude | Core | Great Fortitude | 3 | |
| Improved Iron Will | Core | Iron Will | 3 | |
| Improved Lightning Reflexes | Core | Lightning Reflexes | 3 | |
| Iron Will | Core | none | 2 | |
| Leadership | Core | Character level 7th | **9** | |
| Lightning Reflexes | Core | none | 2 | |
| Magical Aptitude | Core | none | 2 | |
| Master Craftsman | Core | 5 ranks in a Craft/Profession skill | 7 | |
| Nimble Moves | Core | Dex 13 | 3 | |
| Persuasive | Core | none | 2 | |
| Run | Core | none | 2 | |
| Self-Sufficient | Core | none | 2 | |
| Skill Focus | Core | none | 2 | |
| Spell Focus | Core | none | 2 | |
| Greater Spell Focus | Core | Spell Focus | 3 | |
| Spell Penetration | Core | none | 2 | |
| Greater Spell Penetration | Core | Spell Penetration | 3 | |
| Stealthy | Core | none | 2 | |
| Toughness | Core | none | 2 | |
| Additional Traits | APG | none | 2 | |
| Arcane Blast | APG | Arcane spellcaster, caster level 10th | **13** | |
| Arcane Shield | APG | Arcane spellcaster, caster level 10th | **13** | |
| Cosmopolitan | APG | none | 2 | |
| Cooperative Crafting | APG | 1 Craft rank, any Item Creation feat | 4 | |
| Diviner's Delving | APG | Spell Focus (divination) | 3 | |
| Elemental Focus | APG | none | 2 | |
| Expanded Arcana | APG | Caster level 1st | 3 | |
| Fast Healer | APG | Con 13, Diehard, Endurance | 5 | |
| Go Unnoticed | APG | Dex 13, Small size or smaller | 4 | Size category, flagged |
| Greater Elemental Focus | APG | Elemental Focus | 3 | |
| Heroic Defiance | APG | Diehard, base Fortitude save +8 | 4 | Save-bonus prereq counted as one flat dimension, no per-point rule established |
| Heroic Recovery | APG | Diehard, base Fortitude save +4 | 4 | Same flag as Heroic Defiance |
| Improved Share Spells | APG | Spellcraft 10 ranks | 12 | Outlier, same shape as Selective Spell |
| Master Alchemist | APG | Craft (alchemy) 5 ranks | 7 | |
| Minor Spell Expertise | APG | Able to cast 4th-level spells | 3 | spell-slot capability, not a level number -- stays flat +1 |
| Major Spell Expertise | APG | Minor Spell Expertise, able to cast 9th-level spells | 4 | same judgment call |
| Parry Spell | APG | Spellcraft 15 ranks, Improved Counterspell | 18 | Outlier |
| Preferred Spell | APG | Spellcraft 5 ranks, Heighten Spell | 8 | |
| Spell Perfection | APG | Spellcraft 15 ranks, 3 metamagic feats | 20 | Largest outlier in this batch |
| Taunt | APG | Cha 13, Small size or smaller | 4 | Size category, flagged |
| Tenacious Transmutation | APG | Spell Focus (transmutation) | 3 | |

**Excluded (race- or class-resource-gated), 57 total, kept for reference:**
Core (15): Alignment Channel, Command Undead, Elemental Channel, Extra Channel, Extra Ki, Extra Lay
On Hands, Extra Mercy, Extra Performance, Extra Rage, Improved Channel, Improved Familiar, Natural
Spell, Selective Channeling, Spell Mastery, Turn Undead.
APG (42): Arcane Talent, Aspect of the Beast, Breadth of Experience, Childlike, Deep Drinker,
Deepsight, Eagle Eyes, Eclectic, Extra Bombs, Extra Discovery, Extra Hex, Extra Rage Power, Extra
Revelation, Extra Rogue Talent, Fast Drinker, Favored Defense, Fight On, Gnome Trickster, Groundling,
Improved Stonecunning, Ironguts, Ironhide, Keen Scent, Leaf Singer, Light Step, Lingering
Performance, Lucky Halfling, Pass For Human, Racial Heritage, Raging Vitality, Razortusk, Shared
Insight, Sharp Senses, Spider Step, Cloud Step, Steel Soul, Stone-Faced, Stone Singer, Summoner's
Call, Vermin Heart, War Singer, Well-Prepared. (Race-gated entries from this list now priced
separately -- see `docs/origin/nature.md`'s Racial Feats section.)

## Combat (Core Rulebook + APG, maneuver-family and Critical-tagged feats excluded)

**130 feats** (83 CRB + 47 APG). Improved/Greater Drag and Unseat/Ki Throw/Improved Ki Throw are also
excluded -- structurally the same as maneuver-family feats even though not maneuver-named.

| Feat Name | Source | Prerequisites | XP Cost | Notes |
|---|---|---|---|---|
| Agile Maneuvers | Core | None | 2 | |
| Arcane Armor Mastery | Core | Arcane Armor Training, Medium Armor Proficiency, caster level 7th | **10** | |
| Arcane Armor Training | Core | Light Armor Proficiency, caster level 3rd | **5** | |
| Arcane Strike | Core | Ability to cast arcane spells | 3 | spellcasting-capability, flagged |
| Armor Proficiency, Heavy | Core | Light and Medium Armor Proficiency | 2 | |
| Armor Proficiency, Light | Core | None | 2 | |
| Armor Proficiency, Medium | Core | Light Armor Proficiency | 2 | |
| Blind-Fight | Core | None | 2 | |
| Catch Off-Guard | Core | None | 2 | |
| Cleave | Core | Str 13, Power Attack, BAB +1 | 5 | |
| Combat Expertise | Core | Int 13 | 3 | |
| Combat Reflexes | Core | None | 2 | |
| Dazzling Display | Core | Weapon Focus | 3 | |
| Deadly Aim | Core | Dex 13, BAB +1 | 4 | |
| Deadly Stroke | Core | Dazzling Display, Greater Weapon Focus, Shatter Defenses, BAB +11 | 16 | |
| Defensive Combat Training | Core | None | 2 | |
| Deflect Arrows | Core | Dex 13, Improved Unarmed Strike | 4 | |
| Disruptive | Core | 6th-level fighter | **8** | |
| Dodge | Core | Dex 13 | 3 | |
| Double Slice | Core | Dex 15, Two-Weapon Fighting | 4 | |
| Exotic Weapon Proficiency | Core | BAB +1 | 3 | |
| Far Shot | Core | Point-Blank Shot | 3 | |
| Gorgon's Fist | Core | Improved Unarmed Strike, Scorpion Style, BAB +6 | 10 | |
| Great Cleave | Core | Str 13, Cleave, Power Attack, BAB +4 | 9 | |
| Greater Feint | Core | Combat Expertise, Improved Feint, BAB +6, Int 13 | 11 | |
| Greater Penetrating Strike | Core | Penetrating Strike, Weapon Focus, 16th-level fighter | **20** | |
| Greater Shield Focus | Core | Shield Focus, Shield Proficiency, BAB +1, 8th-level fighter | **12** | |
| Greater Two-Weapon Fighting | Core | Dex 19, Improved Two-Weapon Fighting, Two-Weapon Fighting, BAB +11 | 16 | |
| Greater Vital Strike | Core | Improved Vital Strike, Vital Strike, BAB +16 | 20 | |
| Greater Weapon Focus | Core | Weapon Focus, BAB +1, 8th-level fighter | **12** | |
| Greater Weapon Specialization | Core | Greater Weapon Focus, Weapon Focus, Weapon Specialization, 12th-level fighter | **17** | |
| Improved Critical | Core | Weapon proficiency, BAB +8 | 10 | |
| Improved Feint | Core | Int 13, Combat Expertise | 4 | |
| Improved Initiative | Core | None | 2 | |
| Improved Precise Shot | Core | Dex 19, Point-Blank Shot, Precise Shot, BAB +11 | 16 | |
| Improved Shield Bash | Core | Shield Proficiency | 2 | |
| Improved Two-Weapon Fighting | Core | Dex 17, Two-Weapon Fighting, BAB +6 | 10 | |
| Improved Unarmed Strike | Core | None | 2 | |
| Improved Vital Strike | Core | Vital Strike, BAB +11 | 14 | |
| Improvised Weapon Mastery | Core | Catch Off-Guard or Throw Anything, BAB +8 | 11 | |
| Intimidating Prowess | Core | None | 2 | |
| Lightning Stance | Core | Dex 17, Wind Stance, BAB +11 | 15 | |
| Lunge | Core | BAB +6 | 8 | |
| Manyshot | Core | Dex 17, Rapid Shot, BAB +6 | 10 | |
| Medusa's Wrath | Core | Gorgon's Fist, BAB +11 | 14 | |
| Mobility | Core | Dodge | 3 | |
| Mounted Archery | Core | Mounted Combat | 3 | |
| Mounted Combat | Core | Ride 1 rank | 3 | |
| Penetrating Strike | Core | Weapon Focus, 12th-level fighter | **15** | |
| Pinpoint Targeting | Core | Improved Precise Shot, BAB +16 | 19 | |
| Point-Blank Shot | Core | None | 2 | |
| Power Attack | Core | Str 13, BAB +1 | 4 | |
| Precise Shot | Core | Point-Blank Shot | 3 | |
| Quick Draw | Core | BAB +1 | 3 | |
| Rapid Reload | Core | Crossbow proficiency | 2 | |
| Rapid Shot | Core | Dex 13, Point-Blank Shot | 4 | |
| Ride-By Attack | Core | Mounted Combat | 3 | |
| Scorpion Style | Core | Improved Unarmed Strike | 3 | |
| Shatter Defenses | Core | Dazzling Display, BAB +6 | 9 | |
| Shield Focus | Core | Shield Proficiency, BAB +1 | 3 | |
| Shield Master | Core | Shield Slam, BAB +11 | 14 | |
| Shield Slam | Core | Improved Shield Bash, Two-Weapon Fighting, BAB +6 | 10 | |
| Shot on the Run | Core | Dex 13, Mobility, Point-Blank Shot, BAB +4 | 9 | |
| Snatch Arrows | Core | Dex 15, Deflect Arrows | 4 | |
| Spellbreaker | Core | Disruptive, 10th-level fighter | **13** | |
| Spirited Charge | Core | Ride-By Attack | 3 | |
| Spring Attack | Core | Mobility, BAB +4 | 7 | |
| Stand Still | Core | Combat Reflexes | 3 | |
| Step Up | Core | BAB +1 | 3 | |
| Strike Back | Core | BAB +11 | 13 | |
| Stunning Assault | Core | Power Attack, BAB +16 | 19 | |
| Stunning Fist | Core | Dex 13, Wis 13, Improved Unarmed Strike, BAB +8 | 13 | |
| Throw Anything | Core | None | 2 | |
| Trample | Core | Mounted Combat | 3 | |
| Two-Weapon Defense | Core | Two-Weapon Fighting | 3 | |
| Two-Weapon Fighting | Core | Dex 15 | 3 | |
| Two-Weapon Rend | Core | Double Slice, Improved Two-Weapon Fighting, BAB +11 | 15 | |
| Vital Strike | Core | BAB +6 | 8 | |
| Weapon Finesse | Core | None | 2 | |
| Weapon Focus | Core | Proficiency with weapon, BAB +1 | 3 | |
| Weapon Specialization | Core | Weapon Focus, 4th-level fighter | **7** | |
| Whirlwind Attack | Core | Dex 13, Combat Expertise, Spring Attack, BAB +4 | 9 | |
| Wind Stance | Core | Dex 15, Dodge, BAB +6 | 10 | |
| Bashing Finish | APG | Shield Master, Two-Weapon Fighting, BAB +11 | 15 | |
| Bloody Assault | APG | Power Attack, BAB +6 | 9 | |
| Bodyguard | APG | Combat Reflexes | 3 | |
| Cockatrice Strike | APG | Medusa's Wrath, BAB +14 | 17 | |
| Combat Patrol | APG | Combat Reflexes, Mobility, BAB +5 | 9 | |
| Covering Defense | APG | Shield Focus, BAB +6 | 9 | |
| Crossbow Mastery | APG | Dex 15, Rapid Reload, Rapid Shot | 5 | |
| Dazing Assault | APG | Power Attack, BAB +11 | 14 | |
| Disrupting Shot | APG | Dex 13, Point-Blank Shot, 6th-level fighter | **10** | |
| Dreadful Carnage | APG | Str 15, Furious Focus, BAB +11 | 15 | |
| Eldritch Claws | APG | Str 15, natural weapons, BAB +6 | 10 | non-mappable, not a race gate |
| Enforcer | APG | Intimidate 1 rank | 3 | |
| Focused Shot | APG | Int 13, Precise Shot | 4 | |
| Following Step | APG | Dex 13, Step Up | 4 | |
| Furious Focus | APG | Str 13, Power Attack, BAB +1 | 5 | |
| Gang Up | APG | Combat Expertise | 3 | tagged Combat, not Teamwork, on AoN |
| Greater Blind-Fight | APG | Perception 15 ranks, Improved Blind-Fight | 18 | |
| Improved Blind-Fight | APG | Perception 10 ranks, Blind-Fight | 13 | |
| Low Profile | APG | Dex 13, Small size or smaller | 4 | size category, flagged |
| Missile Shield | APG | Dex 13, Shield Focus | 4 | |
| Mounted Shield | APG | Mounted Combat, Shield Focus | 4 | |
| Mounted Skirmisher | APG | Ride 14 ranks, Mounted Combat, Trick Riding | 18 | |
| Parting Shot | APG | Dex 13, Dodge, Mobility, Shot on the Run, BAB +6 | 12 | |
| Perfect Strike | APG | Dex 13, Wis 13, Improved Unarmed Strike, BAB +8 | 13 | |
| Point-Blank Master | APG | Weapon Specialization with selected ranged weapon | 3 | |
| Punishing Kick | APG | Con 13, Wis 13, Improved Unarmed Strike, BAB +8 | 13 | |
| Pushing Assault | APG | Str 15, Power Attack, BAB +1 | 5 | |
| Ray Shield | APG | Dex 15, Missile Shield, Spellbreaker | 5 | |
| Rending Claws | APG | Str 13, two claw natural attacks, BAB +6 | 10 | non-mappable physical-trait prereq |
| Saving Shield | APG | Shield Proficiency | 2 | |
| Second Chance | APG | Combat Expertise, BAB +6 | 9 | |
| Shadow Strike | APG | BAB +1 | 3 | |
| Shield of Swings | APG | Str 13, Power Attack, BAB +1 | 5 | |
| Shield Specialization | APG | Shield Focus, 4th-level fighter | **7** | |
| Greater Shield Specialization | APG | Greater Shield Focus, Shield Specialization, 12th-level fighter | **16** | |
| Sidestep | APG | Dex 13, Dodge, Mobility | 5 | |
| Step Up and Strike | APG | Following Step, BAB +6 | 9 | |
| Swift Aid | APG | Combat Expertise, BAB +6 | 9 | |
| Team Up | APG | Gang Up, BAB +6 | 9 | tagged Combat, not Teamwork, on AoN |
| Teleport Tactician | APG | Combat Reflexes, Disruptive, Spellbreaker | 5 | |
| Touch of Serenity | APG | Wis 18, Improved Unarmed Strike, BAB +8 | 12 | |
| Trick Riding | APG | Ride 9 ranks, Mounted Combat | 12 | |
| Under and Over | APG | Agile Maneuvers, Small size or smaller | 4 | |
| Underfoot | APG | Dodge, Mobility, Small size or smaller | 5 | |

## Critical (Core + APG + Ultimate Combat)

**15 feats.** Dual-tagged Combat+Critical on AoN -- consolidated here only, not repeated above.

| Feat Name | Source | Prerequisites | XP Cost | Notes |
|---|---|---|---|---|
| Critical Focus | Core | BAB +9 | 11 | |
| Bleeding Critical | Core | Critical Focus, BAB +11 | 14 | |
| Blinding Critical | Core | Critical Focus, BAB +15 | 18 | |
| Critical Mastery | Core | Critical Focus, any two critical feats, 14th-level fighter | **19** | |
| Deafening Critical | Core | Critical Focus, BAB +13 | 16 | |
| Exhausting Critical | Core | Critical Focus, Tiring Critical, BAB +15 | 19 | Critical Focus explicitly restated, verified |
| Sickening Critical | Core | Critical Focus, BAB +11 | 14 | |
| Staggering Critical | Core | Critical Focus, BAB +13 | 16 | |
| Stunning Critical | Core | Critical Focus, Staggering Critical, BAB +17 | **21** | Real text restates both prereqs explicitly, counted as 2 feat-dimensions |
| Tiring Critical | Core | Critical Focus, BAB +13 | 16 | |
| Crippling Critical | APG | Critical Focus, BAB +13 | 16 | |
| Dispelling Critical | UC | Arcane Strike, BAB +11, ability to cast dispel magic | 15 | spellcasting-capability, flagged |
| Impact Critical Shot | UC | Dex 13, Point-Blank Shot, BAB +9 | 13 | |
| Impaling Critical | UC | Critical Focus, Weapon Specialization (piercing melee weapon), BAB +11 | 15 | |
| Improved Impaling Critical | UC | Impaling Critical, Critical Focus, Weapon Specialization (piercing melee weapon), BAB +13 | 18 | |

Excluded as out-of-scope sourcebooks: Accursed/Blighted Critical family and Critical Versatility
(Ultimate Magic); Banishing/Censoring/Destroy Identity/Dirty Critical Hit/Entreating/Flaying/
Sin-Sharing/Sneaking/Sun Striker Critical (later Player Companion/hardcover products). Improved
Critical stays in the Combat table above -- tagged Combat only, not Critical, on AoN.

## Teamwork (APG + Ultimate Combat)

**27 feats** (11 APG + 16 UC). Combat-maneuver-specific Teamwork feats (Disarm Partner, Tandem Trip,
Improved Disarm Partner) excluded per the standard rule.

| Feat Name | Source | Prerequisites | XP Cost | Notes |
|---|---|---|---|---|
| Coordinated Defense | APG | None | 2 | |
| Coordinated Maneuvers | APG | None | 2 | |
| Duck and Cover | APG | None | 2 | |
| Lookout | APG | None | 2 | |
| Paired Opportunists | APG | None | 2 | |
| Shielded Caster | APG | None | 2 | |
| Swap Places | APG | None | 2 | |
| Allied Spellcaster | APG | Caster level 1st | 3 | |
| Outflank | APG | BAB +4 | 6 | |
| Shield Wall | APG | Shield Proficiency | 2 | proficiency is not a real gate |
| Precise Strike | APG | Dex 13, BAB +1 | 4 | |
| Escape Route | UC | None | 2 | |
| Shake It Off | UC | None | 2 | |
| Stealth Synergy | UC | None | 2 | |
| Pack Attack | UC | BAB +1 | 3 | |
| Feint Partner | UC | Bluff 1 rank | 3 | |
| Back to Back | UC | Perception 3 ranks | 5 | |
| Broken Wing Gambit | UC | Bluff 5 ranks | 7 | Feint-related, not a CMB maneuver -- kept |
| Combat Medic | UC | Heal 5 ranks | 7 | |
| Cavalry Formation | UC | Mounted Combat | 3 | |
| Seize the Moment | UC | Combat Reflexes, Improved Critical | 4 | |
| Team Pickpocketing | UC | Bluff 1 rank, Sleight of Hand 1 rank | 4 | |
| Improved Back to Back | UC | Back to Back, Perception 5 ranks | 8 | |
| Enfilading Fire | UC | Point-Blank Shot, Precise Shot, one other teamwork feat | 5 | |
| Target of Opportunity | UC | Point-Blank Shot, BAB +6 | 9 | |
| Improved Feint Partner | UC | Bluff 1 rank, Combat Reflexes, Feint Partner, BAB +6 | 11 | |
| Coordinated Charge | UC | At least two other teamwork feats, BAB +10 | 14 | |

## Style (Ultimate Combat only)

**45 feats across 15 three-tier families.** Base-style prereqs are inherited by their two follow-ups.
Where a feat lists "BAB +N or monk level M," only the BAB branch is priced. **Earth Child Style
family excluded in full** -- its base feat requires "dwarf or gnome" race.

| Family | Feat | XP Cost |
|---|---|---|
| Boar | Boar Style | 6 |
| Boar | Boar Ferocity | 10 |
| Boar | Boar Shred | 14 |
| Crane | Crane Style | 6 |
| Crane | Crane Wing | 10 |
| Crane | Crane Riposte | 14 |
| Djinni | Djinni Style | 15 |
| Djinni | Djinni Spirit | 18 |
| Djinni | Djinni Spin | 21 |
| Dragon | Dragon Style | 7 |
| Dragon | Dragon Ferocity | 11 |
| Dragon | Dragon Roar | 14 |
| Efreeti | Efreeti Style | 15 |
| Efreeti | Efreeti Stance | 18 |
| Efreeti | Efreeti Touch | 21 |
| Janni | Janni Style | 9 |
| Janni | Janni Tempest | 14 |
| Janni | Janni Rush | 21 |
| Kirin | Kirin Style | 10 |
| Kirin | Kirin Strike | 17 |
| Kirin | Kirin Path | 23 |
| Mantis | Mantis Style | 7 |
| Mantis | Mantis Wisdom | 11 |
| Mantis | Mantis Torment | 15 |
| Marid | Marid Style | 15 |
| Marid | Marid Spirit | 18 |
| Marid | Marid Coldsnap | 21 |
| Monkey | Monkey Style | 14 |
| Monkey | Monkey Moves | 21 |
| Monkey | Monkey Shine | 29 |
| Panther | Panther Style | 5 |
| Panther | Panther Claw | 6 |
| Panther | Panther Parry | 7 |
| Shaitan | Shaitan Style | 15 |
| Shaitan | Shaitan Skin | 18 |
| Shaitan | Shaitan Earthblast | 21 |
| Snake | Snake Style | 7 |
| Snake | Snake Sidewind | 13 |
| Snake | Snake Fang | 21 |
| Snapping Turtle | Snapping Turtle Style | 4 |
| Snapping Turtle | Snapping Turtle Clutch | 8 |
| Snapping Turtle | Snapping Turtle Shell | 11 |
| Tiger | Tiger Style | 6 |
| Tiger | Tiger Claws | 10 |
| Tiger | Tiger Pounce | 15 |

Snapping Turtle Clutch/Shell prereq "Improved Grapple" (a maneuver-family feat) -- not excluded since
they're primarily unarmed-fighting-style feats referencing it as one input; flagged in case that
changes once Grapple gets its own DC-based conversion pass.

## Grit / Panache

**Zero qualifying feats.** All 7 real Ultimate Combat Grit feats require the grit class feature (or
Amateur Gunslinger, which just grants access to the same resource) -- excluded per the class-resource
rule. Gunsmithing has no prerequisites but isn't Grit-tagged at all on AoN. Panache and the
swashbuckler class don't exist in Core/APG/Ultimate Combat -- introduced in the 2014 Advanced Class
Guide, outside this pass's scope.

## Grand total

**317 feats priced**: 8 Item Creation + 23 Metamagic + 55 General/Skill (of 112 found, 57 excluded) +
131 Combat (of 143 found, 11 folded into Critical, 2 excluded as Drag-maneuver-family) + 15 Critical
+ 27 Teamwork + 45 Style + 0 Grit/Panache.

## Remediation applied (numbered-level prerequisites now scale +1/point, not flat +1)

19 rows changed from an earlier flat-+1 treatment: Brew Potion, Craft Magic Arms and Armor, Craft
Rod, Craft Staff, Craft Wand, Craft Wondrous Item, Forge Ring, Leadership, Arcane Blast, Arcane
Shield, Arcane Armor Mastery, Arcane Armor Training, Disruptive, Greater Penetrating Strike, Greater
Shield Focus, Greater Weapon Focus, Greater Weapon Specialization, Penetrating Strike, Spellbreaker,
Weapon Specialization, Disrupting Shot, Shield Specialization, Critical Mastery. Scribe Scroll,
Expanded Arcana, and Allied Spellcaster are unaffected (their level requirement is 1, so flat and
per-point coincide). Minor/Major Spell Expertise deliberately unaffected -- "able to cast Nth-level
spells" is a capability, not a level number.

## How to apply

Real draft content, not yet reviewed line-by-line for internal consistency (whether a cost-2 feat and
a cost-21 feat actually feel proportionate in play). The double-digit skill-rank outliers (Selective
Spell, Improved Share Spells, Parry Spell, Spell Perfection, most of the Style family, Greater
Blind-Fight, Mounted Skirmisher) were explicitly flagged as a possible double-charge against the
skill-rank-cost curve and kept as literal formula output by deliberate choice, not oversight.
