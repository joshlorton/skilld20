import type { GroupItemFieldDef } from '../lib/entryConfig';

interface Props {
  items: Record<string, unknown>[];
  fields: GroupItemFieldDef[];
  editing: boolean;
  onChange: (items: Record<string, unknown>[]) => void;
  blankItem: () => Record<string, unknown>;
  addLabel?: string;
}

function itemValue(item: Record<string, unknown>, key: string): string {
  const v = item[key];
  return typeof v === 'string' ? v : '';
}

/** Repeatable array-of-objects field editor -- one row per item, add/remove controls.
 * Mirrors the interaction pattern of Foundations' component-row editor
 * (css/foundations.css .comp-editor-row), reimplemented with a flexible field
 * count rather than that pattern's fixed 7-column grid. */
export function GroupFieldEditor({ items, fields, editing, onChange, blankItem, addLabel }: Props) {
  function updateItem(index: number, key: string, value: string) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, blankItem()]);
  }

  if (!editing) {
    if (items.length === 0) return <div className="group-empty">None recorded.</div>;
    return (
      <div className="group-view-list">
        {items.map((item, i) => (
          <div className="group-view-row" key={i}>
            {fields.map((field) => (
              <div className="group-view-field" key={field.key}>
                <div className="group-view-field-label">{field.label}</div>
                <div>{itemValue(item, field.key) || '--'}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="group-editor-list">
      {items.map((item, i) => (
        <div className="group-editor-row" key={i}>
          <div className="group-editor-row-main">
            {fields.map((field) => (
              <div className="form-field" key={field.key}>
                <label>{field.label}</label>
                {field.kind === 'textarea' ? (
                  <textarea
                    className="form-input"
                    rows={3}
                    value={itemValue(item, field.key)}
                    onChange={(e) => updateItem(i, field.key, e.target.value)}
                  />
                ) : field.kind === 'select' ? (
                  <select
                    className="form-input form-select"
                    value={itemValue(item, field.key)}
                    onChange={(e) => updateItem(i, field.key, e.target.value)}
                  >
                    <option value="">--</option>
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-input"
                    value={itemValue(item, field.key)}
                    onChange={(e) => updateItem(i, field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-delete-action group-editor-remove"
              onClick={() => removeItem(i)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn group-add-btn" onClick={addItem}>
        + {addLabel ?? 'Add'}
      </button>
    </div>
  );
}
