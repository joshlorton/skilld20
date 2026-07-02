// Matches OPTS.rarity in scripts/foundations.js and the trait-rarity-*
// classes in css/shared.css -- reusing the same taxonomy so "rarity" means
// the same thing across Foundations and Materials.
export const RARITY_TIERS: { value: string; label: string }[] = [
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'unique', label: 'Unique' },
];

export function rarityLabel(value: string): string {
  return RARITY_TIERS.find((t) => t.value === value)?.label ?? value;
}

export function rarityClass(value: string): string {
  return value ? `trait-rarity-${value.toLowerCase()}` : '';
}
