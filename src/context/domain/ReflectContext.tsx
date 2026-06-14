import { useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react';
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

  const getJournal = useCallback(() => store.getSnapshot().journal, [store]);
  const getKnowledge = useCallback(() => store.getSnapshot().knowledge, [store]);
  const getSchedule = useCallback(() => store.getSnapshot().schedule, [store]);
  const getHabits = useCallback(() => store.getSnapshot().habits, [store]);
  const getWorkouts = useCallback(() => store.getSnapshot().workouts, [store]);
  const getThoughts = useCallback(() => store.getSnapshot().thoughts, [store]);

  const journal = useSyncExternalStore(store.subscribe, getJournal);
  const knowledge = useSyncExternalStore(store.subscribe, getKnowledge);
  const schedule = useSyncExternalStore(store.subscribe, getSchedule);
  const habits = useSyncExternalStore(store.subscribe, getHabits);
  const workouts = useSyncExternalStore(store.subscribe, getWorkouts);
  const thoughts = useSyncExternalStore(store.subscribe, getThoughts);

  return { journal, knowledge, schedule, habits, workouts, thoughts, dispatch };
}
