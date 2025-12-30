export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  province_id: string;
  name: string;
}

export interface District {
  id: string;
  regency_id: string;
  name: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
}

export type LocationLevel = 'province' | 'regency' | 'district' | 'village';

export interface BreadcrumbItem {
  label: string;
  level: LocationLevel;
}