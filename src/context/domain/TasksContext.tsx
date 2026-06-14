import { useContext, useSyncExternalStore, type ReactNode } from 'react';
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

  const tasks = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().tasks
  );

  return { tasks, dispatch };
}
