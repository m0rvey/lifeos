import { describe, it, expect } from 'vitest';
import { calculateFatigue } from '../cognitive/helpers';
import type { AppData } from '../types';

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

describe('calculateFatigue', () => {
  const baseData: AppData = {
    version: 3,
    settings: {
      theme: 'mindveyz',
      themeMode: 'manual',
      userName: '',
      accentColor: 'purple',
      fontSizeScale: 1,
      isAdaptive: false,
      graphSensitivity: 50,
      graphWeights: {
        energy: 0.3,
        resonance: 0.3,
        reciprocity: 0.2,
        volatility: 0.1,
        recency: 0.1,
      },
      weekStartDay: 0,
    },
    people: [],
    tasks: [],
    transactions: [],
    reminders: [],
    rides: [],
    routes: [],
    maintenance: [],
    galleryNotes: [],
    journal: [],
    knowledge: [],
    schedule: [],
    habits: [],
    workouts: [],
    thoughts: [],
    fatigue: 0,
  };

  it('returns base fatigue for empty data', () => {
    expect(calculateFatigue(baseData)).toBe(35);
  });

  it('adds fatigue for pending tasks', () => {
    const dataWithTasks = {
      ...baseData,
      tasks: [
        {
          id: '1',
          title: 'Task 1',
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'medium' as const,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
        {
          id: '2',
          title: 'Task 2',
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'high' as const,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
        {
          id: '3',
          title: 'Task 3',
          isCompleted: true,
          dateISO: daysAgoISO(1),
          priority: 'low' as const,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
      ],
    };

    expect(calculateFatigue(dataWithTasks)).toBe(45);
  });

  it('caps fatigue at 25 for many tasks', () => {
    const dataWithManyTasks = {
      ...baseData,
      tasks: Array(10)
        .fill(null)
        .map((_, i) => ({
          id: i.toString(),
          title: `Task ${i}`,
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'medium' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        })),
    };

    expect(calculateFatigue(dataWithManyTasks)).toBe(60);
  });

  it('reduces fatigue for rest schedule blocks', () => {
    const dataWithRest = {
      ...baseData,
      schedule: [
        {
          id: '1',
          title: 'Rest',
          type: 'rest' as const,
          dateISO: daysAgoISO(1),
          isCompleted: true,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
      ],
    };

    expect(calculateFatigue(dataWithRest)).toBe(25);
  });

  it('increases fatigue for work schedule blocks', () => {
    const dataWithWork = {
      ...baseData,
      schedule: [
        {
          id: '1',
          title: 'Work',
          type: 'work' as const,
          dateISO: daysAgoISO(1),
          isCompleted: true,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
      ],
    };

    expect(calculateFatigue(dataWithWork)).toBe(41);
  });

  it('increases fatigue for workouts', () => {
    const dataWithWorkouts = {
      ...baseData,
      workouts: [
        {
          id: '1',
          title: 'Workout 1',
          dateISO: daysAgoISO(1),
          type: 'cardio' as const,
          durationMin: 60,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
        {
          id: '2',
          title: 'Workout 2',
          dateISO: daysAgoISO(1),
          type: 'strength' as const,
          durationMin: 45,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
      ],
    };

    expect(calculateFatigue(dataWithWorkouts)).toBe(51);
  });

  it('increases fatigue for rides', () => {
    const dataWithRides = {
      ...baseData,
      rides: [
        {
          id: '1',
          title: 'Ride 1',
          dateISO: daysAgoISO(1),
          distanceKm: 25,
          durationMin: 60,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
      ],
    };

    expect(calculateFatigue(dataWithRides)).toBe(43);
  });

  it('caps fatigue at minimum 5', () => {
    const dataWithNegative = {
      ...baseData,
      schedule: [
        {
          id: '1',
          title: 'Rest',
          type: 'rest' as const,
          dateISO: daysAgoISO(1),
          isCompleted: true,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
        {
          id: '2',
          title: 'Rest',
          type: 'rest' as const,
          dateISO: daysAgoISO(1),
          isCompleted: true,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
        {
          id: '3',
          title: 'Rest',
          type: 'rest' as const,
          dateISO: daysAgoISO(1),
          isCompleted: true,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
        {
          id: '4',
          title: 'Rest',
          type: 'rest' as const,
          dateISO: daysAgoISO(1),
          isCompleted: true,
          createdAt: daysAgoISO(1) + 'T00:00:00Z',
          updatedAt: daysAgoISO(1) + 'T00:00:00Z',
        },
      ],
    };

    expect(calculateFatigue(dataWithNegative)).toBe(5);
  });

  it('caps fatigue at maximum 95', () => {
    const dataWithTooMuch = {
      ...baseData,
      tasks: Array(20)
        .fill(null)
        .map((_, i) => ({
          id: i.toString(),
          title: `Task ${i}`,
          description: '',
          emotion: 50,
          urgency: 50,
          deadlineISO: null,
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'high' as const,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        })),
      workouts: Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `w${i}`,
          title: `Workout ${i}`,
          dateISO: daysAgoISO(1),
          type: 'cardio' as const,
          durationMin: 60,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        })),
    };

    expect(calculateFatigue(dataWithTooMuch)).toBe(95);
  });
});
