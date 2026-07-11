import { useEffect, useState } from 'react';
import type { EntrySectionConfig, FieldDef } from '../lib/entryConfig';
import { RARITY_TIERS, DIFFICULTY_TIERS, tierLabel, tierClass } from '../lib/rarity';
import { IconEdit } from './icons';
import { GroupFieldEditor } from './GroupFieldEditor';

interface Props<T> {
  config: EntrySectionConfig<T>;
  entry: T;
  mode: 'view' | 'edit';
  onEdit: () => void;
  onSave: (entry: T) => void;
  onCancel: () => void;
  onDelete: () => void;
  onBack: () => void;
}

function optionLabel<T>(field: FieldDef<T>, value: string): string {
  return field.options?.find((o) => o.value === value)?.label ?? value;
}

/** Resolves select/multiselect values through field.options so the viewer shows
 * the friendly label (e.g. "Am -- Tropical monsoon") instead of the raw stored
 * value (e.g. "am"). */
function fieldValue<T>(source: T, field: FieldDef<T>): string {
  const v = source[field.key];
  if (Array.isArray(v)) {
    const arr = v as string[];
    return field.kind === 'multiselect' ? arr.map((val) => optionLabel(field, val)).join(', ') : arr.join(', ');
  }
  if (field.kind === 'select' && v) return optionLabel(field, v as string);
  return (v as string) ?? '';
}

export function EntryDetail<T>({ config, entry, mode, onEdit, onSave, onCancel, onDelete, onBack }: Props<T>) {
  const [draft, setDraft] = useState<T>(entry);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const editing = mode === 'edit';

  useEffect(() => {
    setDraft(entry);
    setConfirmingDelete(false);
  }, [entry, mode]);

  function setField(field: FieldDef<T>, raw: string) {
    if (field.kind === 'tags') {
      const arr = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      setDraft((d) => ({ ...d, [field.key]: arr }));
    } else {
      setDraft((d) => ({ ...d, [field.key]: raw }));
    }
  }

  function setMultiField(field: FieldDef<T>, select: HTMLSelectElement) {
    const values = Array.from(select.selectedOptions).map((o) => o.value);
    setDraft((d) => ({ ...d, [field.key]: values }));
  }

  function setTopField(key: keyof T & string, raw: string, tags: boolean) {
    setDraft((d) => ({
      ...d,
      [key]: tags
        ? raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : raw,
    }));
  }

  const rarityTiers = config.rarityTiers ?? RARITY_TIERS;
  const rarityClassPrefix = rarityTiers === DIFFICULTY_TIERS ? 'trait-difficulty' : 'trait-rarity';
  const name = String(entry[config.nameField] ?? '');
  const nicknames = (entry[config.nicknamesField] as unknown as string[]) ?? [];
  const rarity = config.rarityField ? String(entry[config.rarityField] ?? '') : '';
  const draftName = String(draft[config.nameField] ?? '');
  const draftNicknames = (draft[config.nicknamesField] as unknown as string[]) ?? [];
  const draftRarity = config.rarityField ? String(draft[config.rarityField] ?? '') : '';

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
                value={draftName}
                onChange={(e) => setTopField(config.nameField, e.target.value, false)}
                placeholder="Name"
              />
              <input
                className="form-input mat-detail-aka-input"
                value={draftNicknames.join(', ')}
                onChange={(e) => setTopField(config.nicknamesField, e.target.value, true)}
                placeholder="Alt names (comma-separated)"
              />
            </>
          ) : (
            <>
              <div className="mat-detail-name">{name || 'Unnamed'}</div>
              {nicknames.length > 0 && <div className="mat-detail-aka">AKA: {nicknames.join(', ')}</div>}
            </>
          )}
        </div>
        <div className="mat-detail-heading-right">
          {config.rarityField &&
            (editing ? (
              <>
                <span className="mat-detail-rarity-label">{config.rarityLabel ?? 'Rarity'}</span>
                <select
                  className="form-input form-select"
                  value={draftRarity}
                  onChange={(e) => setTopField(config.rarityField as keyof T & string, e.target.value, false)}
                >
                  <option value="">--</option>
                  {rarityTiers.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              rarity && (
                <span
                  className={`trait-tag ${tierClass(rarityClassPrefix, rarity)}`}
                  title={config.rarityLabel ?? 'Rarity'}
                >
                  {tierLabel(rarityTiers, rarity)}
                </span>
              )
            ))}
          {!editing && (
            <button type="button" className="mat-detail-edit-btn" title="Edit" onClick={onEdit}>
              <IconEdit />
            </button>
          )}
        </div>
      </div>

      {config.detailSections.map((section) => {
        const group = section.group;
        return (
        <div key={section.title}>
          <div className="editor-section-title">{section.title}</div>
          {group ? (
            <GroupFieldEditor
              items={(editing ? draft : entry)[group.key] as unknown as Record<string, unknown>[]}
              fields={group.itemFields}
              editing={editing}
              blankItem={group.blankItem}
              addLabel={group.addLabel}
              onChange={(items) => setDraft((d) => ({ ...d, [group.key]: items }))}
            />
          ) : (
            section.rows?.map((row, i) => (
              <div className="form-row" key={i}>
                {row.map((field) => (
                  <div key={field.key} className={field.wide ? 'form-field form-field-wide' : 'form-field'}>
                    {field.label && <label>{field.label}</label>}
                    {editing ? (
                      field.kind === 'textarea' ? (
                        <textarea
                          className="form-input"
                          rows={field.rows ?? 3}
                          value={fieldValue(draft, field)}
                          onChange={(e) => setField(field, e.target.value)}
                        />
                      ) : field.kind === 'select' ? (
                        <select
                          className="form-input form-select"
                          value={fieldValue(draft, field)}
                          onChange={(e) => setField(field, e.target.value)}
                        >
                          <option value="">--</option>
                          {field.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : field.kind === 'multiselect' ? (
                        <select
                          multiple
                          size={6}
                          className="form-input form-multiselect"
                          value={(draft[field.key] as unknown as string[]) ?? []}
                          onChange={(e) => setMultiField(field, e.target)}
                        >
                          {field.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="form-input"
                          value={fieldValue(draft, field)}
                          onChange={(e) => setField(field, e.target.value)}
                          placeholder={field.kind === 'tags' ? 'Comma-separated' : undefined}
                        />
                      )
                    ) : (
                      <div>{fieldValue(entry, field) || '--'}</div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        );
      })}

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
