import { useContext, useSyncExternalStore, type ReactNode } from 'react';
import { useDataStore, DataDispatchContext } from '../DataContext';

export function FinanceProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useFinance() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error('useFinance must be used within DataProvider');
  }

  const store = useDataStore();

  const transactions = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().transactions
  );

  const reminders = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().reminders
  );

  return { transactions, reminders, dispatch };
}
