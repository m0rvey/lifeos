import { useState, type FormEvent } from 'react';
import { type CycleRoute } from '../../types';
import { Modal, FormField } from '../../ui';
import { useI18n } from '../../i18n';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: CycleRoute | null;
  onSave: (routeData: Partial<CycleRoute>) => void;
}

export default function RouteModal({ isOpen, onClose, route, onSave }: RouteModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState(route?.name || '');
  const [distanceKm, setDistanceKm] = useState(route?.distanceKm || 0);
  const [elevationGainM, setElevationGainM] = useState(route?.elevationGainM || 0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>(
    route?.difficulty || 'medium'
  );
  const [waypointsText, setWaypointsText] = useState(
    route?.waypoints ? route.waypoints.join(', ') : ''
  );
  const [isCompleted, setIsCompleted] = useState(route?.isCompleted || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('cycling.routes.errorName'));
      return;
    }
    if (distanceKm <= 0 || isNaN(distanceKm)) {
      setError(t('cycling.routes.errorDistance'));
      return;
    }

    onSave({
      name: name.trim(),
      distanceKm,
      elevationGainM,
      difficulty,
      waypoints: waypointsText
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean),
      isCompleted,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={route ? t('cycling.routes.modalEditTitle') : t('cycling.routes.modalCreateTitle')}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <FormField label={t('cycling.routes.fieldName')} required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('cycling.routes.namePlaceholder')}
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label={t('cycling.rides.fieldDistance')} required>
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

          <FormField label={t('cycling.rides.fieldElevation')}>
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
          <FormField label={t('cycling.routes.fieldDifficulty')}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as CycleRoute['difficulty'])}
              style={{ width: '100%' }}
            >
              <option value="easy">
                {t('cycling.routes.difficulty.easy')} ({t('cycling.routes.difficulty.easyDesc')})
              </option>
              <option value="medium">
                {t('cycling.routes.difficulty.medium')} ({t('cycling.routes.difficulty.mediumDesc')}
                )
              </option>
              <option value="hard">
                {t('cycling.routes.difficulty.hard')} ({t('cycling.routes.difficulty.hardDesc')})
              </option>
              <option value="extreme">
                {t('cycling.routes.difficulty.extreme')} (
                {t('cycling.routes.difficulty.extremeDesc')})
              </option>
            </select>
          </FormField>

          <FormField label={t('cycling.routes.fieldCompleted')}>
            <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '10px' }}>
              <label className="switch-toggle" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  id="route-completed"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
              <label
                htmlFor="route-completed"
                style={{
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {t('cycling.routes.completed')}
              </label>
            </div>
          </FormField>
        </div>

        <FormField label={t('cycling.routes.fieldWaypoints')}>
          <input
            type="text"
            value={waypointsText}
            onChange={(e) => setWaypointsText(e.target.value)}
            placeholder={t('cycling.routes.waypointsPlaceholder')}
            style={{ width: '100%' }}
          />
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {t('cycling.routes.waypointsHint')}
          </span>
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {route ? t('cycling.rides.saveChanges') : t('cycling.routes.createRoute')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
