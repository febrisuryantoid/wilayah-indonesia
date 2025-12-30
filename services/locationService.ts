import { Province, Regency, District, Village } from '../types';
import { dbService } from './db';
import { PROVINCES_DATA } from '../data/initialData';

// DAFTAR MIRROR (Diurutkan berdasarkan stabilitas)
const MIRRORS = [
  'https://emsifa.github.io/api-wilayah-indonesia/api',
  'https://wahyupulse.github.io/api-wilayah-indonesia/api',
  'https://kanglerian.github.io/api-wilayah-indonesia/api',
];

// Helper: Fetch dengan Validasi Ketat
async function fetchWithFailover(endpoint: string): Promise<Response | null> {
  let errors: string[] = [];

  for (const baseUrl of MIRRORS) {
    try {
      // Tambahkan timestamp untuk bypass cache browser/proxy yang nyangkut di error 404
      const url = `${baseUrl}/${endpoint}?time=${new Date().getTime()}`;
      
      // Timeout 15 detik untuk koneksi lambat
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      // 1. Jika Sukses (200 OK)
      if (response.ok) {
        // Validasi content-type json
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response;
        } else {
            // Fallback check body text
            const clone = response.clone();
            const text = await clone.text();
            if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
                return response;
            }
            throw new Error(`Invalid Content-Type from ${baseUrl}`);
        }
      }
      
      // 2. Jika 404 Not Found (Data memang tidak ada)
      if (response.status === 404) {
        console.warn(`[404] File not found at ${baseUrl}: ${endpoint}`);
        continue;
      }

      // 3. Error Server Lain
      throw new Error(`Server Error ${response.status} from ${baseUrl}`);

    } catch (error: any) {
      errors.push(`${baseUrl}: ${error.message}`);
    }
  }

  console.warn(`[Failover] Gagal mengambil ${endpoint}. Details:`, errors);
  return null;
}

const sortByName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

// --- Core Fetch Logic ---
async function fetchAndCache<T extends { name: string }>(
  tableName: string, 
  apiEndpoint: string, 
  parentId?: string,
  parentIndexName?: string
): Promise<T[]> {
  // Validasi Input ID
  if (parentId && (parentId.length === 0 || parentId === 'undefined')) {
      return [];
  }

  try {
    // 1. Cek DB Lokal
    let localData: T[] = [];
    try {
        if (parentId && parentIndexName) {
            localData = await dbService.getByIndex<T>(tableName, parentIndexName, parentId);
        } else {
            localData = await dbService.getAll<T>(tableName);
        }
    } catch (dbErr) {
        console.error("DB Read Error:", dbErr);
    }

    if (localData.length > 0) return localData.sort(sortByName);

    // 2. Fetch Remote
    const response = await fetchWithFailover(apiEndpoint);
    
    if (!response) return [];

    const data = await response.json();
    
    // 3. Validasi & Simpan ke DB
    if (Array.isArray(data) && data.length > 0) {
        // CRITICAL FIX: Harus di-await agar data tersedia untuk proses selanjutnya (terutama saat Bulk Download)
        try {
            await dbService.addBulk(tableName, data);
        } catch (dbWriteErr) {
            console.error("Gagal menulis ke DB lokal, menggunakan data memori.", dbWriteErr);
        }
        return data.sort(sortByName);
    }
    
    return [];

  } catch (error) {
    console.error(`Service Error (${tableName}):`, error);
    return [];
  }
}

// --- Standard API ---
export const fetchProvinces = async (): Promise<Province[]> => {
  const localData = await dbService.getAll<Province>('provinces');
  if (localData.length > 0) return localData.sort(sortByName);

  try {
      const response = await fetchWithFailover('provinces.json');
      if (response) {
          const data = await response.json();
          if (Array.isArray(data)) {
              await dbService.addBulk('provinces', data);
              return data.sort(sortByName);
          }
      }
  } catch (e) { console.warn(e); }

  // Fallback ke static data
  await dbService.addBulk('provinces', PROVINCES_DATA);
  return PROVINCES_DATA.sort(sortByName);
};

export const fetchRegencies = async (provinceId: string) => fetchAndCache<Regency>('regencies', `regencies/${provinceId}.json`, provinceId, 'province_id');
export const fetchDistricts = async (regencyId: string) => fetchAndCache<District>('districts', `districts/${regencyId}.json`, regencyId, 'regency_id');
export const fetchVillages = async (districtId: string) => fetchAndCache<Village>('villages', `villages/${districtId}.json`, districtId, 'district_id');

export const getDatabaseStats = async () => {
  return {
    provinces: await dbService.count('provinces'),
    regencies: await dbService.count('regencies'),
    districts: await dbService.count('districts'),
    villages: await dbService.count('villages'),
  };
};

// --- BULK DOWNLOADER LOGIC (Concurrent Queue) ---

type ProgressCallback = (message: string, percent: number) => void;

async function asyncPool<T>(poolLimit: number, array: T[], iteratorFn: (item: T) => Promise<any>, onProgress: (count: number) => void) {
    const ret = [];
    const executing: Promise<any>[] = [];
    let completed = 0;
    
    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        const e = p.then(() => {
            executing.splice(executing.indexOf(e), 1);
            completed++;
            onProgress(completed);
        });
        executing.push(e);
        
        if (executing.length >= poolLimit) {
            await Promise.race(executing);
        }
    }
    return Promise.all(ret);
}

export const downloadFullDatabase = async (onProgress: ProgressCallback) => {
    try {
        onProgress("Membersihkan database lama...", 0);
        await dbService.clearAll();

        // 1. Provinces
        onProgress("Mengunduh Data Provinsi...", 2);
        const provinces = await fetchProvinces();
        
        // Filter: Pastikan kita hanya mencoba download detail provinsi yang datanya valid
        const validProvinces = provinces.filter(p => p.id); 
        
        onProgress(`Ditemukan ${validProvinces.length} Provinsi.`, 5);

        // 2. Regencies
        // Kita gunakan pool limit kecil agar tidak membebani network di awal
        const totalProvinces = validProvinces.length;
        await asyncPool(6, validProvinces, async (prov) => {
            await fetchRegencies(prov.id);
        }, (count) => {
            const pct = 5 + Math.round((count / totalProvinces) * 10);
            onProgress(`Mengunduh Kab/Kota (${count}/${totalProvinces})...`, pct);
        });

        // PENTING: Ambil data dari DB yang BARU SAJA disimpan
        const allRegencies = await dbService.getAll<Regency>('regencies');
        const totalRegencies = allRegencies.length;

        if (totalRegencies === 0) {
            throw new Error("Gagal mengunduh data Kabupaten/Kota. Periksa koneksi internet Anda.");
        }

        // 3. Districts
        await asyncPool(12, allRegencies, async (reg) => {
            await fetchDistricts(reg.id);
        }, (count) => {
             const pct = 15 + Math.round((count / totalRegencies) * 25);
             onProgress(`Mengunduh Kecamatan (${count}/${totalRegencies})...`, pct);
        });

        const allDistricts = await dbService.getAll<District>('districts');
        const totalDistricts = allDistricts.length;

        if (totalDistricts === 0) {
             throw new Error("Gagal mengunduh data Kecamatan.");
        }

        // 4. Villages (Heavy Load)
        await asyncPool(20, allDistricts, async (dist) => {
            await fetchVillages(dist.id);
        }, (count) => {
            const pct = 40 + Math.round((count / totalDistricts) * 60);
            onProgress(`Mengunduh Desa (${count}/${totalDistricts})...`, pct);
        });

        onProgress("Finalisasi Database...", 99);
        
        // Verifikasi akhir
        const stats = await getDatabaseStats();
        if (stats.villages === 0) {
            throw new Error("Proses selesai namun data Desa kosong.");
        }

        onProgress("Selesai! Database tersinkronisasi.", 100);
        return true;

    } catch (error: any) {
        console.error("Bulk download failed:", error);
        throw new Error(error.message || "Gagal mengunduh database.");
    }
};