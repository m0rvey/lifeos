import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '../../context/DataContext';
import { saveDataAsync } from '../../storage/engine';

vi.mock('../../storage/engine', () => ({
  loadData: vi.fn(() => ({
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
    fatigue: 35,
  })),
  saveData: vi.fn(),
  saveDataAsync: vi.fn(),
  hasIDBData: vi.fn(() => Promise.resolve(false)),
}));

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

describe('Task → Fatigue integration', () => {
  it('adds pending task and recalculates fatigue', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });
    const initialFatigue = result.current.data.fatigue;

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'tasks',
        payload: {
          id: 't1',
          title: 'New Task',
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'medium' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    expect(result.current.data.tasks).toHaveLength(1);
    expect(result.current.data.fatigue).toBe(Math.min(100, initialFatigue + 5));
  });

  it('removes pending task and fatigue decreases', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'tasks',
        payload: {
          id: 't1',
          title: 'Task',
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'medium' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    const fatigueWithTask = result.current.data.fatigue;

    act(() => {
      result.current.dispatch({
        type: 'DELETE_ENTITY',
        entity: 'tasks',
        id: 't1',
      });
    });

    expect(result.current.data.fatigue).toBeLessThan(fatigueWithTask);
  });
});

describe('Workout → Fatigue integration', () => {
  it('multiple workouts increase fatigue cumulatively', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'workouts',
        payload: {
          id: 'w1',
          title: 'Morning Run',
          dateISO: daysAgoISO(1),
          type: 'running' as const,
          durationMin: 30,
          intensity: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });
    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'workouts',
        payload: {
          id: 'w2',
          title: 'Evening Yoga',
          dateISO: daysAgoISO(1),
          type: 'yoga' as const,
          durationMin: 45,
          intensity: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    expect(result.current.data.workouts).toHaveLength(2);
    expect(result.current.data.fatigue).toBe(35 + 8 + 8);
  });
});

describe('Schedule → Fatigue integration', () => {
  it('rest blocks reduce fatigue', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'schedule',
        payload: {
          id: 's1',
          title: 'Rest',
          dateISO: daysAgoISO(1),
          type: 'rest' as const,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    expect(result.current.data.fatigue).toBe(25);
  });

  it('work blocks increase fatigue', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'schedule',
        payload: {
          id: 's1',
          title: 'Work',
          dateISO: daysAgoISO(1),
          type: 'work' as const,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    expect(result.current.data.fatigue).toBe(41);
  });
});

describe('Multi-entity cross-module integration', () => {
  it('task + workout + rest combine correctly', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'tasks',
        payload: {
          id: 't1',
          title: 'Work',
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'medium' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'workouts',
        payload: {
          id: 'w1',
          title: 'Gym',
          dateISO: daysAgoISO(1),
          type: 'gym' as const,
          durationMin: 60,
          intensity: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'schedule',
        payload: {
          id: 's1',
          title: 'Rest',
          dateISO: daysAgoISO(1),
          type: 'rest' as const,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    expect(result.current.data.fatigue).toBe(38);
  });
});

describe('Person → social cognitive integration', () => {
  it('adds person and data is accessible via dispatch', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'people',
        payload: {
          id: 'p1',
          name: 'Alice',
          depth: 'core' as const,
          archetype: 'emotional' as const,
          status: 'active' as const,
          energy: 90,
          resonance: 80,
          reciprocity: 85,
          volatility: 10,
          lastContactISO: daysAgoISO(1),
          reflection: '',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    expect(result.current.data.people).toHaveLength(1);
    expect(result.current.data.people[0].name).toBe('Alice');
  });

  it('updating a person preserves other entities', () => {
    const { result } = renderHook(() => useData(), { wrapper: DataProvider });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'people',
        payload: {
          id: 'p1',
          name: 'Alice',
          depth: 'core' as const,
          archetype: 'emotional' as const,
          status: 'active' as const,
          energy: 90,
          resonance: 80,
          reciprocity: 85,
          volatility: 10,
          lastContactISO: daysAgoISO(1),
          reflection: '',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });
    act(() => {
      result.current.dispatch({
        type: 'ADD_ENTITY',
        entity: 'tasks',
        payload: {
          id: 't1',
          title: 'Task',
          isCompleted: false,
          dateISO: daysAgoISO(1),
          priority: 'medium' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    });

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'people',
        id: 'p1',
        payload: { energy: 50 },
      });
    });

    expect(result.current.data.people[0].energy).toBe(50);
    expect(result.current.data.tasks).toHaveLength(1);
  });
});

describe('Data persistence integration', () => {
  it('calls saveDataAsync when data changes', () => {
    renderHook(() => useData(), { wrapper: DataProvider });
    vi.waitFor(
      () => {
        expect(saveDataAsync).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
