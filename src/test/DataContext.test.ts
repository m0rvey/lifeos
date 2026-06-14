import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '../context/DataContext';
import { loadData } from '../storage/engine';
import { getDefaultData } from '../storage/defaults';

vi.mock('../storage/engine', () => ({
  loadData: vi.fn(),
  saveData: vi.fn(),
  saveDataAsync: vi.fn(),
  hasIDBData: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('../storage/defaults', () => ({
  getDefaultData: vi.fn(),
}));

const mockLoadData = vi.mocked(loadData);
const mockGetDefaultData = vi.mocked(getDefaultData);

describe('DataContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadData.mockReturnValue({
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
    });
    mockGetDefaultData.mockReturnValue({
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
    });
  });

  it('provides data and dispatch from useData hook', () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.dispatch).toBeDefined();
  });

  it('throws error when useData is used outside DataProvider', () => {
    expect(() => {
      renderHook(() => useData());
    }).toThrow('useData must be used within DataProvider');
  });

  it('dispatches SET_DATA action', () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    act(() => {
      result.current.dispatch({ type: 'SET_DATA', payload: { version: 4 } });
    });

    expect(result.current.data.version).toBe(4);
  });

  it('dispatches RESET action', () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    act(() => {
      result.current.dispatch({ type: 'RESET' });
    });

    expect(result.current.data.version).toBe(3);
  });

  it('dispatches IMPORT action', () => {
    const importedData = {
      version: 3,
      settings: {
        theme: 'cyclist',
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
    };

    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    act(() => {
      result.current.dispatch({ type: 'IMPORT', payload: importedData });
    });

    expect(result.current.data.settings.theme).toBe('cyclist');
  });

  it('dispatches ADD_ENTITY action', () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    const newPerson = {
      id: '1',
      name: 'John Doe',
      depth: 'core' as const,
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

    act(() => {
      result.current.dispatch({ type: 'ADD_ENTITY', entity: 'people', payload: newPerson });
    });

    expect(result.current.data.people).toHaveLength(1);
    expect(result.current.data.people[0].name).toBe('John Doe');
  });

  it('dispatches UPDATE_ENTITY action', () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    const initialPerson = {
      id: '1',
      name: 'John Doe',
      depth: 'core' as const,
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

    act(() => {
      result.current.dispatch({ type: 'ADD_ENTITY', entity: 'people', payload: initialPerson });
    });

    act(() => {
      result.current.dispatch({ type: 'UPDATE_ENTITY', entity: 'people', id: '1', payload: { energy: 90 } });
    });

    expect(result.current.data.people[0].energy).toBe(90);
  });

  it('dispatches DELETE_ENTITY action', () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    const personToDelete = {
      id: '1',
      name: 'John Doe',
      depth: 'core' as const,
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

    act(() => {
      result.current.dispatch({ type: 'ADD_ENTITY', entity: 'people', payload: personToDelete });
    });

    act(() => {
      result.current.dispatch({ type: 'DELETE_ENTITY', entity: 'people', id: '1' });
    });

    expect(result.current.data.people).toHaveLength(0);
  });
});