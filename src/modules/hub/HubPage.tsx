import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../i18n';
import {
  Brain,
  Bike,
  Wallet,
  Calendar,
  Users,
  ArrowRight,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { CircularProgressRing } from '../../ui';
import { isDecaying } from '../../cognitive/social';
import {
  formatDate,
  formatCurrency,
  formatDuration,
  formatDistance,
  getDaysSince,
} from '../../cognitive/helpers';

export default function HubPage() {
  const { data } = useData();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  // Current date in selected language format with capitalized weekday
  const formattedDate = useMemo(() => {
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    const dateStr = new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }, [lang]);

  // 1. Tasks Data
  const activeTasks = useMemo(() => {
    return data.tasks.filter((t) => !t.isCompleted);
  }, [data.tasks]);

  // 2. Finance Data
  const balance = useMemo(() => {
    return data.transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [data.transactions]);

  const unpaidReminders = useMemo(() => {
    return data.reminders
      .filter((r) => !r.isPaid)
      .sort((a, b) => new Date(a.dueDateISO).getTime() - new Date(b.dueDateISO).getTime())
      .slice(0, 3);
  }, [data.reminders]);

  // 3. Cycling Data
  const totalRidesDistance = useMemo(() => {
    return data.rides.reduce((acc, ride) => acc + ride.distanceKm, 0);
  }, [data.rides]);

  const latestRides = useMemo(() => {
    return [...data.rides]
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
      .slice(0, 3);
  }, [data.rides]);

  // 4. Social Graph Data
  const decayingPeople = useMemo(() => {
    return data.people
      .filter((p) => isDecaying(p))
      .slice(0, 3)
      .map((p) => ({
        ...p,
        daysElapsed: getDaysSince(p.lastContactISO),
      }));
  }, [data.people]);

  // 5. Habits & Reflection Data
  const activeHabits = useMemo(() => {
    return data.habits.filter((h) => h.isActive);
  }, [data.habits]);

  const fatigueValue = typeof data.fatigue === 'number' ? data.fatigue : 10;

  return (
    <div className="fade-in-entry hub-container">
      {/* Banner */}
      <section className="hub-banner">
        <h2 className="hub-banner-title">{t('hub.welcome')}</h2>
        <p className="hub-banner-desc">{t('hub.description')}</p>
        <div className="hub-date-badge">
          <Calendar size={13} />
          <span>{formattedDate}</span>
        </div>
      </section>

      {/* Grid of Modules */}
      <div className="hub-grid">
        {/* Когнитивный баланс & Задачи */}
        <div
          className="glass-panel hub-card hub-card--cognitive"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/tasks')}
        >
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Brain size={16} />
              <span>{t('hub.cognitive_balance')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)' }}>
              <span>{t('nav.tasks')}</span>
              <ArrowRight size={12} />
            </div>
          </div>

          <div className="hub-fatigue-content">
            <CircularProgressRing
              value={fatigueValue}
              size={72}
              strokeWidth={7}
              color={
                fatigueValue > 75
                  ? 'var(--error)'
                  : fatigueValue > 45
                    ? 'var(--warning)'
                    : '#a78bfa'
              }
            />
            <div>
              <p className="hub-text-sm-margin">{t('hub.fatigue')}</p>
              <p className="hub-text-sm">
                {t('hub.active_tasks')}: <strong>{activeTasks.length}</strong>
              </p>
            </div>
          </div>

          <div className="hub-text-sm hub-empty-hint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('hub.tasks_active', { count: activeTasks.length })}</span>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Eisenhower Matrix &rarr;</span>
          </div>
        </div>

        {/* Социальный граф */}
        <div className="glass-panel hub-card hub-card--social">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Users size={16} />
              <span>{t('hub.social_graph')}</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>{t('hub.contacts')}</span>
              <strong>{data.people.length}</strong>
            </div>

            {decayingPeople.length > 0 ? (
              <div className="hub-decaying-container">
                <div className="hub-decaying-title">
                  <AlertTriangle size={11} />
                  <span>{t('hub.need_attention')}</span>
                </div>
                <ul className="hub-list-vertical">
                  {decayingPeople.map((p) => (
                    <li key={p.id} className="hub-list-item">
                      <span className="hub-list-item-name">{p.name}</span>
                      <span className="hub-list-item-desc">
                        {p.daysElapsed} {t('days_abbrev')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hub-text-sm hub-empty-hint">{t('hub.all_connections_ok')}</p>
            )}
          </div>

          <button
            className="hub-card-action-btn"
            onClick={() => navigate('/social')}
            aria-label={t('hub.aria.openSocial')}
          >
            <span>{t('hub.open')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Финансы */}
        <div className="glass-panel hub-card hub-card--finance">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Wallet size={16} />
              <span>{t('hub.finance')}</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>{t('hub.balance')}</span>
              <strong className={balance >= 0 ? 'hub-balance-positive' : 'hub-balance-negative'}>
                {formatCurrency(balance)}
              </strong>
            </div>

            {unpaidReminders.length > 0 ? (
              <div className="hub-reminder-container">
                <div className="hub-reminder-title">{t('hub.upcoming_payments')}</div>
                <ul className="hub-list-vertical">
                  {unpaidReminders.map((r) => (
                    <li key={r.id} className="hub-list-item">
                      <span className="hub-list-item-name">{r.title}</span>
                      <span className="hub-list-item-desc">{formatCurrency(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hub-text-sm hub-empty-hint">{t('hub.no_unpaid_bills')}</p>
            )}
          </div>

          <button
            className="hub-card-action-btn"
            onClick={() => navigate('/finance')}
            aria-label={t('hub.aria.openFinance')}
          >
            <span>{t('hub.open')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Велоспорт */}
        <div className="glass-panel hub-card hub-card--cycling">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Bike size={16} />
              <span>{t('hub.cycling')}</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>{t('hub.distance')}</span>
              <strong>{formatDistance(totalRidesDistance)}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>{t('hub.rides_count')}</span>
              <strong>{data.rides.length}</strong>
            </div>

            {latestRides.length > 0 ? (
              <div className="hub-latest-ride">
                <div className="hub-latest-ride-title">{t('hub.last_ride')}</div>
                <div className="hub-latest-ride-row">
                  <strong>{latestRides[0].title || t('hub.no_rides')}</strong>
                  <span>{formatDate(latestRides[0].dateISO)}</span>
                </div>
                <div className="hub-latest-ride-meta">
                  {formatDistance(latestRides[0].distanceKm)} ·{' '}
                  {formatDuration(latestRides[0].durationMin)}
                </div>
              </div>
            ) : (
              <p className="hub-text-sm hub-empty-hint">{t('hub.no_rides')}</p>
            )}
          </div>

          <button
            className="hub-card-action-btn"
            onClick={() => navigate('/cycling')}
            aria-label={t('hub.aria.openCycling')}
          >
            <span>{t('hub.open')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Рефлексия и привычки */}
        <div className="glass-panel hub-card hub-card--reflect">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Flame size={16} />
              <span>{t('hub.reflection')}</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>{t('hub.habits')}</span>
              <strong>{activeHabits.length}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>{t('hub.journal_entries')}</span>
              <strong>{data.journal.length}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>{t('hub.thoughts')}</span>
              <strong>{data.thoughts.length}</strong>
            </div>
          </div>

          <button
            className="hub-card-action-btn"
            onClick={() => navigate('/reflect')}
            aria-label={t('hub.aria.openReflection')}
          >
            <span>{t('hub.open')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Tip of the day */}
      <div className="hub-tip-container">
        <Flame size={14} />
        <span>{t('hub.keyboard_tips')}</span>
      </div>
    </div>
  );
}
