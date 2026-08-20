import type { AppData } from '../types';
import { getCurrentLanguage } from '../i18n/language';

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function calculateFatigue(data: AppData): number {
  let fatigue = 35; // base fatigue

  // 1. Uncompleted tasks penalty (+5 per pending task, max +25)
  const pendingTasks = data.tasks ? data.tasks.filter((t) => !t.isCompleted) : [];
  fatigue += Math.min(25, pendingTasks.length * 5);

  // 2. Schedule blocks in the last 3 days (strictly bounded by today)
  const todayStr = todayISO();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoISO = threeDaysAgo.toISOString().slice(0, 10);

  const scheduleBlocks = data.schedule ? data.schedule : [];
  const recentBlocks = scheduleBlocks.filter((s) => s.dateISO >= threeDaysAgoISO && s.dateISO <= todayStr);

  recentBlocks.forEach((block) => {
    if (block.isCompleted) {
      if (block.type === 'rest') {
        fatigue -= 10;
      } else if (block.type === 'work' || block.type === 'learning') {
        fatigue += 6;
      }
    }
  });

  // 3. Workouts/rides in the last 3 days (strictly bounded by today)
  const workouts = data.workouts ? data.workouts : [];
  const recentWorkouts = workouts.filter((w) => w.dateISO >= threeDaysAgoISO && w.dateISO <= todayStr);
  fatigue += recentWorkouts.length * 8;

  const rides = data.rides ? data.rides : [];
  const recentRides = rides.filter((r) => r.dateISO >= threeDaysAgoISO && r.dateISO <= todayStr);
  fatigue += recentRides.length * 8;

  return Math.max(5, Math.min(95, Math.round(fatigue)));
}

export function getDaysSince(isoDate: string): number {
  if (!isoDate) return 0;
  let year: number;
  let month: number;
  let day: number;

  const match = isoDate.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    year = parseInt(match[1], 10);
    month = parseInt(match[2], 10) - 1;
    day = parseInt(match[3], 10);
  } else {
    const parsed = new Date(isoDate);
    if (isNaN(parsed.getTime())) return 0;
    year = parsed.getFullYear();
    month = parsed.getMonth();
    day = parsed.getDate();
  }

  const then = new Date(year, month, day, 12, 0, 0, 0);
  const now = new Date();
  const todayAtNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);

  const diffMs = todayAtNoon.getTime() - then.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  return diffDays < 0 ? 0 : diffDays;
}

export function isInWindow(dateISO: string, daysRange: number): boolean {
  if (!dateISO) return false;
  return getDaysSince(dateISO.slice(0, 10)) < daysRange;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    let parsed: Date;
    const match = iso.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      parsed = new Date(year, month, day);
    } else {
      parsed = new Date(iso);
    }

    if (isNaN(parsed.getTime())) return '';
    const lang = getCurrentLanguage();
    const locale = lang === 'en' ? 'en-US' : 'ru-RU';
    return parsed.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (err) {
    console.error(`[formatDate] Failed to format date "${iso}":`, err);
    return '';
  }
}

export function formatCurrency(amount: number): string {
  const lang = getCurrentLanguage();
  const locale = lang === 'en' ? 'en-US' : 'ru-RU';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  const isEn = getCurrentLanguage() === 'en';
  const hStr = isEn ? 'h' : 'ч';
  const mStr = isEn ? 'm' : 'мин';
  return h > 0 ? `${h}${hStr} ${m}${mStr}` : `${m}${mStr}`;
}

export function formatDistance(km: number): string {
  const isEn = getCurrentLanguage() === 'en';
  const unit = isEn ? 'km' : 'км';
  return `${km.toFixed(1)} ${unit}`;
}

export function calcAvgSpeed(distanceKm: number, durationMin: number): number {
  if (durationMin === 0) return 0;
  return Math.round((distanceKm / (durationMin / 60)) * 10) / 10;
}

export function getMoodEmoji(mood: number): { emoji: string; color: string } {
  if (mood >= 80) return { emoji: '😁', color: 'var(--success, #16a34a)' };
  if (mood >= 60) return { emoji: '🙂', color: 'var(--accent)' };
  if (mood >= 40) return { emoji: '😐', color: 'var(--text-secondary)' };
  if (mood >= 20) return { emoji: '🙁', color: 'var(--warning, #f59e0b)' };
  return { emoji: '😢', color: 'var(--error, #ef4444)' };
}

export function getMoodLabel(mood: number): string {
  const isEn = getCurrentLanguage() === 'en';
  if (mood >= 80) return isEn ? '😁 Great' : '😁 Великолепно';
  if (mood >= 60) return isEn ? '🙂 Good' : '🙂 Хорошо';
  if (mood >= 40) return isEn ? '😐 Normal' : '😐 Нормально';
  if (mood >= 20) return isEn ? '🙁 Bad' : '🙁 Плохо';
  return isEn ? '😢 Awful' : '😢 Тяжело';
}

export function sanitizeUrl(urlStr: string): string {
  if (!urlStr) return '';
  const trimmed = urlStr.trim();
  // Block javascript:, data:, and vbscript: to prevent XSS attacks
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return 'about:blank';
  }
  // Allow relative paths, standard web protocols, or query routes
  if (/^https?:\/\//i.test(trimmed) || /^\//.test(trimmed) || !trimmed.includes(':')) {
    return trimmed;
  }
  return 'about:blank';
}
