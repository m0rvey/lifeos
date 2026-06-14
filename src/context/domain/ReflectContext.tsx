import { useContext, useSyncExternalStore, type ReactNode } from 'react';
import { useDataStore, DataDispatchContext } from '../DataContext';

export function ReflectProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useReflect() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error('useReflect must be used within DataProvider');
  }

  const store = useDataStore();

  const journal = useSyncExternalStore(store.subscribe, () => store.getSnapshot().journal);
  const knowledge = useSyncExternalStore(store.subscribe, () => store.getSnapshot().knowledge);
  const schedule = useSyncExternalStore(store.subscribe, () => store.getSnapshot().schedule);
  const habits = useSyncExternalStore(store.subscribe, () => store.getSnapshot().habits);
  const workouts = useSyncExternalStore(store.subscribe, () => store.getSnapshot().workouts);
  const thoughts = useSyncExternalStore(store.subscribe, () => store.getSnapshot().thoughts);

  return { journal, knowledge, schedule, habits, workouts, thoughts, dispatch };
}
