import type { MaterialEntry, SpellEntry } from '../types/materials';
import type { RitualEntry } from '../types/rituals';
import type { CraftingEntry } from '../types/crafting';

export function blankMaterialEntry(): MaterialEntry {
  return {
    name: '',
    nicknames: [],
    rarity: '',
    color: '',
    other: '',
    location: '',
    cut: '',
    item_types: '',
    effect: '',
    traits: [],
    source: '',
    legacy_description: '',
    legacy_effects: '',
  };
}

export function blankSpellEntry(): SpellEntry {
  return {
    name: '',
    nicknames: [],
    spell_class: '',
    level: '',
    school: '',
    casting: '',
    range: '',
    area: '',
    duration: '',
    save: '',
    effect: '',
    traits: [],
  };
}

export function blankRitualEntry(): RitualEntry {
  return {
    name: '',
    nicknames: [],
    rarity: '',
    description: '',
    focus: '',
    requirements: '',
    duration: '',
    effect: '',
    traits: [],
    source: '',
    legacy_description: '',
    legacy_effects: '',
  };
}

export function blankCraftingEntry(): CraftingEntry {
  return {
    name: '',
    nicknames: [],
    rarity: '',
    description: '',
    materials_tools: '',
    time_or_dc: '',
    effect: '',
    traits: [],
    source: '',
    legacy_description: '',
    legacy_effects: '',
  };
}
