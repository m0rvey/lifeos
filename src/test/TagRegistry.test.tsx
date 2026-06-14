import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider } from '../context/DataContext';
import { TagRegistryProvider, useTagRegistry } from '../context/TagRegistry';
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
  return (
    <DataProvider>
      <TagRegistryProvider>{children}</TagRegistryProvider>
    </DataProvider>
  );
}

describe('TagRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts unique sorted tags from all entities', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        people: [
          {
            id: '1',
            name: 'Alice',
            tags: ['friend', 'work'],
            depth: 'core',
            archetype: 'intellectual',
            status: 'active',
            energy: 80,
            resonance: 70,
            reciprocity: 90,
            volatility: 20,
            lastContactISO: '2026-01-01',
            reflection: '',
            notes: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
        tasks: [
          {
            id: 't1',
            title: 'Task',
            tags: ['work', 'urgent'],
            isCompleted: false,
            emotion: 50,
            urgency: 50,
            deadlineISO: null,
            description: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useTagRegistry(), { wrapper: Wrapper });

    expect(result.current.allTags).toEqual(['friend', 'urgent', 'work']);
  });

  it('returns empty array when no tags exist', () => {
    mockLoadData.mockReturnValue(defaultData());
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useTagRegistry(), { wrapper: Wrapper });

    expect(result.current.allTags).toEqual([]);
  });

  it('renameTag renames tag in all entities', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        people: [
          {
            id: '1',
            name: 'Alice',
            tags: ['oldtag'],
            depth: 'core',
            archetype: 'intellectual',
            status: 'active',
            energy: 80,
            resonance: 70,
            reciprocity: 90,
            volatility: 20,
            lastContactISO: '2026-01-01',
            reflection: '',
            notes: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useTagRegistry(), { wrapper: Wrapper });

    act(() => {
      result.current.renameTag('oldtag', 'newtag');
    });

    expect(result.current.allTags).toContain('newtag');
    expect(result.current.allTags).not.toContain('oldtag');
  });

  it('deleteTag removes tag from all entities', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        people: [
          {
            id: '1',
            name: 'Alice',
            tags: ['remove-me'],
            depth: 'core',
            archetype: 'intellectual',
            status: 'active',
            energy: 80,
            resonance: 70,
            reciprocity: 90,
            volatility: 20,
            lastContactISO: '2026-01-01',
            reflection: '',
            notes: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
        tasks: [
          {
            id: 't1',
            title: 'Task',
            tags: ['remove-me', 'keep'],
            isCompleted: false,
            emotion: 50,
            urgency: 50,
            deadlineISO: null,
            description: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useTagRegistry(), { wrapper: Wrapper });

    act(() => {
      result.current.deleteTag('remove-me');
    });

    expect(result.current.allTags).toEqual(['keep']);
  });

  it('renameTag is no-op when old and new are identical', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        people: [
          {
            id: '1',
            name: 'Alice',
            tags: ['same'],
            depth: 'core',
            archetype: 'intellectual',
            status: 'active',
            energy: 80,
            resonance: 70,
            reciprocity: 90,
            volatility: 20,
            lastContactISO: '2026-01-01',
            reflection: '',
            notes: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useTagRegistry(), { wrapper: Wrapper });

    act(() => {
      result.current.renameTag('same', 'same');
    });

    expect(result.current.allTags).toEqual(['same']);
  });

  it('throws when useTagRegistry is used outside provider', () => {
    expect(() => {
      renderHook(() => useTagRegistry());
    }).toThrow('useTagRegistry must be used within TagRegistryProvider');
  });

  it('renameTag and deleteTag trigger granular updates on entities', () => {
    mockLoadData.mockReturnValue(
      defaultData({
        people: [
          {
            id: 'p1',
            name: 'Alice',
            tags: ['oldtag'],
            depth: 'core',
            archetype: 'intellectual',
            status: 'active',
            energy: 80,
            resonance: 70,
            reciprocity: 90,
            volatility: 20,
            lastContactISO: '2026-01-01',
            reflection: '',
            notes: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
        tasks: [
          {
            id: 't1',
            title: 'Task 1',
            tags: ['oldtag', 'keeptag'],
            isCompleted: false,
            emotion: 50,
            urgency: 50,
            deadlineISO: null,
            description: '',
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    );
    mockGetDefaultData.mockReturnValue(defaultData());

    const { result } = renderHook(() => useTagRegistry(), { wrapper: Wrapper });

    act(() => {
      result.current.renameTag('oldtag', 'newtag');
    });

    expect(result.current.allTags).toEqual(['keeptag', 'newtag']);

    act(() => {
      result.current.deleteTag('newtag');
    });

    expect(result.current.allTags).toEqual(['keeptag']);
  });
});
