import React, { useState } from 'react';
import { type Transaction } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (txData: Partial<Transaction>) => void;
}

export default function TransactionModal({ isOpen, onClose, transaction, onSave }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount ?? 0);
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [dateISO, setDateISO] = useState(transaction?.dateISO ? transaction.dateISO.slice(0, 10) : todayISO());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0 || isNaN(amount)) {
      setError('Сумма транзакции должна быть больше нуля');
      return;
    }

    if (!category.trim()) {
      setError('Укажите категорию транзакции');
      return;
    }

    onSave({
      type,
      amount,
      category: category.trim(),
      description: description.trim(),
      dateISO
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Редактировать транзакцию' : 'Зафиксировать финансовое событие'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <FormField label="Тип транзакции">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            style={{ width: '100%' }}
          >
            <option value="expense">Расход (Списание средств)</option>
            <option value="income">Доход (Пополнение баланса)</option>
          </select>
        </FormField>

        <div className="form-row">
          <FormField label="Сумма (₽)" required>
            <input
              type="number"
              min="0"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Дата транзакции">
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label="Категория" required>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Например: Продукты, Зарплата, Аренда"
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <FormField label="Комментарий / Описание">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Дополнительные примечания к транзакции..."
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {transaction ? 'Сохранить изменения' : 'Зафиксировать'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
