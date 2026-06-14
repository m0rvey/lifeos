import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { DataProvider, useData } from '../context/DataContext';
import { AppProvider } from '../context/AppContext';
import { useCrudModal } from '../hooks/useCrudModal';
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

vi.mock('../i18n', () => {
  const ru: Record<string, string> = {
    'toast.created': 'Создано: {title}',
    'toast.updated': 'Обновлено: {title}',
    'toast.deleted': 'Удалено: {title}',
    'action.close': 'Закрыть',
  };
  return {
    I18nProvider: ({ children }: { children: React.ReactNode }) => children,
    useI18n: () => ({
      lang: 'ru',
      setLang: vi.fn(),
      t: (key: string, vars?: Record<string, string | number>) => {
        let text = ru[key] || key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
          }
        }
        return text;
      },
    }),
  };
});

const mockLoadData = vi.mocked(loadData);
const mockGetDefaultData = vi.mocked(getDefaultData);

function defaultData() {
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
  };
}

const toastKeys = {
  created: 'toast.created',
  updated: 'toast.updated',
  deleted: 'toast.deleted',
};

import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../i18n';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <I18nProvider>
        <DataProvider>
          <AppProvider>{children}</AppProvider>
        </DataProvider>
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('useCrudModal', () => {
  it('manages create, update, delete modal states and dispatches actions', () => {
    mockLoadData.mockReturnValue(defaultData());
    mockGetDefaultData.mockReturnValue(defaultData());

    interface TestItem {
      id: string;
      title: string;
      content: string;
    }

    const createDefaults = (data?: Partial<TestItem>): TestItem => ({
      id: 'journ_123',
      title: data?.title || '',
      content: data?.content || '',
    });

    const { result } = renderHook(
      () => ({
        crud: useCrudModal<TestItem>({
          entity: 'journal',
          createDefaults,
          toastKeys,
        }),
        data: useData(),
      }),
      { wrapper: Wrapper }
    );

    expect(result.current.crud.isOpen).toBe(false);
    expect(result.current.crud.editingItem).toBeNull();
    expect(result.current.crud.isDeleteOpen).toBe(false);
    expect(result.current.crud.itemToDelete).toBeNull();

    act(() => {
      result.current.crud.openAdd();
    });
    expect(result.current.crud.isOpen).toBe(true);
    expect(result.current.crud.editingItem).toBeNull();

    act(() => {
      result.current.crud.handleSave({ title: 'New Journal', content: 'Happy day' });
    });
    expect(result.current.crud.isOpen).toBe(false);
    expect(result.current.data.data.journal).toHaveLength(1);
    expect(result.current.data.data.journal[0].title).toBe('New Journal');

    const item = result.current.data.data.journal[0];
    act(() => {
      result.current.crud.openEdit(item);
    });
    expect(result.current.crud.isOpen).toBe(true);
    expect(result.current.crud.editingItem).toEqual(item);

    act(() => {
      result.current.crud.handleSave({ title: 'Updated Journal' });
    });
    expect(result.current.crud.isOpen).toBe(false);
    expect(result.current.data.data.journal[0].title).toBe('Updated Journal');

    act(() => {
      result.current.crud.openDelete('journ_123');
    });
    expect(result.current.crud.isDeleteOpen).toBe(true);
    expect(result.current.crud.itemToDelete).toBe('journ_123');

    act(() => {
      result.current.crud.confirmDelete();
    });
    expect(result.current.crud.isDeleteOpen).toBe(false);
    expect(result.current.data.data.journal).toHaveLength(0);
  });
});
