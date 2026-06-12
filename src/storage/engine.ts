import type { AppData } from '../types';
import { getDefaultData } from './defaults';
import { safeSaveItem } from './atomic';
import { migrateData } from './migrations';

export const STORAGE_KEY = 'lifeos_platform_v1';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // If V3 key is empty, check if we can migrate legacy data
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
      const isQuota = err instanceof DOMException && (
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014
      );
      const detail = isQuota 
        ? new Error('Недостаточно места в LocalStorage. Пожалуйста, очистите историю или экспортируйте резервную копию.')
        : (err instanceof Error ? err : new Error('Неизвестная ошибка хранилища'));
      window.dispatchEvent(new CustomEvent('storage-error', { detail }));
    }
  }
}
