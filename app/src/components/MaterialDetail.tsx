import { useEffect, useState } from 'react';
import type { MaterialEntry } from '../types/materials';
import { RARITY_TIERS, rarityLabel, rarityClass } from '../lib/rarity';
import { IconEdit } from './icons';

interface Props {
  entry: MaterialEntry;
  mode: 'view' | 'edit';
  onEdit: () => void;
  onSave: (entry: MaterialEntry) => void;
  onCancel: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function MaterialDetail({ entry, mode, onEdit, onSave, onCancel, onDelete, onBack }: Props) {
  const [draft, setDraft] = useState<MaterialEntry>(entry);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const editing = mode === 'edit';

  useEffect(() => {
    setDraft(entry);
    setConfirmingDelete(false);
  }, [entry, mode]);

  function field<K extends keyof MaterialEntry>(key: K, value: MaterialEntry[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function arrayField(key: 'nicknames' | 'traits', text: string) {
    field(
      key,
      text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }

  return (
    <div className="editor-form">
      {!editing && (
        <button type="button" className="mat-detail-back-btn" onClick={onBack}>
          ← Back to list
        </button>
      )}
      <div className="mat-detail-heading">
        <div>
          {editing ? (
            <>
              <input
                className="form-input mat-detail-name-input"
                value={draft.name}
                onChange={(e) => field('name', e.target.value)}
                placeholder="Name"
              />
              <input
                className="form-input mat-detail-aka-input"
                value={draft.nicknames.join(', ')}
                onChange={(e) => arrayField('nicknames', e.target.value)}
                placeholder="Alt names (comma-separated)"
              />
            </>
          ) : (
            <>
              <div className="mat-detail-name">{entry.name || 'Unnamed'}</div>
              {entry.nicknames.length > 0 && (
                <div className="mat-detail-aka">AKA: {entry.nicknames.join(', ')}</div>
              )}
            </>
          )}
        </div>
        <div className="mat-detail-heading-right">
          {editing ? (
            <select
              className="form-input form-select"
              value={draft.rarity}
              onChange={(e) => field('rarity', e.target.value)}
            >
              <option value="">—</option>
              {RARITY_TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          ) : (
            entry.rarity && (
              <span className={`trait-tag ${rarityClass(entry.rarity)}`}>{rarityLabel(entry.rarity)}</span>
            )
          )}
          {!editing && (
            <button type="button" className="mat-detail-edit-btn" title="Edit" onClick={onEdit}>
              <IconEdit />
            </button>
          )}
        </div>
      </div>

      <div className="editor-section-title">Physical Description</div>
      <div className="form-row">
        <div className="form-field">
          <label>Color</label>
          {editing ? (
            <input className="form-input" value={draft.color} onChange={(e) => field('color', e.target.value)} />
          ) : (
            <div>{entry.color || '—'}</div>
          )}
        </div>
        <div className="form-field form-field-wide">
          <label>Other</label>
          {editing ? (
            <textarea
              className="form-input"
              rows={3}
              value={draft.other}
              onChange={(e) => field('other', e.target.value)}
            />
          ) : (
            <div>{entry.other || '—'}</div>
          )}
        </div>
        <div className="form-field">
          <label>Location</label>
          {editing ? (
            <input
              className="form-input"
              value={draft.location}
              onChange={(e) => field('location', e.target.value)}
            />
          ) : (
            <div>{entry.location || '—'}</div>
          )}
        </div>
      </div>

      <div className="editor-section-title">Use</div>
      <div className="form-row">
        <div className="form-field">
          <label>Cut</label>
          {editing ? (
            <input className="form-input" value={draft.cut} onChange={(e) => field('cut', e.target.value)} />
          ) : (
            <div>{entry.cut || '—'}</div>
          )}
        </div>
        <div className="form-field form-field-wide">
          <label>Item Types</label>
          {editing ? (
            <input
              className="form-input"
              value={draft.item_types}
              onChange={(e) => field('item_types', e.target.value)}
            />
          ) : (
            <div>{entry.item_types || '—'}</div>
          )}
        </div>
      </div>

      <div className="editor-section-title">Common Effects</div>
      <div className="form-row">
        <div className="form-field form-field-wide">
          {editing ? (
            <textarea
              className="form-input"
              rows={3}
              value={draft.effect}
              onChange={(e) => field('effect', e.target.value)}
            />
          ) : (
            <div>{entry.effect || '—'}</div>
          )}
        </div>
      </div>

      <div className="editor-section-title">Traits</div>
      <div className="form-row">
        <div className="form-field form-field-wide">
          {editing ? (
            <input
              className="form-input"
              value={draft.traits.join(', ')}
              onChange={(e) => arrayField('traits', e.target.value)}
              placeholder="Comma-separated"
            />
          ) : (
            <div>{entry.traits.join(', ') || '—'}</div>
          )}
        </div>
      </div>

      <div className="editor-section-title">Legacy Info</div>
      <div className="form-row">
        <div className="form-field">
          <label>Source</label>
          {editing ? (
            <input className="form-input" value={draft.source} onChange={(e) => field('source', e.target.value)} />
          ) : (
            <div>{entry.source || '—'}</div>
          )}
        </div>
      </div>
      <div className="form-row">
        <div className="form-field form-field-wide">
          <label>Description</label>
          {editing ? (
            <textarea
              className="form-input"
              rows={4}
              value={draft.legacy_description}
              onChange={(e) => field('legacy_description', e.target.value)}
            />
          ) : (
            <div>{entry.legacy_description || '—'}</div>
          )}
        </div>
      </div>
      <div className="form-row">
        <div className="form-field form-field-wide">
          <label>Effects</label>
          {editing ? (
            <textarea
              className="form-input"
              rows={3}
              value={draft.legacy_effects}
              onChange={(e) => field('legacy_effects', e.target.value)}
            />
          ) : (
            <div>{entry.legacy_effects || '—'}</div>
          )}
        </div>
      </div>

      {editing && (
        <div className="editor-btn-row">
          {confirmingDelete ? (
            <>
              <button type="button" className="btn btn-delete-action" onClick={onDelete}>
                Confirm Delete
              </button>
              <button type="button" className="btn btn-cancel-action" onClick={() => setConfirmingDelete(false)}>
                Keep Entry
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-save-action" onClick={() => onSave(draft)}>
                Save
              </button>
              <button type="button" className="btn btn-cancel-action" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-delete-action" onClick={() => setConfirmingDelete(true)}>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
