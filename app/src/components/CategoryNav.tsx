import type { MaterialCategory } from '../types/materials';

export type Category = MaterialCategory | 'spells';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'enchanted', label: 'Enchanted Materials' },
  { key: 'spells', label: 'Enchantment Spells' },
  { key: 'gems', label: 'Gems & Stones' },
  { key: 'herbs', label: 'Herbs & Plants' },
  { key: 'treatments', label: 'Metal Treatments' },
  { key: 'metals', label: 'Metals' },
  { key: 'woods', label: 'Woods' },
];

interface Props {
  active: Category;
  onSelect: (cat: Category) => void;
}

export function CategoryNav({ active, onSelect }: Props) {
  return (
    <div id="item-list">
      {CATEGORIES.map((c) => (
        <div
          key={c.key}
          className={c.key === active ? 'list-item list-item-active' : 'list-item'}
          onClick={() => onSelect(c.key)}
        >
          {c.label}
        </div>
      ))}
    </div>
  );
}
