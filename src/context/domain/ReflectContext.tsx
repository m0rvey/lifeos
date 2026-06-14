import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useData } from '../DataContext';

function useReflectData() {
  const { data, dispatch } = useData();
  const journal = useMemo(() => data.journal, [data.journal]);
  const knowledge = useMemo(() => data.knowledge, [data.knowledge]);
  const schedule = useMemo(() => data.schedule, [data.schedule]);
  const habits = useMemo(() => data.habits, [data.habits]);
  const workouts = useMemo(() => data.workouts, [data.workouts]);
  const thoughts = useMemo(() => data.thoughts, [data.thoughts]);
  return { journal, knowledge, schedule, habits, workouts, thoughts, dispatch };
}

const ReflectContext = createContext<ReturnType<typeof useReflectData> | null>(null);

export function ReflectProvider({ children }: { children: ReactNode }) {
  const value = useReflectData();
  return (
    <ReflectContext.Provider value={value}>
      {children}
    </ReflectContext.Provider>
  );
}

export function useReflect() {
  const ctx = useContext(ReflectContext);
  if (!ctx) throw new Error('useReflect must be used within ReflectProvider');
  return ctx;
}
