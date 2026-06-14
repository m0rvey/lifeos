import { useSyncExternalStore, useCallback, type ReactNode } from 'react';
import { useDataStore, useDispatch } from '../DataContext';

export function TasksProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTasks() {
  const dispatch = useDispatch();

  const store = useDataStore();

  const getTasks = useCallback(() => store.getSnapshot().tasks, [store]);
  const tasks = useSyncExternalStore(store.subscribe, getTasks);

  return { tasks, dispatch };
}
