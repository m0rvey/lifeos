import { useContext, useSyncExternalStore, type ReactNode } from 'react';
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

  const rides = useSyncExternalStore(store.subscribe, () => store.getSnapshot().rides);
  const routes = useSyncExternalStore(store.subscribe, () => store.getSnapshot().routes);
  const maintenance = useSyncExternalStore(store.subscribe, () => store.getSnapshot().maintenance);
  const galleryNotes = useSyncExternalStore(store.subscribe, () => store.getSnapshot().galleryNotes);

  return { rides, routes, maintenance, galleryNotes, dispatch };
}
