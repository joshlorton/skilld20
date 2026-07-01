export interface MaterialEntry {
  name: string;
  nicknames: string[];
  physical_description: string;
  type: string;
  location: string;
  use: string;
  effect: string;
  traits: string[];
  source: string;
  legacy_info: string;
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
