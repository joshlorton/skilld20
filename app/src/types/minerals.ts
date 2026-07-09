export interface MineralCraftingRow {
  skill: string;
  preparation: string;
  difficulty: string;
  item_types: string;
}

export interface MineralEffectRow {
  item_type: string;
  effect: string;
}

export interface MineralLegacyRow {
  source: string;
  description: string;
}

export interface MineralMythRow {
  culture: string;
  tier: string;
  description: string;
  primary_source: string;
}

/** New schema for the `gems` category only -- other Materials categories
 * (herbs/metals/treatments/woods/enchanted) keep the older MaterialEntry
 * shape in types/materials.ts. The location- and identity-prefixed fields
 * are flat rather than nested objects so the existing FieldDef/fieldValue
 * machinery in EntryDetail.tsx (plain source[field.key] access) needs no
 * changes for scalar fields. */
export interface MineralEntry {
  name: string;
  nicknames: string[];
  rarity: string;
  color: string;

  // Section 1 -- Identity (location)
  location_climate: string;
  location_biome: string;
  /** Freeform, takes precedence for setting-specific locations. */
  location_override: string;

  // Section 2 -- Crafting (repeatable, one row per applicable skill)
  crafting: MineralCraftingRow[];

  // Section 3 -- Commonly Known Effects (repeatable, per item type/usage)
  effects: MineralEffectRow[];

  // Section 4 -- Traits
  traits: string[];

  // Section 5 -- Legacy/Fictional Info (repeatable)
  legacy: MineralLegacyRow[];

  // Section 6 -- Historical/Real-World: Material Identity (single block)
  identity_hardness: string;
  identity_crystal_system: string;
  identity_chemical_formula: string;
  identity_color_cause: string;
  identity_locale: string;
  identity_region: string;
  /** Hand-linked by name -- no stable ID system across entries. */
  identity_related_materials: string[];

  // Section 6 -- Historical/Real-World: Myths, Legends & Ritual Use (repeatable)
  myths: MineralMythRow[];
}
