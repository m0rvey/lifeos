import { useContext, useSyncExternalStore, type ReactNode } from 'react';
import { useDataStore, DataDispatchContext } from '../DataContext';

export function SocialProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useSocial() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error('useSocial must be used within DataProvider');
  }

  const store = useDataStore();

  const people = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().people
  );

  return { people, dispatch };
}
