import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  Route,
  Gauge,
  TrendingUp,
  Clock,
  Bike,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Mountain,
} from 'lucide-react';
import { StatCard } from '../../ui';
import { formatDistance, formatDuration, formatDate } from '../../cognitive/helpers';
import { useRideStats } from '../../hooks/useRideStats';
import { useI18n } from '../../i18n';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({ onNavigateTab }: DashboardProps) {
  const { t } = useI18n();
  const { data } = useData();
  const { rides, maintenance, routes } = data;
  const {
    totalDistance: totalDist,
    totalDuration: totalTime,
    avgSpeed,
    maxSpeed,
    totalElevation,
  } = useRideStats(rides);

  const pendingMaintenance = useMemo(() => {
    return maintenance.filter((m) => !m.isDone);
  }, [maintenance]);

  const recentRides = useMemo(() => {
    return [...rides]
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
      .slice(0, 3);
  }, [rides]);

  const bikeStats = useMemo(() => {
    const map = new Map<string, { distance: number; ridesCount: number }>();
    rides.forEach((r) => {
      const bike = r.bikeName || t('cycling.bike.road');
      const curr = map.get(bike) || { distance: 0, ridesCount: 0 };
      curr.distance += r.distanceKm;
      curr.ridesCount += 1;
      map.set(bike, curr);
    });
    return Array.from(map.entries()).map(([bike, stats]) => ({ bike, ...stats }));
  }, [rides, t]);

  return (
    <div className="flex-col-24">
      {/* Overview Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          label={t('cycling.dashboard.totalMileage')}
          value={formatDistance(totalDist)}
          subtitle={t('cycling.dashboard.ridesAllTime', { count: rides.length })}
          icon={<Route size={20} />}
          accent
        />
        <StatCard
          label={t('cycling.dashboard.avgSpeed')}
          value={`${avgSpeed.toFixed(1)} ${t('cycling.common.kmh')}`}
          subtitle={t('cycling.dashboard.totalTime', { time: formatDuration(totalTime) })}
          icon={<Gauge size={20} />}
          trend="neutral"
        />
        <StatCard
          label={t('cycling.dashboard.maxSpeed')}
          value={`${maxSpeed.toFixed(1)} ${t('cycling.common.kmh')}`}
          icon={<TrendingUp size={20} />}
          trend="up"
        />
        <StatCard
          label={t('cycling.dashboard.elevationGain')}
          value={`${totalElevation.toFixed(1)} ${t('cycling.common.m')}`}
          subtitle={t('cycling.dashboard.totalClimb')}
          icon={<Mountain size={20} />}
        />
      </div>

      {/* Bike Garage Overview */}
      {bikeStats.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 0 16px 0',
            }}
          >
            <Bike size={18} style={{ color: 'var(--accent)' }} />
            <span>{t('cycling.dashboard.garage')}</span>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {bikeStats.map((item) => {
              const pct = totalDist > 0 ? Math.round((item.distance / totalDist) * 100) : 0;
              return (
                <div
                  key={item.bike}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.bike}</strong>
                    <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700 }}>
                      {formatDistance(item.distance)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>{item.ridesCount} {t('cycling.dashboard.rides_count')}</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--primary)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Recent Rides vs Pending Maintenance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Recent Rides */}
        <div className="glass-panel padding-20-flex-col-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={16} />
              <span>{t('cycling.dashboard.recentRides')}</span>
            </h3>
            <button
              className="btn btn--secondary"
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={() => onNavigateTab('rides')}
            >
              <span>{t('cycling.dashboard.allRides')}</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex-col-8" style={{ flex: 1 }}>
            {recentRides.map((ride) => (
              <div
                key={ride.id}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong
                    style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}
                  >
                    {ride.title}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {formatDate(ride.dateISO)} {ride.bikeName ? `· ${ride.bikeName}` : ''}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--accent)', display: 'block' }}>
                    {formatDistance(ride.distanceKm)}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {t('cycling.dashboard.for')} {formatDuration(ride.durationMin)}
                  </span>
                </div>
              </div>
            ))}

            {recentRides.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  padding: '24px',
                }}
              >
                {t('cycling.dashboard.noRides')}
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Alerts & Routes */}
        <div className="glass-panel padding-20-flex-col-16">
          {/* Maintenance */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Wrench size={16} />
                <span>{t('cycling.dashboard.maintenance')}</span>
              </h3>
              <button
                className="btn btn--secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                onClick={() => onNavigateTab('maintenance')}
              >
                {t('cycling.dashboard.manageMaintenance')}
              </button>
            </div>

            <div className="flex-col-6">
              {pendingMaintenance.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.03)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle
                    size={12}
                    style={{ color: 'var(--error, #ef4444)', flexShrink: 0 }}
                  />
                  <span
                    style={{
                      color: 'var(--text-primary)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t('cycling.dashboard.maintenanceRequired', {
                      part: m.bikePart + (m.bikeName ? ` (${m.bikeName})` : ''),
                      type:
                        m.type === 'replace'
                          ? t('cycling.common.replacement')
                          : t('cycling.common.service'),
                    })}
                  </span>
                </div>
              ))}

              {pendingMaintenance.length === 0 && (
                <div
                  style={{
                    color: 'var(--success, #16a34a)',
                    fontSize: '0.8rem',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {t('cycling.dashboard.bikeFullyServiced')}
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Bike size={16} />
                <span>{t('cycling.dashboard.plannedRoutes')}</span>
              </h3>
              <button
                className="btn btn--secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                onClick={() => onNavigateTab('routes')}
              >
                {t('cycling.dashboard.routes')}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span>
                {t('cycling.dashboard.routesPlanned')}:{' '}
                <strong>{routes.filter((r) => !r.isCompleted).length}</strong>
              </span>
              <span>
                {t('cycling.dashboard.routesCompleted')}:{' '}
                <strong>{routes.filter((r) => r.isCompleted).length}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
