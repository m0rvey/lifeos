import { useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react';
import { useDataStore, DataDispatchContext } from '../DataContext';

export function TasksProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTasks() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error('useTasks must be used within DataProvider');
  }

  const store = useDataStore();

  const getTasks = useCallback(() => store.getSnapshot().tasks, [store]);
  const tasks = useSyncExternalStore(store.subscribe, getTasks);

  return { tasks, dispatch };
}
