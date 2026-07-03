import type { TraitGroupsData } from '../types/traits';

const RITUAL_ACCESS_GROUPS = ['Divine Domain', 'Divine Specialty', 'Pact'];

/** Capitalizes the first letter of each word, respecting ": " and "/" separators
 * (e.g. "elemental: water" -> "Elemental: Water", "icepriestess/icepriest" ->
 * "Icepriestess/Icepriest") -- for display only, the raw lowercase label stays
 * the category key.
 */
function titleCase(s: string): string {
  return s.replace(/(^|[\s:/])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/**
 * Derives the Rituals sidebar from trait-groups.json's access array rather than
 * a hardcoded copy, so it never goes stale if those groups change later. Category
 * key is the item's bare label (e.g. "chaos"), not its namespaced value (e.g.
 * "divine domain: chaos") -- deduped by label, so two same-labeled items across
 * groups would collide (none do today, but this is a known sharp edge). Sorted
 * alphabetically by the display label rather than grouped by source trait group.
 */
export function deriveRitualCategories(traitGroups: TraitGroupsData): { key: string; label: string }[] {
  const seen = new Set<string>();
  const categories: { key: string; label: string }[] = [];
  for (const group of traitGroups.access) {
    if (!RITUAL_ACCESS_GROUPS.includes(group.label)) continue;
    for (const item of group.items) {
      if (seen.has(item.label)) continue;
      seen.add(item.label);
      categories.push({ key: item.label, label: titleCase(item.label) });
    }
  }
  categories.sort((a, b) => a.label.localeCompare(b.label));
  return categories;
}
