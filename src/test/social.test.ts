import { describe, it, expect } from 'vitest';
import { computeConnectionScore, isDecaying, getContactThreshold } from '../cognitive/social';
import { Depth } from '../types';

describe('getContactThreshold', () => {
  it('returns correct threshold for CORE depth', () => {
    expect(getContactThreshold(Depth.CORE)).toBe(14);
  });

  it('returns correct threshold for INNER depth', () => {
    expect(getContactThreshold(Depth.INNER)).toBe(30);
  });

  it('returns correct threshold for SOCIAL depth', () => {
    expect(getContactThreshold(Depth.SOCIAL)).toBe(60);
  });

  it('returns correct threshold for PERIPHERY depth', () => {
    expect(getContactThreshold(Depth.PERIPHERY)).toBe(180);
  });
});

describe('computeConnectionScore', () => {
  const weights = {
    energy: 0.3,
    resonance: 0.3,
    reciprocity: 0.2,
    volatility: 0.1,
    recency: 0.1,
  };

  it('calculates score with all factors', () => {
    const person = {
      id: '1',
      name: 'Test Person',
      depth: Depth.CORE,
      archetype: 'intellectual' as const,
      status: 'active' as const,
      energy: 80,
      resonance: 70,
      reciprocity: 90,
      volatility: 20,
      lastContactISO: '2026-01-01',
      reflection: '',
      notes: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const score = computeConnectionScore(person, weights);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('applies recency penalty for old contact', () => {
    const person = {
      id: '1',
      name: 'Test Person',
      depth: Depth.CORE,
      archetype: 'intellectual',
      status: 'active',
      energy: 100,
      resonance: 100,
      reciprocity: 100,
      volatility: 0,
      lastContactISO: '2020-01-01',
      reflection: '',
      notes: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const score = computeConnectionScore(person, weights);
    expect(score).toBeLessThan(100);
  });

  it('handles volatility penalty', () => {
    const person = {
      id: '1',
      name: 'Test Person',
      depth: Depth.CORE,
      archetype: 'intellectual',
      status: 'active',
      energy: 100,
      resonance: 100,
      reciprocity: 100,
      volatility: 100,
      lastContactISO: '2026-01-01',
      reflection: '',
      notes: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const score = computeConnectionScore(person, weights);
    expect(score).toBeLessThan(100);
  });
});

describe('isDecaying', () => {
  it('returns true when contact is older than threshold', () => {
    const person = {
      id: '1',
      name: 'Test Person',
      depth: Depth.CORE,
      archetype: 'intellectual',
      status: 'active',
      energy: 100,
      resonance: 100,
      reciprocity: 100,
      volatility: 0,
      lastContactISO: '2025-12-01',
      reflection: '',
      notes: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    expect(isDecaying(person)).toBe(true);
  });

  it('returns false when contact is recent', () => {
    const today = new Date();
    const recentDate = new Date(today);
    recentDate.setDate(today.getDate() - 3);
    const lastContactISO = recentDate.toISOString().split('T')[0];

    const person = {
      id: '1',
      name: 'Test Person',
      depth: Depth.CORE,
      archetype: 'intellectual',
      status: 'active',
      energy: 100,
      resonance: 100,
      reciprocity: 100,
      volatility: 0,
      lastContactISO,
      reflection: '',
      notes: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    expect(isDecaying(person)).toBe(false);
  });
});