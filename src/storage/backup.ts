import type { AppData } from '../types';
import { migrateData } from './migrations';

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(','));
  }
  return lines.join('\n');
}

function downloadCsv(content: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportTransactionsCsv(data: AppData): void {
  const headers = ['ID', 'Тип', 'Сумма', 'Категория', 'Описание', 'Дата'];
  const rows = data.transactions.map(tx => [
    tx.id, tx.type === 'income' ? 'Доход' : 'Расход',
    tx.amount, tx.category, tx.description, tx.dateISO
  ]);
  downloadCsv(arrayToCsv(headers, rows), `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportRidesCsv(data: AppData): void {
  const headers = ['ID', 'Название', 'Дата', 'Дистанция (км)', 'Время (мин)', 'Ср. скорость', 'Макс. скорость', 'Набор высоты (м)'];
  const rows = data.rides.map(r => [
    r.id, r.title, r.dateISO, r.distanceKm, r.durationMin,
    r.avgSpeedKmh, r.maxSpeedKmh, r.elevationGainM
  ]);
  downloadCsv(arrayToCsv(headers, rows), `rides_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportPeopleCsv(data: AppData): void {
  const headers = ['ID', 'Имя', 'Круг', 'Архетип', 'Статус', 'Энергия', 'Резонанс', 'Взаимность', 'Последний контакт'];
  const rows = data.people.map(p => [
    p.id, p.name, p.depth, p.archetype, p.status,
    p.energy, p.resonance, p.reciprocity, p.lastContactISO
  ]);
  downloadCsv(arrayToCsv(headers, rows), `people_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportBackup(data: AppData): void {
  let url: string | null = null;
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
    'lifeos_platform_v1',
    '_temp_lifeos_platform_v1',
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
