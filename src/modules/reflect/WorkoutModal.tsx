import { useState, type FormEvent } from 'react';
import { type WorkoutRecord } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutRecord | null;
  onSave: (workoutData: Partial<WorkoutRecord>) => void;
}

export default function WorkoutModal({ isOpen, onClose, workout, onSave }: WorkoutModalProps) {
  const { t } = useI18n();
  const [type, setType] = useState<WorkoutRecord['type']>(workout?.type || 'gym');
  const [dateISO, setDateISO] = useState(workout?.dateISO ? workout.dateISO.slice(0, 10) : todayISO());
  const [durationMin, setDurationMin] = useState<number>(workout?.durationMin || 45);
  const [intensity, setIntensity] = useState<WorkoutRecord['intensity']>(workout?.intensity || 3);
  const [calories, setCalories] = useState<string>(workout?.calories !== undefined && workout.calories !== null ? String(workout.calories) : '');
  const [description, setDescription] = useState(workout?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (durationMin <= 0) {
      setError(t('reflect.workout.error_duration'));
      return;
    }

    const calsNum = calories.trim() === '' ? null : Number(calories);
    if (calsNum !== null && (isNaN(calsNum) || calsNum < 0)) {
      setError(t('reflect.workout.error_calories'));
      return;
    }

    onSave({
      type,
      dateISO,
      durationMin: Number(durationMin),
      intensity,
      calories: calsNum,
      description: description.trim()
    });
  };

  const getIntensityLabel = (val: number) => {
    switch (val) {
      case 1: return t('reflect.workout.intensity_1');
      case 2: return t('reflect.workout.intensity_2');
      case 3: return t('reflect.workout.intensity_3');
      case 4: return t('reflect.workout.intensity_4');
      case 5: return t('reflect.workout.intensity_5');
      default: return String(val);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workout ? t('reflect.workout.modal_edit_title') : t('reflect.workout.modal_create_title')}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && (
          <div className="text-error-bold">
            {error}
          </div>
        )}

        <div className="form-row">
          <FormField label={t('reflect.workout.field_type')} required>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WorkoutRecord['type'])}
              required
              style={{ width: '100%' }}
            >
              <option value="gym">{t('reflect.workout.type_gym')}</option>
              <option value="running">{t('reflect.workout.type_running')}</option>
              <option value="swimming">{t('reflect.workout.type_swimming')}</option>
              <option value="yoga">{t('reflect.workout.type_yoga')}</option>
              <option value="walking">{t('reflect.workout.type_walking')}</option>
              <option value="other">{t('reflect.workout.type_other')}</option>
            </select>
          </FormField>

          <FormField label={t('reflect.workout.field_date')} required>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label={t('reflect.workout.field_duration')} required>
            <input
              type="number"
              min="1"
              max="1440"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('reflect.workout.field_calories')}>
            <input
              type="number"
              min="0"
              placeholder={t('reflect.workout.placeholder_optional')}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label={t('reflect.workout.field_intensity')} required>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value) as WorkoutRecord['intensity'])}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>{t('reflect.workout.intensity_easy')}</span>
              <strong style={{ color: 'var(--text-primary)' }}>{getIntensityLabel(intensity)}</strong>
              <span>{t('reflect.workout.intensity_max')}</span>
            </div>
          </div>
        </FormField>

        <FormField label={t('reflect.workout.field_description')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('reflect.workout.placeholder_description')}
            style={{ width: '100%', height: '80px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {workout ? t('reflect.workout.action_save') : t('reflect.workout.action_create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
