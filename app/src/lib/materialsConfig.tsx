import type { MaterialEntry } from '../types/materials';
import type { EntrySectionConfig } from './entryConfig';
import { rarityLabel, rarityClass, DIFFICULTY_TIERS, difficultyLabel, difficultyClass } from './rarity';
import { blankMaterialEntry } from './blankEntry';
import { CLIMATE_TIERS, BIOME_TIERS } from './geography';
import { CRAFTING_CATEGORIES } from '../types/crafting';

const CRAFTING_SKILL_OPTIONS = CRAFTING_CATEGORIES.map((label) => ({ value: label, label }));

function labelsFor(tiers: { value: string; label: string }[], values: string[]): string {
  return values.map((v) => tiers.find((t) => t.value === v)?.label ?? v).join(', ');
}

function locationSummary(r: MaterialEntry): string {
  if (r.location_override) return r.location_override;
  const climate = labelsFor(CLIMATE_TIERS, r.location_climate);
  const biome = labelsFor(BIOME_TIERS, r.location_biome);
  return [climate, biome].filter(Boolean).join(' / ');
}

export const materialsConfig: EntrySectionConfig<MaterialEntry> = {
  nameField: 'name',
  nicknamesField: 'nicknames',
  rarityField: 'rarity',
  blank: blankMaterialEntry,

  listColumns: [
    {
      key: 'name',
      label: 'Identity',
      cls: 'mat-cell mat-id',
      text: (r) => [r.name, r.nicknames.join(', '), rarityLabel(r.rarity), r.color, locationSummary(r)]
        .filter(Boolean)
        .join(' '),
      render: (r) => (
        <>
          <div className="mat-id-row1">
            <div className="mat-id-primary">{r.name || ''}</div>
            {r.rarity && (
              <div className="mat-id-rarity">
                <span className={`trait-tag ${rarityClass(r.rarity)}`}>{rarityLabel(r.rarity)}</span>
              </div>
            )}
          </div>
          {r.nicknames.length > 0 && <div className="mat-id-aka">AKA: {r.nicknames.join(', ')}</div>}
          {r.color && <div className="mat-id-color">{r.color}</div>}
          {locationSummary(r) && <div className="mat-id-location">{locationSummary(r)}</div>}
        </>
      ),
    },
    {
      key: 'crafting',
      label: 'Crafting',
      cls: 'mat-cell flex-2 mat-craft',
      text: (r) => r.crafting.map((row) => [row.skill, row.difficulty].filter(Boolean).join(' ')).join(' '),
      render: (r) =>
        r.crafting.length > 0 ? (
          <div className="mat-craft-list">
            {r.crafting.map((row, i) => (
              <div className="mat-craft-row" key={i}>
                <span className="mat-craft-skill">{row.skill}</span>
                {row.difficulty && (
                  <span className={`trait-tag mat-craft-difficulty ${difficultyClass(row.difficulty)}`}>
                    {difficultyLabel(row.difficulty)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          '--'
        ),
    },
    {
      key: 'effects',
      label: 'Commonly Known Effects',
      cls: 'mat-cell flex-2 mat-effects',
      text: (r) => r.effects.map((row) => [row.item_type, row.effect].filter(Boolean).join(' ')).join(' '),
      render: (r) =>
        r.effects.length > 0 ? (
          <div className="mat-effects-list">
            {r.effects.map((row, i) => (
              <div className="mat-effects-row" key={i}>
                <span className="mat-effects-type">{row.item_type}</span>
                <span className="mat-effects-text">{row.effect}</span>
              </div>
            ))}
          </div>
        ) : (
          '--'
        ),
    },
    {
      key: 'traits',
      label: 'Traits',
      cls: 'mat-cell flex-1 mat-traits',
      text: (r) => r.traits.join(' '),
      render: (r) =>
        r.traits.length > 0 ? (
          <div className="mat-traits-list">
            {r.traits.map((t, i) => (
              <span className="trait-tag" key={i}>
                {t}
              </span>
            ))}
          </div>
        ) : (
          '--'
        ),
    },
  ],

  detailSections: [
    {
      title: 'Identity',
      rows: [
        [
          { key: 'color', label: 'Color', kind: 'text' },
          { key: 'location_climate', label: 'Climate', kind: 'multiselect', options: CLIMATE_TIERS },
          { key: 'location_biome', label: 'Biome', kind: 'multiselect', options: BIOME_TIERS },
          { key: 'location_override', label: 'Location Override', kind: 'text', wide: true },
        ],
      ],
    },
    {
      title: 'Crafting',
      group: {
        key: 'crafting',
        addLabel: 'Add Skill',
        itemFields: [
          { key: 'skill', label: 'Skill', kind: 'select', options: CRAFTING_SKILL_OPTIONS },
          { key: 'preparation', label: 'Preparation', kind: 'text' },
          { key: 'difficulty', label: 'Difficulty', kind: 'select', options: DIFFICULTY_TIERS },
          { key: 'item_types', label: 'Item Types', kind: 'text' },
        ],
        blankItem: () => ({ skill: '', preparation: '', difficulty: '', item_types: '' }),
      },
    },
    {
      title: 'Commonly Known Effects',
      group: {
        key: 'effects',
        addLabel: 'Add Effect',
        itemFields: [
          { key: 'item_type', label: 'Item Type / Usage', kind: 'text' },
          { key: 'effect', label: 'Effect', kind: 'textarea' },
        ],
        blankItem: () => ({ item_type: '', effect: '' }),
      },
    },
    { title: 'Traits', rows: [[{ key: 'traits', kind: 'tags', wide: true }]] },
    {
      title: 'Legacy Info',
      group: {
        key: 'legacy',
        addLabel: 'Add Legacy Entry',
        itemFields: [
          { key: 'source', label: 'Source', kind: 'text' },
          { key: 'description', label: 'Description', kind: 'textarea' },
        ],
        blankItem: () => ({ source: '', description: '' }),
      },
    },
    {
      title: 'Historical/Real-World: Material Identity',
      rows: [
        [
          { key: 'identity_hardness', label: 'Hardness (Mohs)', kind: 'text' },
          { key: 'identity_crystal_system', label: 'Crystal System', kind: 'text' },
          { key: 'identity_chemical_formula', label: 'Chemical Formula', kind: 'text' },
        ],
        [{ key: 'identity_color_cause', label: 'Color Cause', kind: 'textarea', wide: true }],
        [
          { key: 'identity_locale', label: 'Locale', kind: 'text' },
          { key: 'identity_region', label: 'Region', kind: 'text' },
        ],
        [{ key: 'identity_related_materials', label: 'Related Materials', kind: 'tags', wide: true }],
      ],
    },
    {
      title: 'Historical/Real-World: Myths, Legends & Ritual Use',
      group: {
        key: 'myths',
        addLabel: 'Add Myth/Legend',
        itemFields: [
          { key: 'culture', label: 'Culture', kind: 'text' },
          { key: 'tier', label: 'Tier', kind: 'text' },
          { key: 'description', label: 'Description', kind: 'textarea' },
          { key: 'primary_source', label: 'Primary Source', kind: 'text' },
        ],
        blankItem: () => ({ culture: '', tier: '', description: '', primary_source: '' }),
      },
    },
  ],
};
