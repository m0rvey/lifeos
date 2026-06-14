import { useSyncExternalStore, useCallback, type ReactNode } from 'react';
import { useDataStore, useDispatch } from '../DataContext';

export function SocialProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useSocial() {
  const dispatch = useDispatch();

  const store = useDataStore();

  const getPeople = useCallback(() => store.getSnapshot().people, [store]);
  const people = useSyncExternalStore(store.subscribe, getPeople);

  return { people, dispatch };
}
