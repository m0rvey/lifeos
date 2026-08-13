import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { type RideRecord } from '../../types';
import {
  Plus,
  Bike,
  Route,
  Gauge,
  TrendingUp,
  Mountain,
  Clock,
  Award,
  Edit2,
  Trash2,
} from 'lucide-react';
import { EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, formatDistance, formatDuration, uid, nowISO } from '../../cognitive/helpers';
import { useRideStats } from '../../hooks/useRideStats';
import { useI18n } from '../../i18n';
import RideModal from './RideModal';

import { useCrudModal } from '../../hooks/useCrudModal';

export default function RidesPage() {
  const { t } = useI18n();
  const { data } = useData();

  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const [selectedBike, setSelectedBike] = useState<string>('ALL');

  const {
    isOpen,
    editingItem: editingRide,
    isDeleteOpen,
    openAdd: handleAddNew,
    openEdit: handleEdit,
    openDelete: setRideToDelete,
    handleSave: handleSaveRide,
    confirmDelete: handleConfirmDelete,
    closeAll,
  } = useCrudModal<RideRecord>({
    entity: 'rides',
    toastKeys: {
      created: 'cycling.rides.toastCreated',
      updated: 'cycling.rides.toastEdited',
      deleted: 'cycling.rides.toastDeleted',
    },
    createDefaults: (rideData) => ({
      id: `ride_${uid()}`,
      dateISO: rideData?.dateISO || new Date().toISOString(),
      title: rideData?.title || t('cycling.rides.defaultTitle'),
      distanceKm: rideData?.distanceKm || 0,
      durationMin: rideData?.durationMin || 0,
      avgSpeedKmh: rideData?.avgSpeedKmh || 0,
      maxSpeedKmh: rideData?.maxSpeedKmh || 0,
      elevationGainM: rideData?.elevationGainM || 0,
      avgPowerW: rideData?.avgPowerW ?? null,
      avgHrBpm: rideData?.avgHrBpm ?? null,
      description: rideData?.description || '',
      routeId: rideData?.routeId || null,
      bikeName: rideData?.bikeName || null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }),
  });

  const uniqueBikes = useMemo(() => {
    const set = new Set<string>();
    data.rides.forEach((r) => {
      if (r.bikeName) set.add(r.bikeName);
    });
    return ['ALL', ...Array.from(set)];
  }, [data.rides]);

  const {
    totalDistance,
    totalDuration,
    avgSpeed: averageSpeed,
    maxSpeed: recordSpeed,
    totalElevation,
    maxDistance,
  } = useRideStats(data.rides);

  const filteredRides = useMemo(() => {
    let sorted = [...data.rides].sort(
      (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
    if (selectedBike !== 'ALL') {
      sorted = sorted.filter((r) => r.bikeName === selectedBike);
    }
    return filter === 'recent' ? sorted.slice(0, 5) : sorted;
  }, [data.rides, filter, selectedBike]);

  return (
    <div className="fade-in-entry cycling-page">
      {/* Overview Stat cards grid */}
      <div className="cycling-overview-grid">
        <div className="glass-panel cycling-stat-panel">
          <Route size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.distance')}</span>
            <strong className="cycling-stat-val">
              {totalDistance.toFixed(1)} {t('cycling.common.km')}
            </strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <Gauge size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.avg')}</span>
            <strong className="cycling-stat-val">
              {averageSpeed.toFixed(1)} {t('cycling.common.kmh')}
            </strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <TrendingUp size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.speedRecord')}</span>
            <strong className="cycling-stat-val">
              {recordSpeed.toFixed(1)} {t('cycling.common.kmh')}
            </strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <Mountain size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.dashboard.elevationGain')}</span>
            <strong className="cycling-stat-val">
              {totalElevation.toFixed(1)} {t('cycling.common.m')}
            </strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <Award size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.maxDistance')}</span>
            <strong className="cycling-stat-val">
              {maxDistance.toFixed(1)} {t('cycling.common.km')}
            </strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <Clock size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.totalTime')}</span>
            <strong className="cycling-stat-val">{formatDuration(totalDuration)}</strong>
          </div>
        </div>
      </div>

      {/* Roster Area */}
      <div className="glass-panel cycling-roster">
        <div className="cycling-roster-header">
          <h3 className="cycling-title-group">
            <Bike size={16} />
            <span>{t('cycling.rides.trainingJournal')}</span>
          </h3>

          <div className="cycling-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {uniqueBikes.length > 1 && (
              <select
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                style={{ height: '36px', padding: '0 28px 0 10px', fontSize: '0.8rem' }}
              >
                {uniqueBikes.map((b) => (
                  <option key={b} value={b}>
                    {b === 'ALL' ? t('cycling.bike.all') : b}
                  </option>
                ))}
              </select>
            )}
            <div className="filter-tabs" style={{ marginBottom: 0 }}>
              <button
                className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                {t('cycling.rides.filterAll', { count: data.rides.length })}
              </button>
              <button
                className={`tab-btn ${filter === 'recent' ? 'active' : ''}`}
                onClick={() => setFilter('recent')}
              >
                {t('cycling.rides.filterRecent')}
              </button>
            </div>
            <button className="btn btn--primary cycling-actions-btn" onClick={handleAddNew}>
              <Plus size={14} />
              <span>{t('cycling.rides.recordTraining')}</span>
            </button>
          </div>
        </div>

        {filteredRides.length > 0 ? (
          <div className="ride-cards-grid cycling-cards-grid">
            {filteredRides.map((ride) => (
              <div key={ride.id} className="glass-panel cycling-ride-card">
                <div className="cycling-ride-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bike size={14} style={{ color: 'var(--accent)' }} />
                    <span className="cycling-ride-card-date">{formatDate(ride.dateISO)}</span>
                  </div>
                  <div className="cycling-ride-card-actions">
                    <button
                      className="btn btn--secondary cycling-btn-sm-edit"
                      onClick={() => handleEdit(ride)}
                      title={t('action.edit')}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn btn--secondary cycling-btn-sm-delete"
                      onClick={() => setRideToDelete(ride.id)}
                      title={t('action.delete')}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ margin: '4px 0' }}>
                  <strong className="cycling-ride-card-title">{ride.title}</strong>
                  <div className="cycling-ride-card-dist">{formatDistance(ride.distanceKm)}</div>
                </div>

                <div className="cycling-ride-card-details">
                  <div>
                    <span>{t('cycling.rides.avg')}</span>
                    <strong>
                      {ride.avgSpeedKmh.toFixed(1)} {t('cycling.common.kmh')}
                    </strong>
                  </div>
                  <div>
                    <span>{t('cycling.rides.maximum')}</span>
                    <strong>
                      {ride.maxSpeedKmh.toFixed(1)} {t('cycling.common.kmh')}
                    </strong>
                  </div>
                  <div>
                    <span>{t('cycling.dashboard.elevationGain')}</span>
                    <strong>
                      {ride.elevationGainM.toFixed(1)} {t('cycling.common.m')}
                    </strong>
                  </div>
                  <div>
                    <span>{t('cycling.rides.time')}</span>
                    <strong>{formatDuration(ride.durationMin)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bike size={48} />}
            title={t('cycling.rides.emptyTitle')}
            description={t('cycling.rides.emptyDescription')}
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>{t('cycling.rides.recordTraining')}</span>
              </button>
            }
          />
        )}
      </div>

      {isOpen && (
        <RideModal
          isOpen={isOpen}
          ride={editingRide}
          routes={data.routes}
          onClose={closeAll}
          onSave={handleSaveRide}
        />
      )}

      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onConfirm={handleConfirmDelete}
          onCancel={closeAll}
          title={t('cycling.rides.deleteConfirmTitle')}
          message={t('cycling.rides.deleteConfirmMessage')}
          variant="danger"
        />
      )}
    </div>
  );
}
