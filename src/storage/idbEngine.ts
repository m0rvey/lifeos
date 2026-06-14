import { openDB, type IDBPDatabase } from 'idb';
import type { AppData } from '../types';
import { migrateData } from './migrations';
import { getDefaultData } from './defaults';

const DB_NAME = 'lifeos';
const DB_VERSION = 1;
const STORE_NAME = 'appData';
const KEY = 'lifeos_platform_v1';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadDataIDB(): Promise<AppData> {
  try {
    const db = await getDB();
    const raw = await db.get(STORE_NAME, KEY);
    if (raw) {
      return migrateData(raw);
    }
    return migrateData(null);
  } catch (err) {
    console.error('[IDB] Error loading data, falling back to defaults:', err);
    return getDefaultData();
  }
}

export async function saveDataIDB(data: AppData): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, data, KEY);
  } catch (err) {
    console.error('[IDB] Failed to save data:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: err instanceof Error ? err : new Error('Unknown IndexedDB error'),
      }));
    }
  }
}

export async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    const lsRaw = localStorage.getItem(KEY);
    if (!lsRaw) return false;

    const db = await getDB();
    const existing = await db.get(STORE_NAME, KEY);
    if (existing) return false;

    const parsed = JSON.parse(lsRaw);
    await db.put(STORE_NAME, parsed, KEY);
    console.log('[IDB] Migrated data from localStorage to IndexedDB');
    return true;
  } catch (err) {
    console.error('[IDB] Migration from localStorage failed:', err);
    return false;
  }
}

export async function hasIDBData(): Promise<boolean> {
  try {
    const db = await getDB();
    const existing = await db.get(STORE_NAME, KEY);
    return !!existing;
  } catch {
    return false;
  }
}
