import { useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react';
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

  const getTransactions = useCallback(() => store.getSnapshot().transactions, [store]);
  const getReminders = useCallback(() => store.getSnapshot().reminders, [store]);

  const transactions = useSyncExternalStore(store.subscribe, getTransactions);
  const reminders = useSyncExternalStore(store.subscribe, getReminders);

  return { transactions, reminders, dispatch };
}
