export interface RitualEntry {
  name: string;
  nicknames: string[];
  rarity: string;
  /** Primary flavor/description text. */
  description: string;
  /** Ritual focus / physical trappings -- the specific-attribute slot, parallel to Materials' "color". */
  focus: string;
  /** Casting requirements: components, cost, prerequisites. */
  requirements: string;
  /** Time/duration to perform. */
  duration: string;
  /** Common effects. */
  effect: string;
  traits: string[];
  source: string;
  legacy_description: string;
  legacy_effects: string;
}
