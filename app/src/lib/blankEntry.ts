import type { MaterialEntry, SpellEntry } from '../types/materials';

export function blankMaterialEntry(): MaterialEntry {
  return {
    name: '',
    nicknames: [],
    physical_description: '',
    type: '',
    location: '',
    use: '',
    effect: '',
    traits: [],
    source: '',
    legacy_info: '',
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
