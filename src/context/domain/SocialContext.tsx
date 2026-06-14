import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useData } from '../DataContext';

function usePeopleData() {
  const { data, dispatch } = useData();
  const people = useMemo(() => data.people, [data.people]);
  return { people, dispatch };
}

const SocialContext = createContext<ReturnType<typeof usePeopleData> | null>(null);

export function SocialProvider({ children }: { children: ReactNode }) {
  const value = usePeopleData();
  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used within SocialProvider');
  return ctx;
}
