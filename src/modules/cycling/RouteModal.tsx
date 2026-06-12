import { useState, type FormEvent } from 'react';
import { type CycleRoute } from '../../types';
import { Modal, FormField } from '../../ui';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: CycleRoute | null;
  onSave: (routeData: Partial<CycleRoute>) => void;
}

export default function RouteModal({ isOpen, onClose, route, onSave }: RouteModalProps) {
  const [name, setName] = useState(route?.name || '');
  const [distanceKm, setDistanceKm] = useState(route?.distanceKm || 0);
  const [elevationGainM, setElevationGainM] = useState(route?.elevationGainM || 0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>(route?.difficulty || 'medium');
  const [waypointsText, setWaypointsText] = useState(route?.waypoints ? route.waypoints.join(', ') : '');
  const [isCompleted, setIsCompleted] = useState(route?.isCompleted || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Название маршрута обязательно');
      return;
    }
    if (distanceKm <= 0 || isNaN(distanceKm)) {
      setError('Дистанция маршрута должна быть больше нуля');
      return;
    }

    onSave({
      name: name.trim(),
      distanceKm,
      elevationGainM,
      difficulty,
      waypoints: waypointsText.split(',').map((w) => w.trim()).filter(Boolean),
      isCompleted,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={route ? 'Редактировать маршрут' : 'Создать маршрут'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <FormField label="Название маршрута" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Крылатское кольцо"
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label="Дистанция (км)" required>
            <input
              type="number"
              step="0.1"
              min="0"
              value={distanceKm || ''}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Набор высоты (м)">
            <input
              type="number"
              min="0"
              value={elevationGainM || ''}
              onChange={(e) => setElevationGainM(parseInt(e.target.value) || 0)}
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Сложность">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as CycleRoute['difficulty'])}
              style={{ width: '100%' }}
            >
              <option value="easy">Легкий (Плоский/Прогулочный)</option>
              <option value="medium">Средний (Смешанный рельеф)</option>
              <option value="hard">Сложный (Высокая нагрузка)</option>
              <option value="extreme">Экстремальный (Перевал/Горы)</option>
            </select>
          </FormField>

          <FormField label="Маршрут пройден хотя бы раз?">
            <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '8px' }}>
              <input
                type="checkbox"
                id="route-completed"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
              />
              <label htmlFor="route-completed" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Пройден</label>
            </div>
          </FormField>
        </div>

        <FormField label="Ключевые точки / Населенные пункты">
          <input
            type="text"
            value={waypointsText}
            onChange={(e) => setWaypointsText(e.target.value)}
            placeholder="Точка А, Точка Б, Точка В..."
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            Перечислите контрольные точки через запятую.
          </span>
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {route ? 'Сохранить изменения' : 'Создать маршрут'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
