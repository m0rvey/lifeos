import { describe, it, expect } from 'vitest';
import {
  uid,
  todayISO,
  nowISO,
  formatDate,
  formatCurrency,
  formatDuration,
  formatDistance,
  calcAvgSpeed,
  getDaysSince,
  clamp,
  getMoodEmoji,
  getMoodLabel,
} from '../cognitive/helpers';

describe('uid', () => {
  it('generates unique ids', () => {
    const id1 = uid();
    const id2 = uid();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });
});

describe('todayISO', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('nowISO', () => {
  it('returns ISO string', () => {
    const result = nowISO();
    expect(result).toContain('T');
  });
});

describe('formatDate', () => {
  it('formats valid date', () => {
    const result = formatDate('2026-01-15');
    expect(result).toBeTruthy();
  });

  it('returns empty for invalid date', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatCurrency', () => {
  it('formats number as currency', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1');
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(30)).toBe('30мин');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1ч 30мин');
  });
});

describe('formatDistance', () => {
  it('formats km', () => {
    expect(formatDistance(10.5)).toBe('10.5 км');
  });
});

describe('calcAvgSpeed', () => {
  it('calculates average speed', () => {
    expect(calcAvgSpeed(30, 60)).toBe(30);
  });

  it('returns 0 for zero duration', () => {
    expect(calcAvgSpeed(30, 0)).toBe(0);
  });
});

describe('clamp', () => {
  it('clamps value to range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('getMoodEmoji', () => {
  it('returns correct emoji for mood levels', () => {
    expect(getMoodEmoji(90).emoji).toBe('😁');
    expect(getMoodEmoji(70).emoji).toBe('🙂');
    expect(getMoodEmoji(50).emoji).toBe('😐');
    expect(getMoodEmoji(30).emoji).toBe('🙁');
    expect(getMoodEmoji(10).emoji).toBe('😢');
  });
});

describe('getMoodLabel', () => {
  it('returns label with emoji', () => {
    expect(getMoodLabel(90)).toContain('Великолепно');
    expect(getMoodLabel(70)).toContain('Хорошо');
    expect(getMoodLabel(50)).toContain('Нормально');
  });
});
