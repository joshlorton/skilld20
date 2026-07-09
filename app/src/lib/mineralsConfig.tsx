import type { MineralEntry } from '../types/minerals';
import type { EntrySectionConfig } from './entryConfig';
import { rarityLabel, rarityClass, DIFFICULTY_TIERS } from './rarity';
import { blankMineralEntry } from './blankEntry';
import { CLIMATE_TIERS, BIOME_TIERS } from './geography';
import { CRAFTING_CATEGORIES } from '../types/crafting';

const CRAFTING_SKILL_OPTIONS = CRAFTING_CATEGORIES.map((label) => ({ value: label, label }));

function locationSummary(r: MineralEntry): string {
  if (r.location_override) return r.location_override;
  const climate = CLIMATE_TIERS.find((t) => t.value === r.location_climate)?.label ?? '';
  const biome = BIOME_TIERS.find((t) => t.value === r.location_biome)?.label ?? '';
  return [climate, biome].filter(Boolean).join(' / ');
}

function craftingSummary(r: MineralEntry): string {
  return r.crafting
    .map((row) => [row.skill, row.difficulty].filter(Boolean).join(' — '))
    .filter(Boolean)
    .join(', ');
}

function effectsSummary(r: MineralEntry): string {
  return r.effects
    .map((row) => [row.item_type, row.effect].filter(Boolean).join(': '))
    .filter(Boolean)
    .join('; ');
}

export const mineralsConfig: EntrySectionConfig<MineralEntry> = {
  nameField: 'name',
  nicknamesField: 'nicknames',
  rarityField: 'rarity',
  blank: blankMineralEntry,

  listColumns: [
    {
      key: 'name',
      label: 'Identity',
      cls: 'mat-cell mat-name',
      text: (r) => [r.name, r.nicknames.join(', '), rarityLabel(r.rarity), r.color, locationSummary(r)]
        .filter(Boolean)
        .join(' '),
      render: (r) => (
        <>
          <div className="mat-name-primary">{r.name || ''}</div>
          {r.nicknames.length > 0 && <div className="mat-name-aka">AKA: {r.nicknames.join(', ')}</div>}
          {r.rarity && (
            <div className="mat-name-rarity">
              <span className={`trait-tag ${rarityClass(r.rarity)}`}>{rarityLabel(r.rarity)}</span>
            </div>
          )}
          {r.color && <div className="mat-desc-color">{r.color}</div>}
          {locationSummary(r) && <div className="mat-name-type">{locationSummary(r)}</div>}
        </>
      ),
    },
    {
      key: 'crafting',
      label: 'Crafting',
      cls: 'mat-cell flex-2 mat-desc',
      text: craftingSummary,
      render: (r) => craftingSummary(r) || '—',
    },
    {
      key: 'effects',
      label: 'Commonly Known Effects',
      cls: 'mat-cell flex-2 mat-effect',
      text: effectsSummary,
      render: (r) => effectsSummary(r) || '—',
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
      title: 'Identity',
      rows: [
        [
          { key: 'color', label: 'Color', kind: 'text' },
          { key: 'location_climate', label: 'Climate', kind: 'select', options: CLIMATE_TIERS },
          { key: 'location_biome', label: 'Biome', kind: 'select', options: BIOME_TIERS },
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
        [
          { key: 'identity_color_cause', label: 'Color Cause', kind: 'textarea', wide: true },
        ],
        [
          { key: 'identity_locale', label: 'Locale', kind: 'text' },
          { key: 'identity_region', label: 'Region', kind: 'text' },
        ],
        [
          { key: 'identity_related_materials', label: 'Related Materials', kind: 'tags', wide: true },
        ],
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
