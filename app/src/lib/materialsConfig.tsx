import type { MaterialEntry } from '../types/materials';
import type { EntrySectionConfig } from './entryConfig';
import { rarityLabel, rarityClass } from './rarity';
import { blankMaterialEntry } from './blankEntry';

export const materialsConfig: EntrySectionConfig<MaterialEntry> = {
  nameField: 'name',
  nicknamesField: 'nicknames',
  rarityField: 'rarity',
  blank: blankMaterialEntry,

  listColumns: [
    {
      key: 'name',
      label: 'Name',
      cls: 'mat-cell mat-name',
      text: (r) => [r.name, r.nicknames.join(', '), rarityLabel(r.rarity)].filter(Boolean).join(' '),
      render: (r) => (
        <>
          <div className="mat-name-primary">{r.name || ''}</div>
          {r.nicknames.length > 0 && <div className="mat-name-aka">AKA: {r.nicknames.join(', ')}</div>}
          {r.rarity && (
            <div className="mat-name-rarity">
              <span className={`trait-tag ${rarityClass(r.rarity)}`}>{rarityLabel(r.rarity)}</span>
            </div>
          )}
        </>
      ),
    },
    {
      key: 'physical',
      label: 'Physical Description',
      cls: 'mat-cell flex-2 mat-desc',
      text: (r) => [r.color, r.other].filter(Boolean).join(' '),
      render: (r) => (
        <>
          {r.color && <div className="mat-desc-color">{r.color}</div>}
          <div className="mat-desc-other">{r.other}</div>
        </>
      ),
    },
    {
      key: 'effect',
      label: 'Common Effects',
      cls: 'mat-cell flex-2 mat-effect',
      text: (r) => r.effect,
      render: (r) => r.effect,
    },
    {
      key: 'traits',
      label: 'Traits',
      cls: 'mat-cell flex-1 mat-notes',
      text: (r) => r.traits.join(', '),
      render: (r) => r.traits.join(', '),
    },
  ],

  detailSections: [
    {
      title: 'Physical Description',
      rows: [
        [
          { key: 'color', label: 'Color', kind: 'text' },
          { key: 'other', label: 'Other', kind: 'textarea', wide: true },
          { key: 'location', label: 'Location', kind: 'text' },
        ],
      ],
    },
    {
      title: 'Use',
      rows: [
        [
          { key: 'cut', label: 'Cut', kind: 'text' },
          { key: 'item_types', label: 'Item Types', kind: 'text', wide: true },
        ],
      ],
    },
    { title: 'Common Effects', rows: [[{ key: 'effect', kind: 'textarea', wide: true }]] },
    { title: 'Traits', rows: [[{ key: 'traits', kind: 'tags', wide: true }]] },
    {
      title: 'Legacy Info',
      rows: [
        [{ key: 'source', label: 'Source', kind: 'text' }],
        [{ key: 'legacy_description', label: 'Description', kind: 'textarea', wide: true, rows: 4 }],
        [{ key: 'legacy_effects', label: 'Effects', kind: 'textarea', wide: true }],
      ],
    },
  ],
};
