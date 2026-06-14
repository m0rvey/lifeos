import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { DataProvider } from '../context/DataContext';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { loadData } from '../storage/engine';
import { getDefaultData } from '../storage/defaults';

vi.mock('../storage/engine', () => ({
  loadData: vi.fn(),
  saveDataAsync: vi.fn(),
  hasIDBData: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('../storage/defaults', () => ({
  getDefaultData: vi.fn(),
}));

const mockLoadData = vi.mocked(loadData);
const mockGetDefaultData = vi.mocked(getDefaultData);

function defaultData(overrides?: Record<string, unknown>) {
  return {
    version: 3,
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
    ...overrides,
  };
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}

function tick() {
  act(() => {
    vi.advanceTimersByTime(301);
  });
}

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array for empty query', () => {
    mockLoadData.mockReturnValue(defaultData());
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch(''), { wrapper: Wrapper });
    tick();
    expect(result.current).toEqual([]);
  });

  it('finds journal entries by title', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        journal: [
          {
            id: 'j1',
            title: 'My Trip to Paris',
            content: 'It was amazing',
            mood: 80,
            dateISO: '2026-06-01',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'j2',
            title: 'Work Notes',
            content: 'Meeting notes',
            mood: 50,
            dateISO: '2026-06-02',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('Paris'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('j1');
    expect(result.current[0].type).toBe('journal');
  });

  it('finds journal entries by content', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        journal: [
          {
            id: 'j1',
            title: 'Daily Log',
            content: 'Went hiking in the mountains',
            mood: 75,
            dateISO: '2026-06-01',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('hiking'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('j1');
  });

  it('finds people by name', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        people: [
          {
            id: 'p1',
            name: 'Alice Johnson',
            tags: [],
            depth: 'core',
            archetype: 'intellectual',
            status: 'active',
            energy: 80,
            resonance: 70,
            reciprocity: 90,
            volatility: 20,
            lastContactISO: '2026-06-01',
            reflection: 'Great friend',
            notes: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('alice'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(1);
    expect(result.current[0].type).toBe('person');
    expect(result.current[0].url).toBe('/social/p1');
  });

  it('finds knowledge items by tags', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        knowledge: [
          {
            id: 'k1',
            title: 'React Patterns',
            content: 'Advanced patterns',
            category: 'Books',
            source: '',
            url: '',
            tags: ['react', 'frontend'],
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('frontend'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(1);
    expect(result.current[0].type).toBe('knowledge');
  });

  it('finds tasks', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        tasks: [
          {
            id: 't1',
            title: 'Buy groceries',
            description: 'Milk, eggs, bread',
            isCompleted: false,
            emotion: 50,
            urgency: 30,
            deadlineISO: null,
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('groceries'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(1);
    expect(result.current[0].type).toBe('task');
  });

  it('finds thoughts by content', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        thoughts: [
          {
            id: 'th1',
            content: 'I should start meditating daily',
            category: 'health',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('meditating'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(1);
    expect(result.current[0].type).toBe('thought');
  });

  it('returns max 20 results', () => {
    const journal = Array.from({ length: 25 }, (_, i) => ({
      id: `j${i}`,
      title: `Entry ${i}`,
      content: 'test content',
      mood: 50,
      dateISO: '2026-06-01',
      tags: [],
      createdAt: '',
      updatedAt: '',
    }));
    mockLoadData.mockReturnValue(defaultData({ journal }));
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('test'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(20);
  });

  it('handles case-insensitive search', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        journal: [
          {
            id: 'j1',
            title: 'UpperCase Title',
            content: 'Some content',
            mood: 50,
            dateISO: '2026-06-01',
            tags: [],
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useGlobalSearch('uppercase'), { wrapper: Wrapper });
    tick();
    expect(result.current).toHaveLength(1);
  });
});
