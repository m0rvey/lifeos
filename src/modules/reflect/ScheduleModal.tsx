import { useState, type FormEvent } from 'react';
import { type ScheduleBlock } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO, formatDuration } from '../../cognitive/helpers';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: ScheduleBlock | null;
  onSave: (blockData: Partial<ScheduleBlock>) => void;
  defaultStartTime?: string;
  defaultDuration?: number;
  defaultDate?: string;
}

export default function ScheduleModal({ 
  isOpen, 
  onClose, 
  block, 
  onSave, 
  defaultStartTime = '09:00',
  defaultDuration = 60,
  defaultDate
}: ScheduleModalProps) {
  const [title, setTitle] = useState(block?.title || '');
  const [dateISO, setDateISO] = useState(block?.dateISO ? block.dateISO.slice(0, 10) : (defaultDate || todayISO()));
  const [startTime, setStartTime] = useState(block?.startTime || defaultStartTime);
  const [durationMin, setDurationMin] = useState(block?.durationMin || defaultDuration);
  const [type, setType] = useState<ScheduleBlock['type']>(block?.type || 'work');
  const [isCompleted, setIsCompleted] = useState(block?.isCompleted || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Укажите название события');
      return;
    }
    if (!startTime.trim()) {
      setError('Укажите время начала');
      return;
    }
    if (durationMin <= 0 || isNaN(durationMin)) {
      setError('Длительность должна быть больше нуля');
      return;
    }

    onSave({
      title: title.trim(),
      dateISO,
      startTime,
      durationMin,
      type,
      isCompleted,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={block ? 'Редактировать временной блок' : 'Добавить событие в расписание'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <FormField label="Событие / Название" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Стендап команды, Пробежка"
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label="Дата проведения">
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Тип активности">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ScheduleBlock['type'])}
              style={{ width: '100%' }}
            >
              <option value="work">Работа / Обучение</option>
              <option value="personal">Личное / Быт</option>
              <option value="health">Здоровье / Спорт</option>
              <option value="social">Социальное / Общение</option>
              <option value="learning">Чтение / Развитие</option>
              <option value="rest">Отдых / Сон</option>
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Время начала (ЧЧ:ММ)" required>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Длительность (минут)" required>
            <input
              type="number"
              min="5"
              step="5"
              value={durationMin}
              onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
              required
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.8rem' }}>Итоговое время: <strong>{formatDuration(durationMin)}</strong></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              id="schedule-completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            <label htmlFor="schedule-completed" style={{ fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Выполнено</label>
          </div>
        </div>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {block ? 'Сохранить изменения' : 'Добавить блок'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
