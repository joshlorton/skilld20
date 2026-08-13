# SKILLd20 Skills -- Combat Maneuvers

Combat maneuvers (Disarm, Trip, and the rest of the family: Sunder, Bull Rush, Grapple, Reposition,
Steal, Dirty Trick, Overrun, Drag) are **not Feats**. They're richly-detailed `SkillAction` entries
under a shared skill (working name "Combat Maneuvers") -- a base four-degree result table, an
automatic rank-gated progression, and an optional situational DC-surcharge menu chosen at time of
use. This whole shape maps directly onto the standard skill entry format in `core-mechanics.md`.

## Architecture

**Each maneuver is its own Focus** under the shared Combat Maneuvers skill, not just a bonus riding
on weapon/unarmed skill. Reasoning: "someone could be very good at disarm due to practice, but that
practice shouldn't bleed over to trip." Weapon/unarmed skill still matters -- it isn't the *only*
input.

**Check/defense formulas** (opposed roll, Pathfinder CMB-vs-CMD shape -- not a check against a flat
universal DC):
> CM check = d20 + weapon/unarmed skill + CM Focus rank + modifiers
> CM defense = 10 + weapon/unarmed skill + CM Focus rank + modifiers

Both sides use the same two numbers (general weapon/unarmed skill + that specific maneuver's own
Focus rank) from their own perspective -- your own Disarm Focus rank is what makes *you* harder to
disarm, not just your general combat skill.

## General rules (apply to every maneuver conversion, not just Disarm/Trip)

1. **Rerolls are rejected** as a design pattern for basic-tier skill effects -- "roll twice, take the
   better result" was explicitly turned down as too swingy for a baseline unlock.
2. **Every maneuver's rank progression gets a 2-tier Reaction pair by default** (basic at rank 5,
   upgraded-combo version at rank 10), even when the real source material only had one real teamwork
   feat for that maneuver -- fill the upgrade slot with whatever that maneuver's own "dirty/combo"
   surcharge is.
3. **The crit-trigger free-maneuver pattern generalizes to every maneuver** -- a "free action to
   attempt this maneuver after landing a critical hit" unlock at rank 9.
4. **The provoke-AoO-reduction-by-rank progression generalizes to every maneuver**: full AoO at rank
   0 -> Failure/Critical-Failure only at rank 2 -> Critical-Failure only at rank 4 -> none at rank 6.

**Redundancy filter, useful when converting any new maneuver from a legacy system:** if a legacy
"Improved/Greater X" feat's entire effect is a flat numeric bonus to the maneuver check, it's already
redundant once maneuver checks scale with rank the way attacks do -- skip it, don't convert it. Only
convert the non-numeric riders (removing an AoO, changing what happens on a hit, unlocking a new
trigger, combining two maneuvers into one roll). This isn't universal, though -- Trip's "Greater Trip"
turned out to carry a real non-numeric rider (a free follow-up attack) once checked directly, so
verify each maneuver rather than assuming the filter clears everything.

## Disarm: final draft

**Base result** (four degrees) -- also reaches 1 size category larger than the attacker by default:
- **Critical Success:** target loses grip with one hand (one item dropped)
- **Success:** attacker's choice of Weaken Grip 2 or Off-Guard/Flat-Footed on the target (until the start of your next turn)
- **Failure:** no effect
- **Critical Failure:** the backfire lands on you instead -- same choice of Weaken Grip 2 or Off-Guard/Flat-Footed

**Conditions:**
- **Weaken Grip N** -- variable severity. N drives both sides: -N penalty to the afflicted creature's
  own attacks, +N bonus for anyone else attempting to disarm them. Cleared by spending 1 action to
  regrip. N=2 is the base severity granted by plain Disarm's Success.
- **Off-Guard/Flat-Footed** -- -2 AC; susceptible to abilities keying off this condition.
- **Dirty Trick** (for the Dirty Disarm combo) -- inflicts a condition until the end of your next
  turn; 1 action to end.

**Rank progression:**

| Rank | Benefit |
|---|---|
| 0 | No proficiency bonus; provoke AoO on all CM attempts |
| 1 | Proficiency bonus gained (+2) |
| 2 | Provoke AoO only on Failure/Critical Failure |
| 4 | Provoke AoO only on Critical Failure |
| 5 | **Reaction:** when an ally fails to disarm a target within your melee reach, you may attempt to disarm that same target |
| 6 | No longer provoke AoO on CM attempts at all |
| 7 | Disarming Stance +1, reach 2 sizes larger |
| 8 | **Disarming Twist:** after a successful strike, an immediate follow-up attack is also treated as a Disarm attempt |
| 9 | **Disarming Strike:** disarm as a free action after landing a critical hit |
| 10 | **Reaction, upgraded:** same trigger as rank 5, but you may attempt a *Dirty Disarm* instead |
| 11 | Disarming Stance +2, reach 2 sizes larger |
| 12 | **Disarming Twist, upgraded:** the follow-up Disarm now uses its own stronger table -- Crit Success = target drops two items; Success = Weaken Grip 4 or Off-Guard/Flat-Footed; Failure = Weaken Grip 2 or Off-Guard/Flat-Footed (a failure now does something); Crit Failure = backfires on you |
| 15 | Disarming Stance +3, reach 2 sizes larger |
| 19 | Disarming Stance +4, reach 3 sizes larger |

(Ranks 3, 13, 14, 16-18, 20 currently blank.)

**Skill DC surcharge menu** (opt-in at time of use, additive/stacking):
- **Greater Disarm:** +3 DC per 5 feet the disarmed weapon is thrown, random direction. Distance cap:
  5 feet per 2 ranks in the Disarm Focus.
- **Directed Disarm:** Greater Disarm's cost +5 more, to choose the direction instead of random.
- **Offensive Disarm:** Directed Disarm's total +8 more, to make a free-action ranged attack (RI
  10'/5') with the disarmed weapon if light/one-handed.
- **Dirty Disarm:** a separate, non-stacking flat +10 DC to attempt Disarm and Dirty Trick as one
  action.

## Trip: final draft

**Base result** (four degrees):
- **Critical Success:** target falls prone and takes damage
- **Success:** target falls prone
- **Failure:** no effect
- **Critical Failure:** the backfire lands on you instead -- you fall prone

**Rank progression:**

| Rank | Benefit |
|---|---|
| 0 | No proficiency bonus; provoke AoO on all CM attempts; target can be 1 size larger |
| 1 | Proficiency bonus gained (+2) |
| 2 | Provoke AoO only on Failure/Critical Failure |
| 4 | Provoke AoO only on Critical Failure |
| 5 | **Reaction:** same shape as Disarm's rank-5 reaction |
| 6 | No longer provoke AoO on CM attempts at all |
| 7 | **Tripping Twist:** after a successful strike, an immediate follow-up attack is also treated as a Trip attempt |
| 8 | **Greater Trip:** after you successfully trip the target, you may make a free-action attack against them |
| 9 | **Tripping Strike:** trip as a free action after landing a critical hit |
| 10 | **Reaction, upgraded:** same trigger as rank 5, but you may attempt a *Dirty Trip* instead |
| 11 | Target can be 2 sizes larger (Trip has no "Stance" bonus track the way Disarm does, only size growth) |
| 20 | Target can be 3 sizes larger |

(Ranks 3, 12-19 currently blank -- Trip's progression is sparser than Disarm's.)

**Skill DC surcharge:** **Dirty Trip** -- flat +10 DC to attempt Trip and Dirty Trick as one action.
No distance-scaling surcharges exist for Trip (tripping has no analog to "how far the weapon flies").

**Explicitly deferred, not resolved:** Vicious Stomp (a real PF1e feat that grants an AoO whenever
*any* foe falls prone adjacent to you, not gated by the Trip chain at all -- unclear whether it
belongs in Trip's own table or a separate general-combat track) and Ranged Trip's extra wrinkles
(bonus weapon damage on success, immunity to self-trip on failure).

## Remaining maneuvers still needing conversion

Sunder, Bull Rush, Grapple, Reposition, Steal, Overrun, Dirty Trick, and Drag all follow the same
skeleton in their legacy source material (an ability-score gate, an Improved tier, a Greater tier at
higher BAB, sometimes a capstone) -- expect the same redundancy filter and general rules above to
clear most of each family, but each still needs its own pass to find the real non-numeric content,
the way Trip's stress-test surfaced genuinely new complications Disarm's didn't (multiple
follow-up-attack triggers, teamwork content only one tier deep, a source maneuver whose real rules
are binary rather than already-structured as four degrees).
