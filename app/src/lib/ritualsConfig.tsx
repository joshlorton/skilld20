import type { RitualEntry } from '../types/rituals';
import type { EntrySectionConfig } from './entryConfig';
import { rarityLabel, rarityClass } from './rarity';
import { blankRitualEntry } from './blankEntry';

export const ritualsConfig: EntrySectionConfig<RitualEntry> = {
  nameField: 'name',
  nicknamesField: 'nicknames',
  rarityField: 'rarity',
  blank: blankRitualEntry,

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
      key: 'description',
      label: 'Description',
      cls: 'mat-cell flex-2 mat-desc',
      text: (r) => [r.focus, r.description].filter(Boolean).join(' '),
      render: (r) => (
        <>
          {r.focus && <div className="mat-desc-color">{r.focus}</div>}
          <div className="mat-desc-other">{r.description}</div>
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
      title: 'Description',
      rows: [
        [
          { key: 'focus', label: 'Focus', kind: 'text' },
          { key: 'description', label: 'Description', kind: 'textarea', wide: true },
        ],
      ],
    },
    {
      title: 'Requirements',
      rows: [
        [
          { key: 'requirements', label: 'Requirements', kind: 'textarea', wide: true },
          { key: 'duration', label: 'Duration', kind: 'text' },
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
