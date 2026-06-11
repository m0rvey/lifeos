export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  dateISO: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDateISO: string; // YYYY-MM-DD
  isPaid: boolean;
  category: string;
  remindDaysBefore: number; // за сколько дней напомнить
  createdAt: string;
  updatedAt: string;
}
