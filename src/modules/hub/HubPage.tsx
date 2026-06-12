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

  const fatigueValue = typeof data.fatigue === 'number' ? data.fatigue : 10;

  return (
    <div className="fade-in-entry hub-container">
      {/* Banner */}
      <section className="hub-banner">
        <h2 className="hub-banner-title">
          Добро пожаловать в LifeOS
        </h2>
        <p className="hub-banner-desc">
          Когнитивный баланс, социальные связи, финансы, велотренировки и привычки — всё в одном месте.
        </p>
        <div className="hub-date-badge">
          <Calendar size={13} />
          <span>{formattedDate}</span>
        </div>
      </section>

      {/* Grid of Modules */}
      <div className="hub-grid">
        
        {/* Когнитивный баланс */}
        <div className="glass-panel hub-card hub-card--cognitive">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Brain size={16} />
              <span>Когнитивный баланс</span>
            </div>
          </div>

          <div className="hub-fatigue-content">
            <CircularProgressRing
              value={fatigueValue}
              size={72}
              strokeWidth={7}
              color={fatigueValue > 75 ? 'var(--error)' : fatigueValue > 45 ? 'var(--warning)' : '#a78bfa'}
            />
            <div>
              <p className="hub-text-sm-margin">
                Усталость
              </p>
              <p className="hub-text-sm">
                Активных задач: <strong>{activeTasks.length}</strong>
              </p>
            </div>
          </div>

          <div className="hub-text-sm hub-empty-hint">
            Задач: {activeTasks.length} активных
          </div>
        </div>

        {/* Социальный граф */}
        <div className="glass-panel hub-card hub-card--social">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Users size={16} />
              <span>Социальный граф</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Контактов</span>
              <strong>{data.people.length}</strong>
            </div>

            {decayingPeople.length > 0 ? (
              <div className="hub-decaying-container">
                <div className="hub-decaying-title">
                  <AlertTriangle size={11} />
                  <span>Требуют внимания</span>
                </div>
                <ul className="hub-list-vertical">
                  {decayingPeople.map(p => (
                    <li key={p.id} className="hub-list-item">
                      <span className="hub-list-item-name">{p.name}</span>
                      <span className="hub-list-item-desc">
                        {p.daysElapsed} дн.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hub-text-sm hub-empty-hint">
                Все связи актуальны
              </p>
            )}
          </div>

          <button 
            className="hub-card-action-btn" 
            onClick={() => navigate('/social')}
            aria-label="Открыть модуль социального графа"
          >
            <span>Открыть</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Финансы */}
        <div className="glass-panel hub-card hub-card--finance">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Wallet size={16} />
              <span>Капитал</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Баланс</span>
              <strong className={balance >= 0 ? 'hub-balance-positive' : 'hub-balance-negative'}>
                {formatCurrency(balance)}
              </strong>
            </div>

            {unpaidReminders.length > 0 ? (
              <div className="hub-reminder-container">
                <div className="hub-reminder-title">Ближайшие платежи</div>
                <ul className="hub-list-vertical">
                  {unpaidReminders.map(r => (
                    <li key={r.id} className="hub-list-item">
                      <span className="hub-list-item-name">{r.title}</span>
                      <span className="hub-list-item-desc">
                        {formatCurrency(r.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="hub-text-sm hub-empty-hint">
                Нет неоплаченных счетов
              </p>
            )}
          </div>

          <button 
            className="hub-card-action-btn" 
            onClick={() => navigate('/finance')}
            aria-label="Открыть модуль финансов"
          >
            <span>Открыть</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Велоспорт */}
        <div className="glass-panel hub-card hub-card--cycling">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Bike size={16} />
              <span>Велоспорт</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Дистанция</span>
              <strong>{formatDistance(totalRidesDistance)}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>Поездок</span>
              <strong>{data.rides.length}</strong>
            </div>

            {latestRides.length > 0 ? (
              <div className="hub-latest-ride">
                <div className="hub-latest-ride-title">Последний заезд</div>
                <div className="hub-latest-ride-row">
                  <strong>{latestRides[0].title || 'Без названия'}</strong>
                  <span>{formatDate(latestRides[0].dateISO)}</span>
                </div>
                <div className="hub-latest-ride-meta">
                  {formatDistance(latestRides[0].distanceKm)} · {formatDuration(latestRides[0].durationMin)}
                </div>
              </div>
            ) : (
              <p className="hub-text-sm hub-empty-hint">
                Поездок нет
              </p>
            )}
          </div>

          <button 
            className="hub-card-action-btn" 
            onClick={() => navigate('/cycling')}
            aria-label="Открыть модуль велоспорта"
          >
            <span>Открыть</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Рефлексия и привычки */}
        <div className="glass-panel hub-card hub-card--reflect">
          <div className="hub-card-header">
            <div className="hub-card-title-row">
              <Flame size={16} />
              <span>Рефлексия</span>
            </div>
          </div>

          <div className="hub-flex-col-10">
            <div className="hub-row-space-between-sm">
              <span>Привычек</span>
              <strong>{activeHabits.length}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>Записей в дневнике</span>
              <strong>{data.journal.length}</strong>
            </div>
            <div className="hub-row-space-between-sm">
              <span>Мыслей</span>
              <strong>{data.thoughts.length}</strong>
            </div>
          </div>

          <button 
            className="hub-card-action-btn" 
            onClick={() => navigate('/reflect')}
            aria-label="Открыть модуль рефлексии"
          >
            <span>Открыть</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* Tip of the day */}
      <div className="hub-tip-container">
        <Flame size={14} />
        <span>Горячие клавиши: Alt+1…Alt+5 — модули, Ctrl+S — экспорт бэкапа.</span>
      </div>
    </div>
  );
}
