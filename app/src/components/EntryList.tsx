import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { EntrySectionConfig } from '../lib/entryConfig';
import { IconNewFile } from './icons';

type SortDir = 'asc' | 'desc';

interface Props<T> {
  config: EntrySectionConfig<T>;
  rows: T[];
  editable?: boolean;
  onRowDoubleClick?: (index: number) => void;
  onAddEntry?: () => void;
}

export function EntryList<T>({ config, rows, editable = false, onRowDoubleClick, onAddEntry }: Props<T>) {
  const columns = config.listColumns;
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
  }, [columns]);

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
      columns.every((col) => {
        const needle = filters[col.key]?.trim().toLowerCase();
        if (!needle) return true;
        return col.text(row).toLowerCase().includes(needle);
      }),
    );
  }, [indexed, columns, filters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const withKey = filtered.map((item) => ({ ...item, key: col.text(item.row).toLowerCase() }));
    withKey.sort((a, b) => a.key.localeCompare(b.key) * (sortDir === 'asc' ? 1 : -1));
    return withKey;
  }, [filtered, columns, sortKey, sortDir]);

  function handleRowClick(index: number) {
    setSelectedIndex(index);
  }

  return (
    <div className="mat-table">
      <div className="mat-header-row" ref={labelRowRef}>
        {columns.map((col) => (
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
        {columns.map((col) => (
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
          {columns.map((col) => (
            <div key={col.key} className={col.cls}>
              {col.render(row)}
            </div>
          ))}
          {editable && <div className="mat-cell mat-row-actions" />}
        </div>
      ))}
      {sorted.length === 0 && (
        <div className="mat-empty-row">No entries match the current filters.</div>
      )}
    </div>
  );
}
