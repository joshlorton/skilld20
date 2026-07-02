import type { MaterialEntry, SpellEntry } from '../types/materials';

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
