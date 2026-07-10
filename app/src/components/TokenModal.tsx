import { useState } from 'react';

interface Props {
  open: boolean;
  onSave: (token: string) => void;
  onClear: () => void;
  onCancel: () => void;
}

export function TokenModal({ open, onSave, onClear, onCancel }: Props) {
  const [value, setValue] = useState('');

  if (!open) return null;

  return (
    <div
      id="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div id="modal">
        <h3>GitHub Token</h3>
        <p>
          Personal Access Token with <strong>repo</strong> scope. Stored only in your browser's
          localStorage -- never committed to GitHub.
        </p>
        <input
          id="token-input"
          type="password"
          placeholder="ghp_…"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div id="modal-buttons">
          <button className="btn btn-save-action" onClick={() => onSave(value)}>
            Save Token
          </button>
          <button className="btn btn-cancel-action" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-delete-action" onClick={onClear}>
            Clear Token
          </button>
        </div>
      </div>
    </div>
  );
}
