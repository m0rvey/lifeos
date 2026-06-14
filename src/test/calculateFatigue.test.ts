import { describe, it, expect } from 'vitest';
import { calculateFatigue } from '../cognitive/helpers';

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function makeBaseData() {
  return {
    version: 3 as const,
    settings: {
      theme: 'mindveyz' as const,
      themeMode: 'manual' as const,
      userName: '',
      accentColor: 'purple' as const,
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
      weekStartDay: 0 as const,
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
    fatigue: 35,
  };
}

describe('calculateFatigue', () => {
  it('returns base fatigue of 35 when no data', () => {
    const fatigue = calculateFatigue(makeBaseData());
    expect(fatigue).toBe(35);
  });

  it('adds 5 per pending task (max +25)', () => {
    const data = makeBaseData();
    data.tasks = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      description: '',
      emotion: 50,
      urgency: 50,
      deadlineISO: null,
      isCompleted: false,
      tags: [],
      createdAt: '',
      updatedAt: '',
    }));

    expect(calculateFatigue(data)).toBe(35 + 25);
  });

  it('ignores completed tasks', () => {
    const data = makeBaseData();
    data.tasks = [
      {
        id: 't1',
        title: 'Done',
        description: '',
        emotion: 50,
        urgency: 50,
        deadlineISO: null,
        isCompleted: true,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 't2',
        title: 'Pending',
        description: '',
        emotion: 50,
        urgency: 50,
        deadlineISO: null,
        isCompleted: false,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(35 + 5);
  });

  it('caps pending task penalty at +25', () => {
    const data = makeBaseData();
    data.tasks = Array.from({ length: 100 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      description: '',
      emotion: 50,
      urgency: 50,
      deadlineISO: null,
      isCompleted: false,
      tags: [],
      createdAt: '',
      updatedAt: '',
    }));

    expect(calculateFatigue(data)).toBe(35 + 25);
  });

  it('rest blocks reduce fatigue by 10', () => {
    const data = makeBaseData();
    data.schedule = [
      {
        id: 's1',
        title: 'Rest',
        dateISO: daysAgoISO(1),
        startTime: '12:00',
        durationMin: 60,
        type: 'rest' as const,
        isCompleted: true,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(25);
  });

  it('work blocks increase fatigue by 6', () => {
    const data = makeBaseData();
    data.schedule = [
      {
        id: 's1',
        title: 'Work',
        dateISO: daysAgoISO(1),
        startTime: '09:00',
        durationMin: 480,
        type: 'work' as const,
        isCompleted: true,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(41);
  });

  it('learning blocks increase fatigue by 6', () => {
    const data = makeBaseData();
    data.schedule = [
      {
        id: 's1',
        title: 'Study',
        dateISO: daysAgoISO(1),
        startTime: '10:00',
        durationMin: 120,
        type: 'learning' as const,
        isCompleted: true,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(41);
  });

  it('incomplete blocks do not affect fatigue', () => {
    const data = makeBaseData();
    data.schedule = [
      {
        id: 's1',
        title: 'Skipped Rest',
        dateISO: daysAgoISO(1),
        startTime: '12:00',
        durationMin: 60,
        type: 'rest' as const,
        isCompleted: false,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 's2',
        title: 'Skipped Work',
        dateISO: daysAgoISO(1),
        startTime: '09:00',
        durationMin: 480,
        type: 'work' as const,
        isCompleted: false,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(35);
  });

  it('old schedule blocks (outside 3 days) are ignored', () => {
    const data = makeBaseData();
    data.schedule = [
      {
        id: 's1',
        title: 'Old Rest',
        dateISO: daysAgoISO(10),
        startTime: '12:00',
        durationMin: 60,
        type: 'rest' as const,
        isCompleted: true,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(35);
  });

  it('workouts add 8 fatigue each', () => {
    const data = makeBaseData();
    data.workouts = [
      {
        id: 'w1',
        dateISO: daysAgoISO(1),
        type: 'running' as const,
        durationMin: 30,
        intensity: 3 as const,
        description: '',
        calories: null,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'w2',
        dateISO: daysAgoISO(2),
        type: 'yoga' as const,
        durationMin: 45,
        intensity: 2 as const,
        description: '',
        calories: null,
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(35 + 16);
  });

  it('rides add 8 fatigue each', () => {
    const data = makeBaseData();
    data.rides = [
      {
        id: 'r1',
        dateISO: daysAgoISO(1),
        title: 'Morning Ride',
        distanceKm: 20,
        durationMin: 60,
        avgSpeedKmh: 20,
        maxSpeedKmh: 35,
        elevationGainM: 100,
        avgPowerW: null,
        avgHrBpm: null,
        description: '',
        routeId: null,
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(35 + 8);
  });

  it('clamps result between 5 and 95', () => {
    const data = makeBaseData();
    // Lots of fatigue-increasing items
    data.tasks = Array.from({ length: 100 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      description: '',
      emotion: 50,
      urgency: 50,
      deadlineISO: null,
      isCompleted: false,
      tags: [],
      createdAt: '',
      updatedAt: '',
    }));
    data.workouts = Array.from({ length: 20 }, (_, i) => ({
      id: `w${i}`,
      dateISO: daysAgoISO(1),
      type: 'running' as const,
      durationMin: 30,
      intensity: 3 as const,
      description: '',
      calories: null,
      createdAt: '',
      updatedAt: '',
    }));

    const fatigue = calculateFatigue(data);
    expect(fatigue).toBeGreaterThanOrEqual(5);
    expect(fatigue).toBeLessThanOrEqual(95);
  });

  it('combines multiple factors correctly: tasks + rest + workout', () => {
    const data = makeBaseData();
    data.tasks = [
      {
        id: 't1',
        title: 'Task',
        description: '',
        emotion: 50,
        urgency: 50,
        deadlineISO: null,
        isCompleted: false,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    data.schedule = [
      {
        id: 's1',
        title: 'Rest',
        dateISO: daysAgoISO(1),
        startTime: '12:00',
        durationMin: 60,
        type: 'rest' as const,
        isCompleted: true,
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ];
    data.workouts = [
      {
        id: 'w1',
        dateISO: daysAgoISO(1),
        type: 'gym' as const,
        durationMin: 60,
        intensity: 4 as const,
        description: '',
        calories: null,
        createdAt: '',
        updatedAt: '',
      },
    ];

    expect(calculateFatigue(data)).toBe(35 + 5 - 10 + 8);
  });
});
