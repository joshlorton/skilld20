import type { SpellEntry } from '../types/materials';

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  cls: string;
  /** Render a textarea instead of a single-line input when editing. */
  multiline?: boolean;
}

export const SPELL_COLUMNS: ColumnDef<SpellEntry>[] = [
  { key: 'name', label: 'Name', cls: 'mat-cell mat-name' },
  { key: 'spell_class', label: 'Class', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'level', label: 'Level', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'school', label: 'School', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'casting', label: 'Casting', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'range', label: 'Range', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'area', label: 'Area', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'duration', label: 'Duration', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'save', label: 'Save', cls: 'mat-cell flex-1 mat-desc' },
  { key: 'effect', label: 'Effect', cls: 'mat-cell flex-2 mat-effect', multiline: true },
  { key: 'traits', label: 'Traits', cls: 'mat-cell flex-1 mat-notes' },
];
