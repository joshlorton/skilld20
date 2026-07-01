import { useEffect, useState } from 'react';

interface EditableTextProps {
  value: string;
  onCommit: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

/** Commits on blur, not on every keystroke, so sort/filter don't reflow rows mid-edit. */
export function EditableField({ value, onCommit, multiline, className }: EditableTextProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  function commit() {
    if (local !== value) onCommit(local);
  }

  const cls = ['mat-edit-input', className].filter(Boolean).join(' ');

  if (multiline) {
    return (
      <textarea
        className={cls}
        value={local}
        rows={3}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
      />
    );
  }

  return (
    <input
      type="text"
      className={cls}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
    />
  );
}

interface EditableArrayProps {
  value: string[];
  onCommit: (value: string[]) => void;
  className?: string;
}

/** Comma-separated editing for array fields (traits, nicknames). */
export function EditableArrayField({ value, onCommit, className }: EditableArrayProps) {
  return (
    <EditableField
      className={className}
      value={value.join(', ')}
      onCommit={(text) =>
        onCommit(
          text
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}
