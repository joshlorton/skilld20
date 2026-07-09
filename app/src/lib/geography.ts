// Fixed real-world taxonomies for Minerals' Identity location fields --
// standard classification schemes, not game-specific, so they're pulled in
// verbatim rather than invented. A freeform override field sits alongside
// these in mineralsConfig.tsx for setting-specific locations that don't map
// cleanly onto either scheme.

/** Koppen-Geiger climate classification. */
export const CLIMATE_TIERS: { value: string; label: string }[] = [
  { value: 'af', label: 'Af — Tropical rainforest' },
  { value: 'am', label: 'Am — Tropical monsoon' },
  { value: 'aw', label: 'Aw — Tropical savanna' },
  { value: 'bwh', label: 'BWh — Hot desert' },
  { value: 'bwk', label: 'BWk — Cold desert' },
  { value: 'bsh', label: 'BSh — Hot semi-arid' },
  { value: 'bsk', label: 'BSk — Cold semi-arid' },
  { value: 'csa', label: 'Csa — Hot-summer Mediterranean' },
  { value: 'csb', label: 'Csb — Warm-summer Mediterranean' },
  { value: 'csc', label: 'Csc — Cold-summer Mediterranean' },
  { value: 'cwa', label: 'Cwa — Humid subtropical (dry winter)' },
  { value: 'cwb', label: 'Cwb — Subtropical highland (dry winter)' },
  { value: 'cwc', label: 'Cwc — Cold subtropical highland (dry winter)' },
  { value: 'cfa', label: 'Cfa — Humid subtropical' },
  { value: 'cfb', label: 'Cfb — Oceanic' },
  { value: 'cfc', label: 'Cfc — Subpolar oceanic' },
  { value: 'dsa', label: 'Dsa — Hot-summer Mediterranean continental' },
  { value: 'dsb', label: 'Dsb — Warm-summer Mediterranean continental' },
  { value: 'dsc', label: 'Dsc — Cold Mediterranean continental' },
  { value: 'dsd', label: 'Dsd — Very cold Mediterranean continental' },
  { value: 'dwa', label: 'Dwa — Hot-summer humid continental (dry winter)' },
  { value: 'dwb', label: 'Dwb — Warm-summer humid continental (dry winter)' },
  { value: 'dwc', label: 'Dwc — Subarctic (dry winter)' },
  { value: 'dwd', label: 'Dwd — Very cold subarctic (dry winter)' },
  { value: 'dfa', label: 'Dfa — Hot-summer humid continental' },
  { value: 'dfb', label: 'Dfb — Warm-summer humid continental' },
  { value: 'dfc', label: 'Dfc — Subarctic' },
  { value: 'dfd', label: 'Dfd — Very cold subarctic' },
  { value: 'et', label: 'ET — Tundra' },
  { value: 'ef', label: 'EF — Ice cap' },
];

/** Olson & Dinerstein terrestrial biomes (WWF scheme). */
export const BIOME_TIERS: { value: string; label: string }[] = [
  { value: 'tropical-moist-broadleaf-forest', label: 'Tropical & Subtropical Moist Broadleaf Forest' },
  { value: 'tropical-dry-broadleaf-forest', label: 'Tropical & Subtropical Dry Broadleaf Forest' },
  { value: 'tropical-coniferous-forest', label: 'Tropical & Subtropical Coniferous Forest' },
  { value: 'temperate-broadleaf-mixed-forest', label: 'Temperate Broadleaf & Mixed Forest' },
  { value: 'temperate-conifer-forest', label: 'Temperate Conifer Forest' },
  { value: 'boreal-forest', label: 'Boreal Forest / Taiga' },
  { value: 'tropical-grassland', label: 'Tropical & Subtropical Grasslands, Savannas & Shrublands' },
  { value: 'temperate-grassland', label: 'Temperate Grasslands, Savannas & Shrublands' },
  { value: 'flooded-grassland', label: 'Flooded Grasslands & Savannas' },
  { value: 'montane-grassland', label: 'Montane Grasslands & Shrublands' },
  { value: 'tundra', label: 'Tundra' },
  { value: 'mediterranean-forest', label: 'Mediterranean Forest, Woodland & Scrub' },
  { value: 'desert', label: 'Desert & Xeric Shrubland' },
  { value: 'mangrove', label: 'Mangrove' },
];
