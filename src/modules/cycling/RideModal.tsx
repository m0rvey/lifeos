import { useState, type FormEvent } from 'react';
import { type RideRecord, type CycleRoute } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO, calcAvgSpeed } from '../../cognitive/helpers';

interface RideModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideRecord | null;
  routes: CycleRoute[];
  onSave: (rideData: Partial<RideRecord>) => void;
}

export default function RideModal({ isOpen, onClose, ride, routes, onSave }: RideModalProps) {
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
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (distanceKm <= 0 || isNaN(distanceKm)) {
      setError('Дистанция должна быть больше нуля');
      return;
    }
    if (durationMin <= 0 || isNaN(durationMin)) {
      setError('Продолжительность должна быть больше нуля');
      return;
    }

    const calculatedAvgSpeed = calcAvgSpeed(distanceKm, durationMin);

    onSave({
      title: title.trim() || 'Велотренировка',
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
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ride ? 'Редактировать заезд' : 'Записать велотренировку'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && (
          <div className="text-error-bold">
            {error}
          </div>
        )}

        <div className="form-row">
          <FormField label="Название заезда / Маршрут" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Утреннее шоссе"
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Дата тренировки">
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

          <FormField label="Время (мин)" required>
            <input
              type="number"
              min="0"
              value={durationMin || ''}
              onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Макс. скорость (км/ч)">
            <input
              type="number"
              step="0.1"
              min="0"
              value={maxSpeedKmh || ''}
              onChange={(e) => setMaxSpeedKmh(parseFloat(e.target.value) || 0)}
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

        <div className="form-row-3">
          <FormField label="Средняя мощность (Вт)">
            <input
              type="number"
              min="0"
              value={avgPowerW}
              onChange={(e) => setAvgPowerW(e.target.value === '' ? '' : parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Средний пульс (уд/мин)">
            <input
              type="number"
              min="0"
              value={avgHrBpm}
              onChange={(e) => setAvgHrBpm(e.target.value === '' ? '' : parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Пройденный маршрут">
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Без привязки к маршруту</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.distanceKm} км)</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Описание заезда / Ощущения">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите погоду, самочувствие или техническое состояние..."
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {ride ? 'Сохранить изменения' : 'Добавить заезд'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
