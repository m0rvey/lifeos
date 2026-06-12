import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../i18n';
import { 
  Activity, 
  Brain, 
  Dumbbell, 
  Calendar, 
  Zap, 
  Wallet, 
  Compass
} from 'lucide-react';
import { StatCard } from '../../ui';
import { formatCurrency, isInWindow } from '../../cognitive/helpers';
import { isDecaying } from '../../cognitive/social';

export default function StatisticsPage() {
  const { t } = useI18n();
  const { data } = useData();
  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(14);

  // 1. Overall Statistics Breakdown
  const overviewStats = useMemo(() => {
    const inWindow = (dateStr: string) => isInWindow(dateStr, daysRange);

    const totalRidesDist = data.rides
      .filter(r => inWindow(r.dateISO))
      .reduce((acc, r) => acc + r.distanceKm, 0);

    const totalWorkoutCals = data.workouts
      .filter(w => inWindow(w.dateISO))
      .reduce((acc, w) => acc + (w.calories || 0), 0);

    const totalCompletedTasks = data.tasks
      .filter(t => t.isCompleted && inWindow(t.updatedAt))
      .length;

    const completedHabitsCount = data.habits.reduce(
      (acc, h) => acc + h.completedDates.filter(inWindow).length,
      0
    );

    const periodTransactions = data.transactions.filter(t => inWindow(t.dateISO));
    const totalIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    // Daily active workouts and rides duration sum in window
    const workoutsDuration = data.workouts
      .filter(w => inWindow(w.dateISO))
      .reduce((acc, w) => acc + w.durationMin, 0);
    
    // Let's get actual duration for rides if possible, or fallback
    const ridesDurationActual = data.rides
      .filter(r => inWindow(r.dateISO))
      .reduce((acc, r) => acc + r.durationMin, 0);

    const totalExerciseMin = workoutsDuration + ridesDurationActual;

    // Mood logs in window count
    const moodLogsCount = data.journal.filter(j => j.dateISO && inWindow(j.dateISO)).length;

    return {
      totalRidesDist,
      totalWorkoutCals,
      totalCompletedTasks,
      completedHabitsCount,
      savingsRate,
      netCapital: totalIncome - totalExpenses,
      totalExerciseMin,
      moodLogsCount
    };
  }, [data.rides, data.workouts, data.tasks, data.habits, data.transactions, data.journal, daysRange]);

  // 2. Resource Balance Calculator
  const resourceScores = useMemo(() => {
    // 2.1. Cognitive resource: 100 - fatigue
    const cognitive = Math.max(10, Math.min(100, Math.round(100 - data.fatigue)));

    // 2.2. Social balance: percentage of non-decaying contacts
    const totalPeople = data.people.length;
    const decayingCount = data.people.filter(isDecaying).length;
    const social = totalPeople > 0 ? Math.max(10, Math.round(((totalPeople - decayingCount) / totalPeople) * 100)) : 100;

    // 2.3. Financial stability: based on savingsRate
    let finance = 75;
    if (overviewStats.netCapital !== 0 || overviewStats.savingsRate !== 0) {
      finance = overviewStats.savingsRate > 0 
        ? Math.min(100, 50 + overviewStats.savingsRate)
        : Math.max(10, 50 + overviewStats.savingsRate);
    }

    // 2.4. Physical: proportional target 150 mins per 7 days
    const targetExerciseMin = (daysRange / 7) * 150;
    const physical = targetExerciseMin > 0
      ? Math.max(10, Math.min(100, Math.round((overviewStats.totalExerciseMin / targetExerciseMin) * 100)))
      : 10;

    // 2.5. Mindfulness: habits and mood logs
    const activeHabitsCount = data.habits.filter(h => h.isActive).length;
    const targetHabits = daysRange * activeHabitsCount;
    const habitScore = targetHabits > 0 ? (overviewStats.completedHabitsCount / targetHabits) * 100 : 100;
    const targetLogs = Math.max(1, Math.round(daysRange / 2));
    const logScore = Math.min(100, (overviewStats.moodLogsCount / targetLogs) * 100);
    const mindful = Math.max(10, Math.min(100, Math.round((habitScore * 0.7) + (logScore * 0.3))));

    return { cognitive, social, finance, physical, mindful };
  }, [data.fatigue, data.people, data.habits, overviewStats, daysRange]);

  // 3. Dynamic Diagnostic Advice Generator
  const recommendations = useMemo(() => {
    const recs = [];
    const scores = [
      { key: 'cognitive', name: t('stats.resource.cognitive'), score: resourceScores.cognitive },
      { key: 'social', name: t('stats.resource.social'), score: resourceScores.social },
      { key: 'finance', name: t('stats.resource.finance'), score: resourceScores.finance },
      { key: 'physical', name: t('stats.resource.physical'), score: resourceScores.physical },
      { key: 'mindful', name: t('stats.resource.mindful'), score: resourceScores.mindful },
    ];
    
    // Sort ascending to find lowest resources
    scores.sort((a, b) => a.score - b.score);
    
    // Get decaying people names
    const decayingPeople = data.people.filter(isDecaying).slice(0, 2).map(p => p.name);

    scores.forEach(s => {
      if (s.score < 70) {
        if (s.key === 'cognitive') {
          recs.push({
            domain: t('stats.resource.cognitive'),
            advice: t('stats.advice.cognitive'),
            severity: s.score < 40 ? 'danger' : 'warning'
          });
        } else if (s.key === 'social') {
          const namesStr = decayingPeople.length > 0 ? `: ${decayingPeople.join(', ')}` : '';
          recs.push({
            domain: t('stats.resource.social'),
            advice: t('stats.advice.social', { names: namesStr }),
            severity: s.score < 40 ? 'danger' : 'warning'
          });
        } else if (s.key === 'finance') {
          recs.push({
            domain: t('stats.resource.finance'),
            advice: t('stats.advice.finance', { rate: overviewStats.savingsRate }),
            severity: s.score < 40 ? 'danger' : 'warning'
          });
        } else if (s.key === 'physical') {
          recs.push({
            domain: t('stats.resource.physical'),
            advice: t('stats.advice.physical', { minutes: overviewStats.totalExerciseMin }),
            severity: s.score < 40 ? 'danger' : 'warning'
          });
        } else if (s.key === 'mindful') {
          recs.push({
            domain: t('stats.resource.mindful'),
            advice: t('stats.advice.mindful'),
            severity: s.score < 40 ? 'danger' : 'warning'
          });
        }
      }
    });

    // Default if everything is fine
    if (recs.length === 0) {
      recs.push({
        domain: t('stats.excellent_balance'),
        advice: t('stats.advice.excellent'),
        severity: 'success'
      });
    }

    return recs;
  }, [resourceScores, data.people, overviewStats.savingsRate, overviewStats.totalExerciseMin, t]);

  return (
    <div className="fade-in-entry stats-page">
      <div className="stats-header">
        <div>
          <h2 className="stats-header-title">
            {t('stats.cross_module_analytics')}
          </h2>
          <p className="stats-header-subtitle">
            {t('stats.subtitle')}
          </p>
        </div>
        <div className="glass-panel stats-range-switcher">
          {[7, 14, 30].map(val => (
            <button
              key={val}
              className={`btn ${daysRange === val ? 'btn--primary' : 'btn--secondary'} stats-range-btn`}
              onClick={() => setDaysRange(val as 7 | 14 | 30)}
            >
              {t('stats.days', { count: val })}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="stats-overview-grid">
        <StatCard
          label={t('stats.fatigue')}
          value={`${Math.round(data.fatigue)}%`}
          subtitle={data.fatigue >= 80 ? t('stats.critical_exhaustion') : data.fatigue >= 50 ? t('stats.elevated_fatigue') : t('stats.optimal_state')}
          icon={<Brain size={20} />}
          accent={data.fatigue >= 70}
        />
        <StatCard
          label={t('stats.net_capital')}
          value={formatCurrency(overviewStats.netCapital)}
          subtitle={t('stats.savings_rate', { rate: overviewStats.savingsRate })}
          icon={<Wallet size={20} />}
          trend={overviewStats.netCapital >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label={t('stats.cycling_distance')}
          value={t('stats.km', { distance: overviewStats.totalRidesDist.toFixed(0) })}
          subtitle={t('stats.total_distance')}
          icon={<Activity size={20} />}
        />
        <StatCard
          label={t('stats.calories_burned')}
          value={t('stats.kcal', { calories: overviewStats.totalWorkoutCals.toLocaleString() })}
          subtitle={t('stats.strength_fitness')}
          icon={<Dumbbell size={20} />}
        />
      </div>

      {/* Life Balance Diagnostics & Recommendations Section */}
      <div className="glass-panel stats-diagnostic-panel">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '20px' }}>
            <Compass size={18} /> {t('stats.balance_radar')}
          </h3>
          
          <div className="flex-col-16">
            {[
              { label: t('stats.resource.cognitive'), val: resourceScores.cognitive, color: 'var(--primary)', desc: t('stats.cognitive_desc') },
              { label: t('stats.resource.social'), val: resourceScores.social, color: 'var(--blue, #82b1ff)', desc: t('stats.social_desc') },
              { label: t('stats.resource.finance'), val: resourceScores.finance, color: 'var(--success, #81c784)', desc: t('stats.finance_desc') },
              { label: t('stats.resource.physical'), val: resourceScores.physical, color: 'var(--warning, #fbbf24)', desc: t('stats.physical_desc') },
              { label: t('stats.resource.mindful'), val: resourceScores.mindful, color: 'var(--error, #f2b8b5)', desc: t('stats.mindful_desc') },
            ].map(item => (
              <div key={item.label} className="flex-col-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                  <span style={{ color: item.color }}>{item.val}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${item.val}%`, background: item.color, borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Column */}
        <div className="stats-advice-column">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '4px' }}>
            <Zap size={18} /> {t('stats.recommendations')}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '340px', paddingRight: '4px' }}>
            {recommendations.map((rec, idx) => {
              let borderColor = 'var(--border)';
              let bg = 'rgba(255, 255, 255, 0.02)';
              if (rec.severity === 'danger') {
                borderColor = 'var(--error)';
                bg = 'rgba(239, 68, 68, 0.04)';
              } else if (rec.severity === 'warning') {
                borderColor = 'var(--warning)';
                bg = 'rgba(245, 158, 11, 0.04)';
              } else if (rec.severity === 'success') {
                borderColor = 'var(--success)';
                bg = 'rgba(16, 185, 129, 0.04)';
              }

              return (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '12px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)', 
                    borderLeft: `3px solid ${borderColor}`,
                    background: bg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: borderColor }}>
                    {rec.domain}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {rec.advice}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="stats-details-grid">
        {/* Productivity Log */}
        <div className="glass-panel stats-detail-panel">
          <h3 className="stats-detail-title">
            <Calendar size={16} /> {t('stats.productivity_discipline')}
          </h3>
          <div className="stats-detail-list">
            <div className="stats-detail-row">
              <span>{t('stats.tasks_completed')}</span>
              <strong>{overviewStats.totalCompletedTasks}</strong>
            </div>
            <div className="stats-detail-row">
              <span>{t('stats.habits_closed')}</span>
              <strong>{overviewStats.completedHabitsCount}</strong>
            </div>
            <div className="stats-detail-row-last">
              <span>{t('stats.total_notes')}</span>
              <strong>{data.knowledge.length}</strong>
            </div>
          </div>
        </div>

        {/* Activity & Health Log */}
        <div className="glass-panel stats-detail-panel">
          <h3 className="stats-detail-title">
            <Dumbbell size={16} /> {t('stats.physical_health_sport')}
          </h3>
          <div className="stats-detail-list">
            <div className="stats-detail-row">
              <span>{t('stats.total_workouts')}</span>
              <strong>{data.workouts.length}</strong>
            </div>
            <div className="stats-detail-row">
              <span>{t('stats.cycling_rides_count')}</span>
              <strong>{data.rides.length}</strong>
            </div>
            <div className="stats-detail-row-last">
              <span>{t('stats.cycling_routes_created')}</span>
              <strong>{data.routes.length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
