import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Route, Gauge, TrendingUp, Clock, Bike, Wrench, AlertTriangle, ArrowRight, Mountain } from 'lucide-react';
import { StatCard } from '../../ui';
import { formatDistance, formatDuration, formatDate } from '../../cognitive/helpers';
import { useRideStats } from '../../hooks/useRideStats';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export default function Dashboard({ onNavigateTab }: DashboardProps) {
  const { data } = useData();
  const { rides, maintenance, routes } = data;
  const { totalDistance: totalDist, totalDuration: totalTime, avgSpeed, maxSpeed, totalElevation } = useRideStats(rides);

  const pendingMaintenance = useMemo(() => {
    return maintenance.filter(m => !m.isDone);
  }, [maintenance]);

  const recentRides = useMemo(() => {
    return [...rides]
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
      .slice(0, 3);
  }, [rides]);

  return (
    <div className="flex-col-24">
      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Общий пробег"
          value={formatDistance(totalDist)}
          subtitle={`${rides.length} заездов за все время`}
          icon={<Route size={20} />}
          accent
        />
        <StatCard
          label="Средняя скорость"
          value={`${avgSpeed.toFixed(1)} км/ч`}
          subtitle={`Общее время: ${formatDuration(totalTime)}`}
          icon={<Gauge size={20} />}
          trend="neutral"
        />
        <StatCard
          label="Максимальная скорость"
          value={`${maxSpeed.toFixed(1)} км/ч`}
          icon={<TrendingUp size={20} />}
          trend="up"
        />
        <StatCard
          label="Набор высоты"
          value={`${totalElevation.toFixed(1)} м`}
          subtitle="Суммарный подъем"
          icon={<Mountain size={20} />}
        />
      </div>

      {/* Grid: Recent Rides vs Pending Maintenance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Recent Rides */}
        <div className="glass-panel padding-20-flex-col-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>Последние заезды</span>
            </h3>
            <button 
              className="btn btn--secondary" 
              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => onNavigateTab('rides')}
            >
              <span>Все заезды</span>
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
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>{ride.title}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{formatDate(ride.dateISO)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--accent)', display: 'block' }}>{formatDistance(ride.distanceKm)}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>за {formatDuration(ride.durationMin)}</span>
                </div>
              </div>
            ))}

            {recentRides.length === 0 && (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', padding: '24px' }}>
                Поездок не зафиксировано
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Alerts & Routes */}
        <div className="glass-panel padding-20-flex-col-16">
          {/* Maintenance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={16} />
                <span>Сервисное обслуживание</span>
              </h3>
              <button 
                className="btn btn--secondary" 
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                onClick={() => onNavigateTab('maintenance')}
              >
                Управление ТО
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
                    gap: '8px'
                  }}
                >
                  <AlertTriangle size={12} style={{ color: 'var(--error, #ef4444)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Необходимо: <strong>{m.bikePart}</strong> ({m.type === 'replace' ? 'замена' : 'сервис'})
                  </span>
                </div>
              ))}

              {pendingMaintenance.length === 0 && (
                <div style={{ color: 'var(--success, #16a34a)', fontSize: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Велосипед полностью обслужен. Активных предупреждений нет.
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bike size={16} />
                <span>Запланированные маршруты</span>
              </h3>
              <button 
                className="btn btn--secondary" 
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                onClick={() => onNavigateTab('routes')}
              >
                Маршруты
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Запланировано маршрутов: <strong>{routes.filter(r => !r.isCompleted).length}</strong></span>
              <span>Пройдено уникальных трасс: <strong>{routes.filter(r => r.isCompleted).length}</strong></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
