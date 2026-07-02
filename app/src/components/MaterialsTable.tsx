import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ColumnDef } from '../lib/columns';
import { EditableField, EditableArrayField } from './EditableField';
import { IconSave, IconCancel, IconDelete, IconNewFile } from './icons';

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
  editable?: boolean;
  onCellCommit?: (index: number, patch: Partial<T>) => void;
  /** Writes the whole current dataset to GitHub (same action for every row). */
  onSave?: () => void;
  /** Reverts this row's edits back to the last-saved snapshot (removes it if never saved). */
  onCancelRow?: (index: number) => void;
  /** Called only after the row's own delete confirmation. */
  onConfirmDelete?: (index: number) => void;
  /** Appends a new blank entry to this category. */
  onAddEntry?: () => void;
}

type SortDir = 'asc' | 'desc';

function cellText<T extends RowBase>(row: T, col: ColumnDef<T>): string {
  const value = row[col.key];
  if (Array.isArray(value)) return value.join(', ');
  return value == null ? '' : String(value);
}

export function MaterialsTable<T extends RowBase>({
  columns,
  rows,
  editable = false,
  onCellCommit,
  onSave,
  onCancelRow,
  onConfirmDelete,
  onAddEntry,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<(keyof T & string) | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  // Column labels can wrap to two lines, so the label row's height isn't
  // fixed -- measure it so the filter row can stick directly beneath it
  // instead of overlapping at the same `top: 0`.
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

  function toggleSort(key: keyof T & string) {
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
        return cellText(row, col).toLowerCase().includes(needle);
      }),
    );
  }, [indexed, columns, filters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const withKey = filtered.map((item) => ({
      ...item,
      key: cellText(item.row, col).toLowerCase(),
    }));
    withKey.sort((a, b) => a.key.localeCompare(b.key) * (sortDir === 'asc' ? 1 : -1));
    return withKey;
  }, [filtered, columns, sortKey, sortDir]);

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
        <div className="mat-row" key={index}>
          {columns.map((col) => (
            <div key={col.key} className={col.cls}>
              {col.key === 'name' ? (
                editable ? (
                  <>
                    <EditableField
                      className="mat-name-primary-input"
                      value={row.name}
                      onCommit={(v) => onCellCommit?.(index, { name: v } as Partial<T>)}
                    />
                    <EditableArrayField
                      className="mat-name-aka-input"
                      value={row.nicknames}
                      onCommit={(v) => onCellCommit?.(index, { nicknames: v } as Partial<T>)}
                    />
                  </>
                ) : (
                  <>
                    <div className="mat-name-primary">{row.name || ''}</div>
                    {row.nicknames.length > 0 && (
                      <div className="mat-name-aka">AKA: {row.nicknames.join(', ')}</div>
                    )}
                  </>
                )
              ) : col.hasSource ? (
                editable ? (
                  <>
                    <EditableField
                      multiline
                      value={row.legacy_info ?? ''}
                      onCommit={(v) => onCellCommit?.(index, { legacy_info: v } as Partial<T>)}
                    />
                    <EditableField
                      className="mat-name-aka-input"
                      value={row.source ?? ''}
                      onCommit={(v) => onCellCommit?.(index, { source: v } as Partial<T>)}
                    />
                  </>
                ) : (
                  <>
                    {row.legacy_info && <div className="mat-notes-text">{row.legacy_info}</div>}
                    {row.source && <div className="mat-name-aka">Source: {row.source}</div>}
                  </>
                )
              ) : col.key === 'traits' ? (
                editable ? (
                  <EditableArrayField
                    value={row.traits}
                    onCommit={(v) => onCellCommit?.(index, { traits: v } as Partial<T>)}
                  />
                ) : (
                  row.traits.join(', ')
                )
              ) : editable ? (
                <EditableField
                  multiline={col.multiline}
                  value={cellText(row, col)}
                  onCommit={(v) => onCellCommit?.(index, { [col.key]: v } as Partial<T>)}
                />
              ) : (
                cellText(row, col)
              )}
            </div>
          ))}
          {editable && (
            <div className="mat-cell mat-row-actions">
              {confirmIndex === index ? (
                <>
                  <button
                    type="button"
                    className="mat-row-icon-btn btn-delete-action"
                    title="Confirm delete"
                    onClick={() => {
                      onConfirmDelete?.(index);
                      setConfirmIndex(null);
                    }}
                  >
                    <IconDelete />
                  </button>
                  <button
                    type="button"
                    className="mat-row-icon-btn btn-cancel-action"
                    title="Keep entry"
                    onClick={() => setConfirmIndex(null)}
                  >
                    <IconCancel />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="mat-row-icon-btn btn-save-action"
                    title="Save to GitHub"
                    onClick={() => onSave?.()}
                  >
                    <IconSave />
                  </button>
                  <button
                    type="button"
                    className="mat-row-icon-btn btn-cancel-action"
                    title="Revert changes"
                    onClick={() => onCancelRow?.(index)}
                  >
                    <IconCancel />
                  </button>
                  <button
                    type="button"
                    className="mat-row-icon-btn btn-delete-action"
                    title="Delete entry"
                    onClick={() => setConfirmIndex(index)}
                  >
                    <IconDelete />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
      {sorted.length === 0 && (
        <div className="mat-empty-row">No entries match the current filters.</div>
      )}
    </div>
  );
}
