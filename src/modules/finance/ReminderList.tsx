import React, { useState, useCallback } from 'react';
import { type BillReminder } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Plus, Bell, CheckSquare, Square, Trash2, Calendar } from 'lucide-react';
import { formatDate, formatCurrency, uid, nowISO, todayISO } from '../../cognitive/helpers';
import { Modal, FormField, ConfirmDialog } from '../../ui';

export default function ReminderList() {
  const { data, dispatch } = useData();
  const reminders = data.reminders;
  const { addToast } = useApp();
  const nowMs = new Date().getTime();

  const [isOpen, setIsOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDateISO, setDueDateISO] = useState(todayISO());
  const [category, setCategory] = useState('Аренда');
  const [remindDaysBefore, setRemindDaysBefore] = useState(3);
  const [error, setError] = useState('');

  const handleMarkAsPaid = useCallback((reminder: BillReminder) => {
    dispatch({
      type: 'UPDATE_ENTITY',
      entity: 'reminders',
      id: reminder.id,
      payload: { isPaid: true }
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
        description: `Оплата счета: ${reminder.title}`,
        dateISO: todayISO(),
        createdAt: nowISO(),
        updatedAt: nowISO()
      }
    });

    addToast(`Оплата по счету "${reminder.title}" зафиксирована в расходах`, 'success');
  }, [dispatch, addToast]);

  const handleDelete = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'reminders',
      id
    });
    addToast('Напоминание о платеже удалено', 'warning');
  }, [dispatch, addToast]);

  const handleConfirmDelete = useCallback(() => {
    if (reminderToDelete) {
      handleDelete(reminderToDelete);
      setReminderToDelete(null);
    }
  }, [reminderToDelete, handleDelete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Укажите название счета');
      return;
    }
    if (amount <= 0) {
      setError('Сумма должна быть больше нуля');
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
      updatedAt: nowISO()
    };

    dispatch({
      type: 'ADD_ENTITY',
      entity: 'reminders',
      payload: newReminder
    });

    setIsOpen(false);
    setTitle('');
    setAmount(0);
    setDueDateISO(todayISO());
    setCategory('Аренда');
    setRemindDaysBefore(3);
    addToast('Платеж успешно запланирован', 'success');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bell size={14} />
          <span>Предстоящие счета</span>
        </h4>
        <button
          className="btn btn--secondary"
          style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => setIsOpen(true)}
        >
          <Plus size={12} />
          <span>Запланировать</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
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
                background: rem.isPaid ? 'rgba(255,255,255,0.01)' : isOverdue ? 'rgba(239, 68, 68, 0.03)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'var(--border)'}`,
                borderRadius: '8px',
                opacity: rem.isPaid ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
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
                    padding: 0
                  }}
                  aria-label={rem.isPaid ? 'Оплачено' : `Отметить как оплачено: ${rem.title}`}
                >
                  {rem.isPaid ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', textDecoration: rem.isPaid ? 'line-through' : 'none', color: isOverdue ? 'var(--error, #ef4444)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rem.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={10} />
                    {formatDate(rem.dueDateISO)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: isOverdue ? 'var(--error, #ef4444)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {formatCurrency(rem.amount)}
                </strong>
                <button
                  onClick={() => setReminderToDelete(rem.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}
                  aria-label={`Удалить напоминание: ${rem.title}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {reminders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Нет запланированных счетов.
          </div>
        )}
      </div>

        {isOpen && (
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Запланировать платеж" maxWidth="sm">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>{error}</div>}

              <FormField label="Название платежа / Назначение" htmlFor="rem-title" required>
                <input
                  id="rem-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Интернет, Коммунальные услуги"
                  required
                  style={{ width: '100%' }}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Сумма платежа (₽)" htmlFor="rem-amount" required>
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

                <FormField label="Дата оплаты" htmlFor="rem-dueDate" required>
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
                <FormField label="Категория" htmlFor="rem-category">
                  <select id="rem-category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
                    <option value="Аренда">Аренда / ЖКХ</option>
                    <option value="Связь">Интернет / Телефон</option>
                    <option value="Подписки">Подписки / Сервисы</option>
                    <option value="Кредиты">Кредиты / Долги</option>
                    <option value="Другое">Другое</option>
                  </select>
                </FormField>

                <FormField label="Напомнить за (дней)" htmlFor="rem-days">
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

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
                <button type="button" className="btn btn--secondary" onClick={() => setIsOpen(false)}>Отмена</button>
                <button type="submit" className="btn btn--primary">Сохранить</button>
              </div>
            </form>
          </Modal>
        )}

        {reminderToDelete !== null && (
          <ConfirmDialog
            isOpen={reminderToDelete !== null}
            onConfirm={handleConfirmDelete}
            onCancel={() => setReminderToDelete(null)}
            title="Удалить счет?"
            message="Вы действительно хотите удалить это напоминание о платеже? Это действие необратимо."
            variant="danger"
          />
        )}
    </div>
  );
}
