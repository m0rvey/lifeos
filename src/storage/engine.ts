import type { AppData } from '../types';
import { getDefaultData } from './defaults';
import { safeSaveItem } from './atomic';
import { migrateData } from './migrations';
import { loadDataIDB, saveDataIDB, migrateFromLocalStorage, hasIDBData } from './idbEngine';

const STORAGE_KEY = 'lifeos_platform_v1';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return migrateData(null);
    }
    const parsed = JSON.parse(raw);
    return migrateData(parsed);
  } catch (err) {
    console.error('[Storage] Error loading data, falling back to defaults:', err);
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    safeSaveItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[Storage] Failed to save data:', err);
    if (typeof window !== 'undefined') {
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' ||
          err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
          err.code === 22 ||
          err.code === 1014);
      const detail = isQuota
        ? new Error(
            'Недостаточно места в LocalStorage. Пожалуйста, очистите историю или экспортируйте резервную копию.'
          )
        : err instanceof Error
          ? err
          : new Error('Неизвестная ошибка хранилища');
      window.dispatchEvent(new CustomEvent('storage-error', { detail }));
    }
  }
}

export async function loadDataAsync(): Promise<AppData> {
  try {
    const hasIDB = await hasIDBData();
    if (hasIDB) {
      return loadDataIDB();
    }
    const migrated = await migrateFromLocalStorage();
    if (migrated) {
      return loadDataIDB();
    }
  } catch (err) {
    console.warn('[Storage] IndexedDB unavailable, falling back to localStorage:', err);
  }
  return loadData();
}

export async function saveDataAsync(data: AppData): Promise<void> {
  try {
    await saveDataIDB(data);
    return;
  } catch (err) {
    console.warn('[Storage] IndexedDB save failed, falling back to localStorage:', err);
  }
  saveData(data);
}
