export interface CraftingEntry {
  name: string;
  nicknames: string[];
  /** Reuses the shared RARITY_TIERS taxonomy, labeled "Difficulty" in this section's config. */
  rarity: string;
  description: string;
  /** Required materials / tools. */
  materials_tools: string;
  /** Time or DC to craft. */
  time_or_dc: string;
  /** Common effects / result. */
  effect: string;
  traits: string[];
  source: string;
  legacy_description: string;
  legacy_effects: string;
}

export const CRAFTING_CATEGORIES: string[] = [
  'Alchemy',
  'Armorer',
  'Blacksmithing',
  'Bowyer/Fletcher',
  'Brewing',
  'Cobbling',
  'Gem Cutting',
  'Jeweler',
  'Leatherworking',
  'Machinist',
  'Painting',
  'Pottery',
  'Sculpting',
  'Taxidermy',
  'Weapon Smithing',
  'Woodworking',
];
