export interface CraftingRow {
  skill: string;
  preparation: string;
  difficulty: string;
  item_types: string;
}

export interface EffectRow {
  item_type: string;
  effect: string;
}

export interface LegacyRow {
  source: string;
  description: string;
}

export interface MythRow {
  culture: string;
  tier: string;
  description: string;
  primary_source: string;
}

/** Shared schema across all 6 Materials categories. The location- and
 * identity-prefixed fields are flat rather than nested objects so the
 * existing FieldDef/fieldValue machinery in EntryDetail.tsx (plain
 * source[field.key] access) needs no changes for scalar fields. */
export interface MaterialEntry {
  name: string;
  nicknames: string[];
  rarity: string;
  color: string;

  // Identity: location (multi-select -- a material can occur across several climates/biomes)
  location_climate: string[];
  location_biome: string[];
  /** Freeform, takes precedence for setting-specific locations. */
  location_override: string;

  // Crafting (repeatable, one row per applicable skill)
  crafting: CraftingRow[];

  // Commonly Known Effects (repeatable, per item type/usage)
  effects: EffectRow[];

  // Traits
  traits: string[];

  // Legacy/Fictional Info (repeatable)
  legacy: LegacyRow[];

  // Historical/Real-World: Material Identity (single block)
  identity_hardness: string;
  identity_crystal_system: string;
  identity_chemical_formula: string;
  identity_color_cause: string;
  identity_locale: string;
  identity_region: string;
  /** Hand-linked by name -- no stable ID system across entries. */
  identity_related_materials: string[];

  // Historical/Real-World: Myths, Legends & Ritual Use (repeatable)
  myths: MythRow[];
}

export interface SpellEntry {
  name: string;
  nicknames: string[];
  spell_class: string;
  level: string;
  school: string;
  casting: string;
  range: string;
  area: string;
  duration: string;
  save: string;
  effect: string;
  traits: string[];
}

export const MATERIAL_CATEGORIES = [
  'gems',
  'herbs',
  'metals',
  'treatments',
  'woods',
  'enchanted',
] as const;

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

export interface MaterialsData extends Record<MaterialCategory, MaterialEntry[]> {
  spells: SpellEntry[];
}
