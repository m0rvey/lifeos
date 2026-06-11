import type { AppData } from '../types';
import { migrateData } from './migrations';

export function exportBackup(data: AppData): void {
  let url: string | null = null;
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `m0rveyz_platform_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('[Backup] Failed to export data:', err);
    throw new Error('Не удалось экспортировать резервную копию');
  } finally {
    if (url) {
      const tempUrl = url;
      setTimeout(() => {
        URL.revokeObjectURL(tempUrl);
      }, 1000);
    }
  }
}

export function importBackup(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string' || !result) {
          throw new Error('Файл пуст');
        }
        const parsed = JSON.parse(result);
        
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Некорректный формат файла резервной копии');
        }
        
        // Pass through migrateData without default fallback to catch and report validation errors
        const validated = migrateData(parsed, false);
        resolve(validated);
      } catch (err) {
        console.error('[Backup] Import failed:', err);
        reject(err instanceof Error ? err : new Error('Некорректный формат файла резервной копии'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Ошибка при чтении файла'));
    };
    reader.readAsText(file);
  });
}
export function wipeAllData(): void {
  const keys = [
    'm0rveyz_platform_v3',
    '_temp_m0rveyz_platform_v3',
    'm0rveyz_state',
    'synthara-data',
    'cyclist_performance_v2',
    'finance_data',
    'social-architecture-people-v1',
    'museum_thoughts'
  ];
  keys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore
    }
  });
}
