import { Province, Regency, District, Village } from '../types';

const DB_NAME = 'WilayahIndonesiaDB';
const DB_VERSION = 3; // Naikkan versi untuk reset struktur jika korup

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;

      const stores = [
        { 
          name: 'provinces', 
          keyPath: 'id', 
          indexes: [
            { name: 'name', keyPath: 'name', unique: false }
          ] 
        },
        { 
          name: 'regencies', 
          keyPath: 'id', 
          indexes: [
            { name: 'province_id', keyPath: 'province_id', unique: false },
            { name: 'name', keyPath: 'name', unique: false }
          ] 
        },
        { 
          name: 'districts', 
          keyPath: 'id', 
          indexes: [
            { name: 'regency_id', keyPath: 'regency_id', unique: false },
            { name: 'name', keyPath: 'name', unique: false }
          ] 
        },
        { 
          name: 'villages', 
          keyPath: 'id', 
          indexes: [
            { name: 'district_id', keyPath: 'district_id', unique: false },
            { name: 'name', keyPath: 'name', unique: false }
          ] 
        }
      ];

      stores.forEach(storeDef => {
        let store: IDBObjectStore;

        if (!db.objectStoreNames.contains(storeDef.name)) {
          store = db.createObjectStore(storeDef.name, { keyPath: storeDef.keyPath });
        } else {
          store = transaction.objectStore(storeDef.name);
        }

        storeDef.indexes.forEach(idx => {
          if (!store.indexNames.contains(idx.name)) {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique });
          }
        });
      });
    };
  });
};

export const dbService = {
  async getAll<T>(storeName: string): Promise<T[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          
          let request: IDBRequest;
          if (store.indexNames.contains('name')) {
            request = store.index('name').getAll();
          } else {
            request = store.getAll();
          }

          request.onsuccess = () => resolve(request.result as T[]);
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("DB Open Error:", e);
        return [];
    }
  },

  async getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          
          if (!store.indexNames.contains(indexName)) {
              // Fallback jika index hilang (jarang terjadi)
              const req = store.getAll();
              req.onsuccess = () => {
                  const all = req.result as any[];
                  const filtered = all.filter(item => item[indexName] === value);
                  filtered.sort((a, b) => a.name.localeCompare(b.name));
                  resolve(filtered as T[]);
              }
              return;
          }

          const index = store.index(indexName);
          const request = index.getAll(value);
          
          request.onsuccess = () => {
              const result = request.result as any[];
              if (result && result.length > 0 && result[0].name) {
                  result.sort((a, b) => a.name.localeCompare(b.name));
              }
              resolve(result as T[]);
          };
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        return [];
    }
  },

  async addBulk<T>(storeName: string, items: T[]): Promise<void> {
    if (items.length === 0) return;
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          
          items.forEach(item => store.put(item));
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
    } catch (e) {
        console.error("DB Write Error:", e);
    }
  },

  async count(storeName: string): Promise<number> {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        return 0;
    }
  },
  
  async clearAll(): Promise<void> {
    const db = await openDB();
    const stores = ['provinces', 'regencies', 'districts', 'villages'];
    const transaction = db.transaction(stores, 'readwrite');
    stores.forEach(storeName => {
        if (db.objectStoreNames.contains(storeName)) {
           transaction.objectStore(storeName).clear();
        }
    });
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
  }
};