import { CRAFTING_CATEGORIES } from '../types/crafting';

/** Fixed, hardcoded list -- no external source of truth to derive from. */
export const CRAFTING_CATEGORY_ITEMS: { key: string; label: string }[] = CRAFTING_CATEGORIES.map(
  (label) => ({ key: label, label }),
);
