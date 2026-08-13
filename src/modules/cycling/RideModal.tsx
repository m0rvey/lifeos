import { useState, type FormEvent } from 'react';
import { type RideRecord, type CycleRoute } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO, calcAvgSpeed } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

interface RideModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideRecord | null;
  routes: CycleRoute[];
  onSave: (rideData: Partial<RideRecord>) => void;
}

export default function RideModal({ isOpen, onClose, ride, routes, onSave }: RideModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(ride?.title || '');
  const [dateISO, setDateISO] = useState(ride?.dateISO ? ride.dateISO.slice(0, 10) : todayISO());
  const [distanceKm, setDistanceKm] = useState(ride?.distanceKm || 0);
  const [durationMin, setDurationMin] = useState(ride?.durationMin || 0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(ride?.maxSpeedKmh || 0);
  const [elevationGainM, setElevationGainM] = useState(ride?.elevationGainM || 0);
  const [avgPowerW, setAvgPowerW] = useState<number | ''>(ride?.avgPowerW ?? '');
  const [avgHrBpm, setAvgHrBpm] = useState<number | ''>(ride?.avgHrBpm ?? '');
  const [description, setDescription] = useState(ride?.description || '');
  const [routeId, setRouteId] = useState<string | ''>(ride?.routeId || '');
  const [bikeName, setBikeName] = useState(ride?.bikeName || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (distanceKm <= 0 || isNaN(distanceKm)) {
      setError(t('cycling.rides.errorDistance'));
      return;
    }
    if (durationMin <= 0 || isNaN(durationMin)) {
      setError(t('cycling.rides.errorDuration'));
      return;
    }

    const calculatedAvgSpeed = calcAvgSpeed(distanceKm, durationMin);

    onSave({
      title: title.trim() || t('cycling.rides.defaultTitle'),
      dateISO,
      distanceKm,
      durationMin,
      avgSpeedKmh: calculatedAvgSpeed,
      maxSpeedKmh: maxSpeedKmh || calculatedAvgSpeed,
      elevationGainM,
      avgPowerW: avgPowerW === '' ? null : Number(avgPowerW),
      avgHrBpm: avgHrBpm === '' ? null : Number(avgHrBpm),
      description: description.trim(),
      routeId: routeId === '' ? null : routeId,
      bikeName: bikeName.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ride ? t('cycling.rides.modalEditTitle') : t('cycling.rides.modalCreateTitle')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <div className="form-row">
          <FormField label={t('cycling.rides.fieldTitle')} required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('cycling.rides.titlePlaceholder')}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('cycling.rides.fieldDate')}>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div className="form-row-4">
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

          <FormField label={t('cycling.rides.fieldDuration')} required>
            <input
              type="number"
              min="0"
              value={durationMin || ''}
              onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('cycling.rides.fieldMaxSpeed')}>
            <input
              type="number"
              step="0.1"
              min="0"
              value={maxSpeedKmh || ''}
              onChange={(e) => setMaxSpeedKmh(parseFloat(e.target.value) || 0)}
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

        <div className="form-row-2">
          <FormField label={t('cycling.rides.fieldPower')}>
            <input
              type="number"
              min="0"
              value={avgPowerW}
              onChange={(e) => setAvgPowerW(e.target.value === '' ? '' : parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('cycling.rides.fieldHr')}>
            <input
              type="number"
              min="0"
              value={avgHrBpm}
              onChange={(e) => setAvgHrBpm(e.target.value === '' ? '' : parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div className="form-row-2">
          <FormField label={t('cycling.bike.label')}>
            <input
              type="text"
              list="bike-suggestions"
              value={bikeName}
              onChange={(e) => setBikeName(e.target.value)}
              placeholder={t('cycling.bike.custom_placeholder')}
              style={{ width: '100%' }}
            />
            <datalist id="bike-suggestions">
              <option value={t('cycling.bike.road')} />
              <option value={t('cycling.bike.gravel')} />
              <option value={t('cycling.bike.mtb')} />
              <option value={t('cycling.bike.commuter')} />
            </datalist>
          </FormField>

          <FormField label={t('cycling.rides.fieldRoute')}>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">{t('cycling.rides.noRoute')}</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.distanceKm} {t('cycling.common.km')})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label={t('cycling.rides.fieldDescription')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('cycling.rides.descriptionPlaceholder')}
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {ride ? t('cycling.rides.saveChanges') : t('cycling.rides.addRide')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
