import type { MaterialCategory } from '../types/materials';

export type Category = MaterialCategory | 'spells';

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'enchanted', label: 'Enchanted Materials' },
  { key: 'spells', label: 'Enchantment Spells' },
  { key: 'gems', label: 'Gems & Stones' },
  { key: 'herbs', label: 'Herbs & Plants' },
  { key: 'treatments', label: 'Metal Treatments' },
  { key: 'metals', label: 'Metals' },
  { key: 'woods', label: 'Woods' },
];
