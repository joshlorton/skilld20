import type { CraftingEntry } from '../types/crafting';
import type { EntrySectionConfig } from './entryConfig';
import { DIFFICULTY_TIERS, difficultyLabel, difficultyClass } from './rarity';
import { blankCraftingEntry } from './blankEntry';

export const craftingConfig: EntrySectionConfig<CraftingEntry> = {
  nameField: 'name',
  nicknamesField: 'nicknames',
  rarityField: 'rarity',
  rarityLabel: 'Difficulty',
  rarityTiers: DIFFICULTY_TIERS,
  blank: blankCraftingEntry,

  listColumns: [
    {
      key: 'name',
      label: 'Name',
      cls: 'mat-cell mat-name',
      text: (r) => [r.name, r.nicknames.join(', '), difficultyLabel(r.rarity)].filter(Boolean).join(' '),
      render: (r) => (
        <>
          <div className="mat-name-primary">{r.name || ''}</div>
          {r.nicknames.length > 0 && <div className="mat-name-aka">AKA: {r.nicknames.join(', ')}</div>}
          {r.rarity && (
            <div className="mat-name-rarity">
              <span className={`trait-tag ${difficultyClass(r.rarity)}`}>{difficultyLabel(r.rarity)}</span>
            </div>
          )}
        </>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      cls: 'mat-cell flex-2 mat-desc',
      text: (r) => r.description,
      render: (r) => <div className="mat-desc-other">{r.description}</div>,
    },
    {
      key: 'effect',
      label: 'Result',
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
    { title: 'Description', rows: [[{ key: 'description', kind: 'textarea', wide: true }]] },
    {
      title: 'Requirements',
      rows: [
        [
          { key: 'materials_tools', label: 'Materials / Tools', kind: 'textarea', wide: true },
          { key: 'time_or_dc', label: 'Time / DC', kind: 'text' },
        ],
      ],
    },
    { title: 'Result', rows: [[{ key: 'effect', kind: 'textarea', wide: true }]] },
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
