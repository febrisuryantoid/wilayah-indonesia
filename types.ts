
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

// Konfigurasi Versi Aplikasi
// Ubah nilai ini setiap kali Anda melakukan update besar
export const APP_VERSION = "1.1.0";
export const LAST_UPDATED = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
