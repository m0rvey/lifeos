import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useData } from '../DataContext';

function useCyclingData() {
  const { data, dispatch } = useData();
  const rides = useMemo(() => data.rides, [data.rides]);
  const routes = useMemo(() => data.routes, [data.routes]);
  const maintenance = useMemo(() => data.maintenance, [data.maintenance]);
  const galleryNotes = useMemo(() => data.galleryNotes, [data.galleryNotes]);
  return { rides, routes, maintenance, galleryNotes, dispatch };
}

const CyclingContext = createContext<ReturnType<typeof useCyclingData> | null>(null);

export function CyclingProvider({ children }: { children: ReactNode }) {
  const value = useCyclingData();
  return (
    <CyclingContext.Provider value={value}>
      {children}
    </CyclingContext.Provider>
  );
}

export function useCycling() {
  const ctx = useContext(CyclingContext);
  if (!ctx) throw new Error('useCycling must be used within CyclingProvider');
  return ctx;
}
