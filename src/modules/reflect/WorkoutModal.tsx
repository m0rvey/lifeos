import { useState, type FormEvent } from 'react';
import { type WorkoutRecord } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutRecord | null;
  onSave: (workoutData: Partial<WorkoutRecord>) => void;
}

export default function WorkoutModal({ isOpen, onClose, workout, onSave }: WorkoutModalProps) {
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
      setError('Продолжительность тренировки должна быть больше 0 минут');
      return;
    }

    const calsNum = calories.trim() === '' ? null : Number(calories);
    if (calsNum !== null && (isNaN(calsNum) || calsNum < 0)) {
      setError('Количество калорий должно быть положительным числом');
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
      case 1: return '1 — Очень легко';
      case 2: return '2 — Легко';
      case 3: return '3 — Умеренно';
      case 4: return '4 — Тяжело';
      case 5: return '5 — Максимально';
      default: return String(val);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workout ? 'Редактировать тренировку' : 'Добавить тренировку'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <div className="form-row">
          <FormField label="Вид активности" required>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WorkoutRecord['type'])}
              required
              style={{ width: '100%' }}
            >
              <option value="gym">Силовая тренировка</option>
              <option value="running">Бег</option>
              <option value="swimming">Плавание</option>
              <option value="yoga">Йога</option>
              <option value="walking">Ходьба</option>
              <option value="other">Другое</option>
            </select>
          </FormField>

          <FormField label="Дата тренировки" required>
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
          <FormField label="Длительность (мин)" required>
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

          <FormField label="Калории (ккал)">
            <input
              type="number"
              min="0"
              placeholder="Необязательно"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label="Интенсивность" required>
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
              <span>Легко</span>
              <strong style={{ color: 'var(--text-primary)' }}>{getIntensityLabel(intensity)}</strong>
              <span>Максимум</span>
            </div>
          </div>
        </FormField>

        <FormField label="Описание / Упражнения">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Жим лежа, приседания... или маршрут бега"
            style={{ width: '100%', height: '80px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {workout ? 'Сохранить изменения' : 'Добавить тренировку'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
