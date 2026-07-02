export interface TraitGroup {
  label: string;
  items: string[];
}

export interface AccessTraitItem {
  value: string;
  label: string;
}

export interface AccessTraitGroup {
  label: string;
  items: AccessTraitItem[];
}

export interface TraitGroupsData {
  general: TraitGroup[];
  traditions: TraitGroup[];
  access: AccessTraitGroup[];
}
