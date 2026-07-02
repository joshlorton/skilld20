import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MaterialEntry } from '../types/materials';
import { rarityLabel, rarityClass } from '../lib/rarity';
import { IconNewFile } from './icons';

interface ListColumn {
  key: string;
  label: string;
  cls: string;
  text: (row: MaterialEntry) => string;
}

const LIST_COLUMNS: ListColumn[] = [
  {
    key: 'name',
    label: 'Name',
    cls: 'mat-cell mat-name',
    text: (r) => [r.name, r.nicknames.join(', '), rarityLabel(r.rarity)].filter(Boolean).join(' '),
  },
  {
    key: 'physical',
    label: 'Physical Description',
    cls: 'mat-cell flex-2 mat-desc',
    text: (r) => [r.color, r.other].filter(Boolean).join(' '),
  },
  {
    key: 'effect',
    label: 'Common Effects',
    cls: 'mat-cell flex-2 mat-effect',
    text: (r) => r.effect,
  },
  {
    key: 'traits',
    label: 'Traits',
    cls: 'mat-cell flex-1 mat-notes',
    text: (r) => r.traits.join(', '),
  },
];

type SortDir = 'asc' | 'desc';

interface Props {
  rows: MaterialEntry[];
  editable?: boolean;
  onRowClick?: (index: number) => void;
  onRowDoubleClick?: (index: number) => void;
  onAddEntry?: () => void;
}

export function MaterialsList({ rows, editable = false, onRowClick, onRowDoubleClick, onAddEntry }: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const labelRowRef = useRef<HTMLDivElement>(null);
  const [labelRowHeight, setLabelRowHeight] = useState(0);

  useLayoutEffect(() => {
    const el = labelRowRef.current;
    if (!el) return;
    const update = () => setLabelRowHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const indexed = useMemo(() => rows.map((row, index) => ({ row, index })), [rows]);

  const filtered = useMemo(() => {
    return indexed.filter(({ row }) =>
      LIST_COLUMNS.every((col) => {
        const needle = filters[col.key]?.trim().toLowerCase();
        if (!needle) return true;
        return col.text(row).toLowerCase().includes(needle);
      }),
    );
  }, [indexed, filters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = LIST_COLUMNS.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const withKey = filtered.map((item) => ({ ...item, key: col.text(item.row).toLowerCase() }));
    withKey.sort((a, b) => a.key.localeCompare(b.key) * (sortDir === 'asc' ? 1 : -1));
    return withKey;
  }, [filtered, sortKey, sortDir]);

  function handleRowClick(index: number) {
    setSelectedIndex(index);
    onRowClick?.(index);
  }

  return (
    <div className="mat-table">
      <div className="mat-header-row" ref={labelRowRef}>
        {LIST_COLUMNS.map((col) => (
          <div
            key={col.key}
            className={col.cls}
            onClick={() => toggleSort(col.key)}
            style={{ cursor: 'pointer' }}
            title="Click to sort"
          >
            {col.label}
            {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
          </div>
        ))}
        {editable && (
          <div className="mat-cell mat-row-actions">
            <button
              type="button"
              className="mat-row-icon-btn mat-title-new-btn"
              title="New entry"
              onClick={() => onAddEntry?.()}
            >
              <IconNewFile />
            </button>
          </div>
        )}
      </div>
      <div className="mat-header-row mat-filter-row" style={{ top: labelRowHeight }}>
        {LIST_COLUMNS.map((col) => (
          <div key={col.key} className={col.cls}>
            <input
              type="text"
              className="mat-filter-input"
              placeholder="Filter…"
              value={filters[col.key] ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, [col.key]: e.target.value }))}
            />
          </div>
        ))}
        {editable && <div className="mat-cell mat-row-actions" />}
      </div>
      {sorted.map(({ row, index }) => (
        <div
          className={`mat-row${selectedIndex === index ? ' is-selected' : ''}`}
          key={index}
          onClick={() => handleRowClick(index)}
          onDoubleClick={() => onRowDoubleClick?.(index)}
        >
          <div className="mat-cell mat-name">
            <div className="mat-name-primary">{row.name || ''}</div>
            {row.nicknames.length > 0 && (
              <div className="mat-name-aka">AKA: {row.nicknames.join(', ')}</div>
            )}
            {row.rarity && (
              <div className="mat-name-rarity">
                <span className={`trait-tag ${rarityClass(row.rarity)}`}>{rarityLabel(row.rarity)}</span>
              </div>
            )}
          </div>
          <div className="mat-cell flex-2 mat-desc">
            {row.color && <div className="mat-desc-color">{row.color}</div>}
            <div className="mat-desc-other">{row.other}</div>
          </div>
          <div className="mat-cell flex-2 mat-effect">{row.effect}</div>
          <div className="mat-cell flex-1 mat-notes">{row.traits.join(', ')}</div>
          {editable && <div className="mat-cell mat-row-actions" />}
        </div>
      ))}
      {sorted.length === 0 && (
        <div className="mat-empty-row">No entries match the current filters.</div>
      )}
    </div>
  );
}
