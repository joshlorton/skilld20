export interface MaterialEntry {
  name: string;
  nicknames: string[];
  rarity: string;
  color: string;
  other: string;
  location: string;
  cut: string;
  item_types: string;
  effect: string;
  traits: string[];
  source: string;
  legacy_description: string;
  legacy_effects: string;
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
