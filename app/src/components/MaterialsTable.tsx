import { useMemo, useState } from 'react';
import type { ColumnDef } from '../lib/columns';

interface RowBase {
  name: string;
  nicknames: string[];
  traits: string[];
  legacy_info?: string;
  source?: string;
}

interface Props<T extends RowBase> {
  columns: ColumnDef<T>[];
  rows: T[];
}

type SortDir = 'asc' | 'desc';

function cellText<T extends RowBase>(row: T, col: ColumnDef<T>): string {
  const value = row[col.key];
  if (Array.isArray(value)) return value.join(', ');
  return value == null ? '' : String(value);
}

export function MaterialsTable<T extends RowBase>({ columns, rows }: Props<T>) {
  const [sortKey, setSortKey] = useState<(keyof T & string) | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  function toggleSort(key: keyof T & string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    return rows.filter((row) =>
      columns.every((col) => {
        const needle = filters[col.key]?.trim().toLowerCase();
        if (!needle) return true;
        return cellText(row, col).toLowerCase().includes(needle);
      }),
    );
  }, [rows, columns, filters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const withKey = filtered.map((row) => ({ row, key: cellText(row, col).toLowerCase() }));
    withKey.sort((a, b) => a.key.localeCompare(b.key) * (sortDir === 'asc' ? 1 : -1));
    return withKey.map((w) => w.row);
  }, [filtered, columns, sortKey, sortDir]);

  return (
    <div className="mat-table">
      <div className="mat-header-row">
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
      </div>
      <div className="mat-header-row mat-filter-row">
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
      </div>
      {sorted.map((row, idx) => (
        <div className="mat-row" key={row.name + idx}>
          {columns.map((col) => (
            <div key={col.key} className={col.cls}>
              {col.key === 'name' ? (
                <>
                  <div className="mat-name-primary">{row.name || ''}</div>
                  {row.nicknames.length > 0 && (
                    <div className="mat-name-aka">AKA: {row.nicknames.join(', ')}</div>
                  )}
                </>
              ) : col.hasSource ? (
                <>
                  {row.legacy_info && <div className="mat-notes-text">{row.legacy_info}</div>}
                  {row.source && <div className="mat-name-aka">Source: {row.source}</div>}
                </>
              ) : (
                cellText(row, col)
              )}
            </div>
          ))}
        </div>
      ))}
      {sorted.length === 0 && <div className="mat-empty-row">No entries match the current filters.</div>}
    </div>
  );
}
