import { useSyncExternalStore, useCallback, type ReactNode } from 'react';
import { useDataStore, useDispatch } from '../DataContext';

export function FinanceProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useFinance() {
  const dispatch = useDispatch();

  const store = useDataStore();

  const getTransactions = useCallback(() => store.getSnapshot().transactions, [store]);
  const getReminders = useCallback(() => store.getSnapshot().reminders, [store]);

  const transactions = useSyncExternalStore(store.subscribe, getTransactions);
  const reminders = useSyncExternalStore(store.subscribe, getReminders);

  return { transactions, reminders, dispatch };
}
