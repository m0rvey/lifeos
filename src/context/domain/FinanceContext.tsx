import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useData } from '../DataContext';

function useFinanceData() {
  const { data, dispatch } = useData();
  const transactions = useMemo(() => data.transactions, [data.transactions]);
  const reminders = useMemo(() => data.reminders, [data.reminders]);
  return { transactions, reminders, dispatch };
}

const FinanceContext = createContext<ReturnType<typeof useFinanceData> | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const value = useFinanceData();
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
