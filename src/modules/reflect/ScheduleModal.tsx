import { useState, type FormEvent } from 'react';
import { type ScheduleBlock } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO, formatDuration } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

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
  defaultDate,
}: ScheduleModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(block?.title || '');
  const [dateISO, setDateISO] = useState(
    block?.dateISO ? block.dateISO.slice(0, 10) : defaultDate || todayISO()
  );
  const [startTime, setStartTime] = useState(block?.startTime || defaultStartTime);
  const [durationMin, setDurationMin] = useState(block?.durationMin || defaultDuration);
  const [type, setType] = useState<ScheduleBlock['type']>(block?.type || 'work');
  const [isCompleted, setIsCompleted] = useState(block?.isCompleted || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('reflect.schedule.error_title'));
      return;
    }
    if (!startTime.trim()) {
      setError(t('reflect.schedule.error_time'));
      return;
    }
    if (durationMin <= 0 || isNaN(durationMin)) {
      setError(t('reflect.schedule.error_duration'));
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
      title={
        block ? t('reflect.schedule.modal_edit_title') : t('reflect.schedule.modal_create_title')
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <FormField label={t('reflect.schedule.field_title')} required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('reflect.schedule.placeholder_title')}
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label={t('reflect.schedule.field_date')}>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('reflect.schedule.field_type')}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ScheduleBlock['type'])}
              style={{ width: '100%' }}
            >
              <option value="work">{t('reflect.schedule.type_work')}</option>
              <option value="personal">{t('reflect.schedule.type_personal')}</option>
              <option value="health">{t('reflect.schedule.type_health')}</option>
              <option value="social">{t('reflect.schedule.type_social')}</option>
              <option value="learning">{t('reflect.schedule.type_learning')}</option>
              <option value="rest">{t('reflect.schedule.type_rest')}</option>
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label={t('reflect.schedule.field_start_time')} required>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('reflect.schedule.field_duration')} required>
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '0.8rem' }}>
            {t('reflect.schedule.total_time')} <strong>{formatDuration(durationMin)}</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              id="schedule-completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            <label
              htmlFor="schedule-completed"
              style={{ fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              {t('reflect.schedule.completed')}
            </label>
          </div>
        </div>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {block ? t('reflect.schedule.action_save') : t('reflect.schedule.action_create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
