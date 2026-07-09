// Matches OPTS.rarity/OPTS.difficulty in scripts/foundations.js and the
// trait-rarity-*/trait-difficulty-* classes in css/shared.css -- one
// standardized 7-tier scale, reused for both taxonomies (same color ramp by
// tier position) across Foundations, Materials, Rituals, and Crafting.
export const RARITY_TIERS: { value: string; label: string }[] = [
  { value: 'abundant', label: 'Abundant' },
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'very rare', label: 'Very Rare' },
  { value: 'extremely rare', label: 'Extremely Rare' },
  { value: 'unique', label: 'Unique' },
];

export const DIFFICULTY_TIERS: { value: string; label: string }[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'easy', label: 'Easy' },
  { value: 'average', label: 'Average' },
  { value: 'hard', label: 'Hard' },
  { value: 'very hard', label: 'Very Hard' },
  { value: 'extremely hard', label: 'Extremely Hard' },
  { value: 'monumental', label: 'Monumental' },
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}

/** Generic lookups for a given tier list -- used where the active taxonomy
 * (Rarity vs. Difficulty) is chosen dynamically via EntrySectionConfig
 * (e.g. Crafting's "Difficulty" field uses DIFFICULTY_TIERS, not RARITY_TIERS). */
export function tierLabel(tiers: { value: string; label: string }[], value: string): string {
  return tiers.find((t) => t.value === value)?.label ?? value;
}

export function tierClass(classPrefix: string, value: string): string {
  return value ? `${classPrefix}-${slugify(value)}` : '';
}

export function rarityLabel(value: string): string {
  return tierLabel(RARITY_TIERS, value);
}

export function difficultyLabel(value: string): string {
  return tierLabel(DIFFICULTY_TIERS, value);
}

export function rarityClass(value: string): string {
  return tierClass('trait-rarity', value);
}

export function difficultyClass(value: string): string {
  return tierClass('trait-difficulty', value);
}
