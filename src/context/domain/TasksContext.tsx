import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useData } from '../DataContext';

function useTasksData() {
  const { data, dispatch } = useData();
  const tasks = useMemo(() => data.tasks, [data.tasks]);
  return { tasks, dispatch };
}

const TasksContext = createContext<ReturnType<typeof useTasksData> | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const value = useTasksData();
  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
