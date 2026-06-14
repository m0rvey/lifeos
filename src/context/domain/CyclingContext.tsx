import { useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react';
import { useDataStore, DataDispatchContext } from '../DataContext';

export function CyclingProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useCycling() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error('useCycling must be used within DataProvider');
  }

  const store = useDataStore();

  const getRides = useCallback(() => store.getSnapshot().rides, [store]);
  const getRoutes = useCallback(() => store.getSnapshot().routes, [store]);
  const getMaintenance = useCallback(() => store.getSnapshot().maintenance, [store]);
  const getGalleryNotes = useCallback(() => store.getSnapshot().galleryNotes, [store]);

  const rides = useSyncExternalStore(store.subscribe, getRides);
  const routes = useSyncExternalStore(store.subscribe, getRoutes);
  const maintenance = useSyncExternalStore(store.subscribe, getMaintenance);
  const galleryNotes = useSyncExternalStore(store.subscribe, getGalleryNotes);

  return { rides, routes, maintenance, galleryNotes, dispatch };
}
