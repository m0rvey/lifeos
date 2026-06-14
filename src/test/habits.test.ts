import { describe, it, expect } from 'vitest';
import { calcStreak, getStreakLevel } from '../cognitive/habits';

describe('calcStreak', () => {
  it('returns 0 for empty dates array', () => {
    expect(calcStreak([])).toEqual({ current: 0, max: 0 });
  });

  it('returns current streak of 1 for single date', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(calcStreak([today])).toEqual({ current: 1, max: 1 });
  });

  it('calculates current streak for consecutive dates', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);

    expect(calcStreak([today, yesterdayStr, twoDaysAgoStr])).toEqual({ current: 3, max: 3 });
  });

  it('resets current streak when gap found', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 3);
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);

    expect(calcStreak([today, yesterdayStr, twoDaysAgoStr])).toEqual({ current: 2, max: 2 });
  });

  it('calculates max streak correctly', () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

    expect(calcStreak([today, yesterdayStr, twoDaysAgoStr, threeDaysAgoStr])).toEqual({
      current: 4,
      max: 4,
    });
  });

  it('handles duplicate dates', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(calcStreak([today, today, today])).toEqual({ current: 1, max: 1 });
  });
});

describe('getStreakLevel', () => {
  it('returns level 0 for streak < 7', () => {
    expect(getStreakLevel(0)).toBe(0);
    expect(getStreakLevel(6)).toBe(0);
  });

  it('returns level 1 for streak 7-13', () => {
    expect(getStreakLevel(7)).toBe(1);
    expect(getStreakLevel(13)).toBe(1);
  });

  it('returns level 2 for streak 14-29', () => {
    expect(getStreakLevel(14)).toBe(2);
    expect(getStreakLevel(29)).toBe(2);
  });

  it('returns level 3 for streak >= 30', () => {
    expect(getStreakLevel(30)).toBe(3);
    expect(getStreakLevel(100)).toBe(3);
  });
});
