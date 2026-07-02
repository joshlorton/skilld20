interface Props {
  categories: { key: string; label: string }[];
  active: string;
  onSelect: (cat: string) => void;
}

export function CategoryNav({ categories, active, onSelect }: Props) {
  return (
    <div id="item-list">
      {categories.map((c) => (
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
