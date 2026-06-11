import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { 
  Brain, 
  Bike, 
  Wallet, 
  Calendar, 
  Users, 
  ArrowRight, 
  AlertTriangle,
  Flame
} from 'lucide-react';
import { CircularProgressRing } from '../../ui';
import { isDecaying } from '../../cognitive/social';
import { formatDate, formatCurrency, formatDuration, formatDistance, getDaysSince } from '../../cognitive/helpers';

export default function HubPage() {
  const { data } = useData();
  const navigate = useNavigate();

  // Current date in Russian format
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // 1. Tasks Data
  const activeTasks = useMemo(() => {
    return data.tasks.filter(t => !t.isCompleted);
  }, [data.tasks]);

  // 2. Finance Data
  const balance = useMemo(() => {
    return data.transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [data.transactions]);

  const unpaidReminders = useMemo(() => {
    return data.reminders
      .filter(r => !r.isPaid)
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
      .filter(p => isDecaying(p))
      .slice(0, 3)
      .map(p => ({
        ...p,
        daysElapsed: getDaysSince(p.lastContactISO)
      }));
  }, [data.people]);

  // 5. Habits & Reflection Data
  const activeHabits = useMemo(() => {
    return data.habits.filter(h => h.isActive);
  }, [data.habits]);

  return (
    <div className="fade-in-entry hub-container">
      {/* Banner */}
      <section className="glass-panel hub-banner animate-in">
        <h2 className="hub-banner-title gradient-text">
          Добро пожаловать в m0rveyZ Platform
        </h2>
        <p className="hub-banner-desc">
          Единый центр управления когнитивным балансом, социальными связями, личными финансами, велотренировками и привычками.
        </p>
        <div className="hub-date-badge">
          <Calendar size={14} />
          <span>Сегодня: {formattedDate}</span>
        </div>
      </section>

      {/* Grid of Modules */}
      <div className="veyz-dashboard-grid hub-grid">
        
        {/* Когнитивный баланс */}
        <div className="glass-panel hub-card animate-in-up stagger-1">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Brain size={18} />
              <span>Когнитивный баланс</span>
            </div>
            <span className="badge badge--accent">Усталость</span>
          </div>

          <div className="hub-fatigue-content">
            <CircularProgressRing 
              value={data.fatigue} 
              size={80} 
              strokeWidth={8} 
              label={`${Math.round(data.fatigue)}%`}
              color={data.fatigue > 75 ? 'var(--error)' : data.fatigue > 45 ? 'var(--warning)' : 'var(--accent)'}
            />
            <div>
              <p className="hub-text-sm-margin">
                Уровень усталости: <strong>{Math.round(data.fatigue)}%</strong>
              </p>
              <p className="hub-text-sm">
                Всего активных задач: <strong>{activeTasks.length}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Социальный граф */}
        <div className="glass-panel hub-card animate-in-up stagger-2">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Users size={18} />
              <span>Социальный граф</span>
            </div>
            <span className="badge">Связи</span>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Всего контактов:</span>
              <strong>{data.people.length}</strong>
            </div>

            {decayingPeople.length > 0 ? (
              <div className="hub-decaying-container">
                <div className="hub-decaying-title">
                  <AlertTriangle size={12} />
                  <span>ТРЕБУЮТ ВНИМАНИЯ (ОСТЫВАЮТ):</span>
                </div>
                <ul className="hub-list-vertical">
                  {decayingPeople.map(p => (
                    <li key={p.id} className="hub-list-item">
                      <span className="hub-list-item-name">{p.name}</span>
                      <span className="hub-list-item-desc">
                        Не общались {p.daysElapsed} дн.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hub-text-sm text-italic">
                Все контакты поддерживаются в актуальном состоянии!
              </p>
            )}
          </div>

          <button 
            className="btn btn--primary hub-card-action-btn" 
            onClick={() => navigate('/social')}
          >
            <span>Открыть Связи</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Финансы */}
        <div className="glass-panel hub-card animate-in-up stagger-3">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Wallet size={18} />
              <span>Капитал & Бюджет</span>
            </div>
            <span className="badge">Финансы</span>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Текущий баланс:</span>
              <strong className={balance >= 0 ? 'hub-balance-positive' : 'hub-balance-negative'}>
                {formatCurrency(balance)}
              </strong>
            </div>

            {unpaidReminders.length > 0 ? (
              <div className="hub-reminder-container">
                <div className="hub-reminder-title">БЛИЖАЙШИЕ ПЛАТЕЖИ:</div>
                <ul className="hub-list-vertical">
                  {unpaidReminders.map(r => (
                    <li key={r.id} className="hub-list-item">
                      <span className="hub-list-item-name">{r.title}</span>
                      <strong>{formatCurrency(r.amount)} ({formatDate(r.dueDateISO)})</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hub-text-sm text-italic">
                Нет запланированных неоплаченных счетов.
              </p>
            )}
          </div>

          <button 
            className="btn btn--primary hub-card-action-btn" 
            onClick={() => navigate('/finance')}
          >
            <span>Открыть Финансы</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Велоспорт */}
        <div className="glass-panel hub-card animate-in-up stagger-4">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Bike size={18} />
              <span>Велоспорт</span>
            </div>
            <span className="badge">Физика</span>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Общая дистанция:</span>
              <strong>{formatDistance(totalRidesDistance)}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>Всего поездок:</span>
              <strong>{data.rides.length}</strong>
            </div>

            {latestRides.length > 0 ? (
              <div className="hub-latest-ride">
                <div className="hub-latest-ride-title">ПОСЛЕДНИЙ ЗАЕЗД:</div>
                <div className="hub-latest-ride-row">
                  <strong>{latestRides[0].title || 'Без названия'}</strong>
                  <span>{formatDate(latestRides[0].dateISO)}</span>
                </div>
                <div className="hub-latest-ride-meta">
                  Дистанция: {formatDistance(latestRides[0].distanceKm)} · Время: {formatDuration(latestRides[0].durationMin)}
                </div>
              </div>
            ) : (
              <p className="hub-text-sm text-italic">
                Поездок не зафиксировано.
              </p>
            )}
          </div>

          <button 
            className="btn btn--primary hub-card-action-btn" 
            onClick={() => navigate('/cycling')}
          >
            <span>Открыть Велоспорт</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Рефлексия и привычки */}
        <div className="glass-panel hub-card animate-in-up stagger-5">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Flame size={18} />
              <span>Рефлексия & Привычки</span>
            </div>
            <span className="badge">Ментальность</span>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Активных привычек:</span>
              <strong>{activeHabits.length}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>Записей в дневнике:</span>
              <strong>{data.journal.length}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>Идей в музее мыслей:</span>
              <strong>{data.thoughts.length}</strong>
            </div>
          </div>

          <button 
            className="btn btn--primary hub-card-action-btn" 
            onClick={() => navigate('/reflect')}
          >
            <span>Открыть Рефлексию</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* Tip of the day */}
      <div className="glass-panel hub-tip-container animate-in-up stagger-6">
        <Flame size={16} />
        <span>Подсказка: вы можете переключаться между модулями с помощью горячих клавиш Alt+1 ... Alt+5, а также экспортировать бэкап данных через Ctrl+S.</span>
      </div>
    </div>
  );
}
