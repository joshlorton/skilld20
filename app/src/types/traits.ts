export interface TraitGroup {
  label: string;
  items: string[];
}

export interface TraitGroupsData {
  general: TraitGroup[];
  traditions: TraitGroup[];
  access: TraitGroup[];
}
