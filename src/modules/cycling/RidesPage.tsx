import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type RideRecord } from '../../types';
import { Plus, Bike, Route, Gauge, TrendingUp, Mountain, Clock, Award, Edit2, Trash2 } from 'lucide-react';
import { EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, formatDistance, formatDuration, uid, nowISO } from '../../cognitive/helpers';
import { useRideStats } from '../../hooks/useRideStats';
import { useI18n } from '../../i18n';
import RideModal from './RideModal';

export default function RidesPage() {
  const { t } = useI18n();
  const { data, dispatch } = useData();
  const { addToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<RideRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const [rideToDelete, setRideToDelete] = useState<string | null>(null);

  const { totalDistance, totalDuration, avgSpeed: averageSpeed, maxSpeed: recordSpeed, totalElevation, maxDistance } = useRideStats(data.rides);

  const filteredRides = useMemo(() => {
    const sorted = [...data.rides].sort(
      (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
    return filter === 'recent' ? sorted.slice(0, 5) : sorted;
  }, [data.rides, filter]);

  const handleAddNew = () => {
    setEditingRide(null);
    setIsOpen(true);
  };

  const handleEdit = (ride: RideRecord) => {
    setEditingRide(ride);
    setIsOpen(true);
  };

  const handleSaveRide = useCallback((rideData: Partial<RideRecord>) => {
    if (editingRide) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'rides',
        id: editingRide.id,
        payload: { ...rideData, updatedAt: nowISO() }
      });
      addToast(t('cycling.rides.toastEdited'), 'success');
    } else {
      const newRide: RideRecord = {
        id: `ride_${uid()}`,
        dateISO: rideData.dateISO || new Date().toISOString(),
        title: rideData.title || t('cycling.rides.defaultTitle'),
        distanceKm: rideData.distanceKm || 0,
        durationMin: rideData.durationMin || 0,
        avgSpeedKmh: rideData.avgSpeedKmh || 0,
        maxSpeedKmh: rideData.maxSpeedKmh || 0,
        elevationGainM: rideData.elevationGainM || 0,
        avgPowerW: rideData.avgPowerW ?? null,
        avgHrBpm: rideData.avgHrBpm ?? null,
        description: rideData.description || '',
        routeId: rideData.routeId || null,
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'rides',
        payload: newRide
      });
      addToast(t('cycling.rides.toastCreated'), 'success');
    }
    setIsOpen(false);
  }, [editingRide, dispatch, addToast, t]);

  const handleDelete = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'rides',
      id
    });
    addToast(t('cycling.rides.toastDeleted'), 'warning');
  }, [dispatch, addToast, t]);

  const handleConfirmDelete = useCallback(() => {
    if (rideToDelete) {
      handleDelete(rideToDelete);
      setRideToDelete(null);
    }
  }, [rideToDelete, handleDelete]);

  return (
    <div className="fade-in-entry cycling-page">
      {/* Overview Stat cards grid */}
      <div className="cycling-overview-grid">
        <div className="glass-panel cycling-stat-panel">
          <Route size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.distance')}</span>
            <strong className="cycling-stat-val">{totalDistance.toFixed(1)} {t('cycling.common.km')}</strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <Gauge size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.avg')}</span>
            <strong className="cycling-stat-val">{averageSpeed.toFixed(1)} {t('cycling.common.kmh')}</strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <TrendingUp size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.speedRecord')}</span>
            <strong className="cycling-stat-val">{recordSpeed.toFixed(1)} {t('cycling.common.kmh')}</strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <Mountain size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.dashboard.elevationGain')}</span>
            <strong className="cycling-stat-val">{totalElevation.toFixed(1)} {t('cycling.common.m')}</strong>
          </div>
        </div>

        <div className="glass-panel cycling-stat-panel">
          <Award size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <span className="cycling-stat-label">{t('cycling.rides.maxDistance')}</span>
            <strong className="cycling-stat-val">{maxDistance.toFixed(1)} {t('cycling.common.km')}</strong>
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

          <div className="cycling-actions">
            <div className="filter-tabs" style={{ marginBottom: 0 }}>
              <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>{t('cycling.rides.filterAll')} ({data.rides.length})</button>
              <button className={`tab-btn ${filter === 'recent' ? 'active' : ''}`} onClick={() => setFilter('recent')}>{t('cycling.rides.filterRecent')}</button>
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
              <div 
                key={ride.id} 
                className="glass-panel cycling-ride-card"
              >
                <div className="cycling-ride-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bike size={14} style={{ color: 'var(--accent)' }} />
                    <span className="cycling-ride-card-date">
                      {formatDate(ride.dateISO)}
                    </span>
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
                  <div className="cycling-ride-card-dist">
                    {formatDistance(ride.distanceKm)}
                  </div>
                </div>

                <div className="cycling-ride-card-details">
                  <div>
                    <span>{t('cycling.rides.avg')}</span>
                    <strong>{ride.avgSpeedKmh.toFixed(1)} {t('cycling.common.kmh')}</strong>
                  </div>
                  <div>
                    <span>{t('cycling.rides.maximum')}</span>
                    <strong>{ride.maxSpeedKmh.toFixed(1)} {t('cycling.common.kmh')}</strong>
                  </div>
                  <div>
                    <span>{t('cycling.dashboard.elevationGain')}</span>
                    <strong>{ride.elevationGainM.toFixed(1)} {t('cycling.common.m')}</strong>
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
            onClose={() => setIsOpen(false)}
            onSave={handleSaveRide}
          />
        )}

        {rideToDelete !== null && (
          <ConfirmDialog
            isOpen={rideToDelete !== null}
            onConfirm={handleConfirmDelete}
            onCancel={() => setRideToDelete(null)}
            title={t('cycling.rides.deleteConfirmTitle')}
            message={t('cycling.rides.deleteConfirmMessage')}
            variant="danger"
          />
        )}
    </div>
  );
}
