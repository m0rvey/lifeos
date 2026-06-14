import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React, { Dispatch } from 'react';
import { DataProvider, DataAction } from '../context/DataContext';
import { FinanceProvider, useFinance } from '../context/domain/FinanceContext';
import { TasksProvider, useTasks } from '../context/domain/TasksContext';
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

describe('Domain Context Isolation', () => {
  it('does not re-render Finance consumer when Tasks change', () => {
    mockLoadData.mockReturnValue(defaultData());
    mockGetDefaultData.mockReturnValue(defaultData());

    const financeRenderCount = { current: 0 };
    const tasksRenderCount = { current: 0 };

    let dispatchFn: Dispatch<DataAction> | null = null;

    function FinanceConsumer() {
      const { transactions } = useFinance();
      financeRenderCount.current++;
      return <div>Finance: {transactions.length}</div>;
    }

    function TasksConsumer() {
      const { tasks, dispatch } = useTasks();
      dispatchFn = dispatch;
      tasksRenderCount.current++;
      return <div>Tasks: {tasks.length}</div>;
    }

    function App() {
      return (
        <DataProvider>
          <FinanceProvider>
            <FinanceConsumer />
          </FinanceProvider>
          <TasksProvider>
            <TasksConsumer />
          </TasksProvider>
        </DataProvider>
      );
    }

    render(<App />);

    const initialFinanceRenders = financeRenderCount.current;
    const initialTasksRenders = tasksRenderCount.current;

    React.act(() => {
      dispatchFn({
        type: 'ADD_ENTITY',
        entity: 'tasks',
        payload: {
          id: 't1',
          title: 'New Task',
          tags: [],
          isCompleted: false,
          emotion: 50,
          urgency: 50,
          deadlineISO: null,
          description: '',
          createdAt: '',
          updatedAt: '',
        },
      });
    });

    expect(tasksRenderCount.current).toBeGreaterThan(initialTasksRenders);
    expect(financeRenderCount.current).toBe(initialFinanceRenders);
  });
});
