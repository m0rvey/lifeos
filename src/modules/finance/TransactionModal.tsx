import { useState, type FormEvent } from 'react';
import { type Transaction } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (txData: Partial<Transaction>) => void;
}

export default function TransactionModal({
  isOpen,
  onClose,
  transaction,
  onSave,
}: TransactionModalProps) {
  const { t } = useI18n();
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount ?? 0);
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [dateISO, setDateISO] = useState(
    transaction?.dateISO ? transaction.dateISO.slice(0, 10) : todayISO()
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0 || isNaN(amount)) {
      setError(t('error.amount.positive'));
      return;
    }

    if (!category.trim()) {
      setError(t('error.category.required'));
      return;
    }

    onSave({
      type,
      amount,
      category: category.trim(),
      description: description.trim(),
      dateISO,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? t('finance.modal.title.edit') : t('finance.modal.title.new')}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <FormField label={t('finance.field.type')}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            style={{ width: '100%' }}
          >
            <option value="expense">{t('finance.type.expense')}</option>
            <option value="income">{t('finance.type.income')}</option>
          </select>
        </FormField>

        <div className="form-row">
          <FormField label={t('finance.field.amount')} required>
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

          <FormField label={t('finance.field.date')}>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label={t('finance.field.category')} required>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t('finance.category.placeholder')}
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <FormField label={t('finance.field.description')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('finance.description.placeholder')}
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {transaction ? t('finance.save.changes') : t('finance.confirm.record')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
