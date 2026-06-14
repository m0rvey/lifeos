import { useState, useCallback, type FormEvent } from 'react';
import { type BillReminder } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Plus, Bell, CheckSquare, Square, Trash2, Calendar } from 'lucide-react';
import { formatDate, formatCurrency, uid, nowISO, todayISO } from '../../cognitive/helpers';
import { Modal, FormField, ConfirmDialog } from '../../ui';
import { useI18n } from '../../i18n';

export default function ReminderList() {
  const { data, dispatch } = useData();
  const reminders = data.reminders;
  const { addToast } = useApp();
  const { t } = useI18n();
  const nowMs = new Date().getTime();

  const [isOpen, setIsOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDateISO, setDueDateISO] = useState(todayISO());
  const [category, setCategory] = useState('Rent');
  const [remindDaysBefore, setRemindDaysBefore] = useState(3);
  const [error, setError] = useState('');

  const handleMarkAsPaid = useCallback(
    (reminder: BillReminder) => {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'reminders',
        id: reminder.id,
        payload: { isPaid: true },
      });

      // Automatically post transaction
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'transactions',
        payload: {
          id: `tx_${uid()}`,
          type: 'expense',
          amount: reminder.amount,
          category: reminder.category,
          description: t('finance.reminder.paidDescription', { title: reminder.title }),
          dateISO: todayISO(),
          createdAt: nowISO(),
          updatedAt: nowISO(),
        },
      });

      addToast(t('finance.reminder.paidToast', { title: reminder.title }), 'success');
    },
    [dispatch, addToast, t]
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'reminders',
        id,
      });
      addToast(t('finance.reminder.deletedToast'), 'warning');
    },
    [dispatch, addToast, t]
  );

  const handleConfirmDelete = useCallback(() => {
    if (reminderToDelete) {
      handleDelete(reminderToDelete);
      setReminderToDelete(null);
    }
  }, [reminderToDelete, handleDelete]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('finance.reminder.error.titleRequired'));
      return;
    }
    if (amount <= 0) {
      setError(t('finance.reminder.error.amountPositive'));
      return;
    }

    const newReminder: BillReminder = {
      id: `rem_${uid()}`,
      title: title.trim(),
      amount,
      dueDateISO,
      isPaid: false,
      category,
      remindDaysBefore,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    dispatch({
      type: 'ADD_ENTITY',
      entity: 'reminders',
      payload: newReminder,
    });

    setIsOpen(false);
    setTitle('');
    setAmount(0);
    setDueDateISO(todayISO());
    setCategory('Rent');
    setRemindDaysBefore(3);
    addToast(t('finance.reminder.successToast'), 'success');
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    const dateA = new Date(a.dueDateISO || '2099-01-01').getTime();
    const dateB = new Date(b.dueDateISO || '2099-01-01').getTime();
    const timeA = isNaN(dateA) ? new Date('2099-01-01').getTime() : dateA;
    const timeB = isNaN(dateB) ? new Date('2099-01-01').getTime() : dateB;
    return timeA - timeB;
  });

  return (
    <div className="flex-col-12">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Bell size={14} />
          <span>{t('finance.reminder.upcomingBills')}</span>
        </h4>
        <button
          className="btn btn--secondary"
          style={{
            padding: '4px 8px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onClick={() => setIsOpen(true)}
        >
          <Plus size={12} />
          <span>{t('finance.reminder.schedule')}</span>
        </button>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '350px',
          overflowY: 'auto',
        }}
      >
        {sortedReminders.map((rem) => {
          const isOverdue = !rem.isPaid && new Date(rem.dueDateISO).getTime() < nowMs;
          return (
            <div
              key={rem.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: rem.isPaid
                  ? 'rgba(255,255,255,0.01)'
                  : isOverdue
                    ? 'rgba(239, 68, 68, 0.03)'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'var(--border)'}`,
                borderRadius: '8px',
                opacity: rem.isPaid ? 0.6 : 1,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}
              >
                <button
                  disabled={rem.isPaid}
                  onClick={() => handleMarkAsPaid(rem)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: rem.isPaid ? 'var(--success, #16a34a)' : 'var(--text-secondary)',
                    cursor: rem.isPaid ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  aria-label={
                    rem.isPaid
                      ? t('finance.reminder.paid')
                      : t('finance.reminder.markPaid', { title: rem.title })
                  }
                >
                  {rem.isPaid ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      textDecoration: rem.isPaid ? 'line-through' : 'none',
                      color: isOverdue ? 'var(--error, #ef4444)' : 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rem.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Calendar size={10} />
                    {formatDate(rem.dueDateISO)}
                  </span>
                </div>
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}
              >
                <strong
                  style={{
                    fontSize: '0.8rem',
                    color: isOverdue ? 'var(--error, #ef4444)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatCurrency(rem.amount)}
                </strong>
                <button
                  onClick={() => setReminderToDelete(rem.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  aria-label={t('finance.reminder.deleteReminder', { title: rem.title })}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {reminders.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 10px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}
          >
            {t('finance.reminder.noScheduledBills')}
          </div>
        )}
      </div>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={t('finance.reminder.modal.title')}
          maxWidth="sm"
        >
          <form onSubmit={handleSubmit} className="flex-col-16">
            {error && <div className="text-error-bold">{error}</div>}

            <FormField label={t('finance.reminder.field.title')} htmlFor="rem-title" required>
              <input
                id="rem-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('finance.reminder.field.titlePlaceholder')}
                required
                style={{ width: '100%' }}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label={t('finance.reminder.field.amount')} htmlFor="rem-amount" required>
                <input
                  id="rem-amount"
                  type="number"
                  min="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  required
                  style={{ width: '100%' }}
                />
              </FormField>

              <FormField label={t('finance.reminder.field.dueDate')} htmlFor="rem-dueDate" required>
                <input
                  id="rem-dueDate"
                  type="date"
                  value={dueDateISO}
                  onChange={(e) => setDueDateISO(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField label={t('finance.field.category')} htmlFor="rem-category">
                <select
                  id="rem-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Rent">{t('finance.reminder.category.rentUtilities')}</option>
                  <option value="Telecom">{t('finance.reminder.category.telecomPhone')}</option>
                  <option value="Subscriptions">
                    {t('finance.reminder.category.subscriptionsServices')}
                  </option>
                  <option value="Loans">{t('finance.reminder.category.loansDebts')}</option>
                  <option value="Other">{t('finance.reminder.category.other')}</option>
                </select>
              </FormField>

              <FormField label={t('finance.reminder.field.remindDays')} htmlFor="rem-days">
                <input
                  id="rem-days"
                  type="number"
                  min="0"
                  max="30"
                  value={remindDaysBefore}
                  onChange={(e) => setRemindDaysBefore(parseInt(e.target.value) || 0)}
                  style={{ width: '100%' }}
                />
              </FormField>
            </div>

            <div className="modal-form-footer">
              <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(false)}>
                {t('action.cancel')}
              </button>
              <button type="submit" className="btn btn--primary">
                {t('action.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {reminderToDelete !== null && (
        <ConfirmDialog
          isOpen={reminderToDelete !== null}
          onConfirm={handleConfirmDelete}
          onCancel={() => setReminderToDelete(null)}
          title={t('finance.reminder.confirm.deleteTitle')}
          message={t('finance.reminder.confirm.deleteMessage')}
          variant="danger"
        />
      )}
    </div>
  );
}
