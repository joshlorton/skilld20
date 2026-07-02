import type { ReactNode } from 'react';

export interface FieldDef<T> {
  key: keyof T & string;
  /** Omitted when the section title already conveys it (single-field sections). */
  label?: string;
  /** tags = comma-separated string[] editing, matching the old EditableArrayField behavior. */
  kind: 'text' | 'textarea' | 'select' | 'tags';
  /** For kind: 'select'. */
  options?: { value: string; label: string }[];
  /** form-field-wide CSS class. */
  wide?: boolean;
  /** Textarea row count; defaults to 3. */
  rows?: number;
}

export interface DetailSection<T> {
  title: string;
  /** Each inner array renders as one form-row, matching the original hand-built layout. */
  rows: FieldDef<T>[][];
}

export interface ListColumnDef<T> {
  key: string;
  label: string;
  cls: string;
  /** For sort/filter matching. */
  text: (row: T) => string;
  /** For visible cell content -- can be richer than the plain sort/filter text. */
  render: (row: T) => ReactNode;
}

export interface EntrySectionConfig<T> {
  listColumns: ListColumnDef<T>[];
  detailSections: DetailSection<T>[];
  nameField: keyof T & string;
  nicknamesField: keyof T & string;
  /** Undefined means no rarity chip/select in the detail heading. */
  rarityField?: keyof T & string;
  /** Heading label for rarityField, e.g. "Difficulty" instead of "Rarity". Defaults to "Rarity". */
  rarityLabel?: string;
  blank: () => T;
}
