import { CATEGORIES, type Category } from '../lib/categories';

export type { Category };

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
