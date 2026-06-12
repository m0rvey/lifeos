import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { 
  Smile, 
  BookOpen, 
  Calendar, 
  Award, 
  Dumbbell, 
  Quote, 
  ArrowRight, 
  Brain, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { StatCard } from '../../ui';
import { formatDate, todayISO, getMoodLabel } from '../../cognitive/helpers';

export default function Dashboard() {
  const { data } = useData();

  // 1. Calculations
  const journalStats = useMemo(() => {
    const total = data.journal.length;
    if (total === 0) return { total, avgMood: 0, lastEntry: null };
    const avgMood = Math.round(data.journal.reduce((sum, e) => sum + e.mood, 0) / total);
    const sorted = [...data.journal].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    return { total, avgMood, lastEntry: sorted[0] };
  }, [data.journal]);

  const knowledgeStats = useMemo(() => {
    const total = data.knowledge.length;
    const categories = new Set(data.knowledge.map(k => k.category));
    return { total, categoryCount: categories.size };
  }, [data.knowledge]);

  const habitsStats = useMemo(() => {
    const activeHabits = data.habits.filter(h => h.isActive);
    const totalActive = activeHabits.length;
    const today = todayISO();
    const completedToday = activeHabits.filter(h => h.completedDates.includes(today)).length;
    return { totalActive, completedToday };
  }, [data.habits]);

  const scheduleStats = useMemo(() => {
    const today = todayISO();
    const todayBlocks = data.schedule.filter(b => b.dateISO.startsWith(today));
    const completedBlocks = todayBlocks.filter(b => b.isCompleted).length;
    return { todayTotal: todayBlocks.length, todayCompleted: completedBlocks };
  }, [data.schedule]);

  const workoutsStats = useMemo(() => {
    const total = data.workouts.length;
    const totalDuration = data.workouts.reduce((acc, w) => acc + w.durationMin, 0);
    return { total, totalDuration };
  }, [data.workouts]);

  const museumThought = useMemo(() => {
    if (data.thoughts.length === 0) return null;
    // Generate semi-random index based on day of month/year so it doesn't change every render
    const day = new Date().getDate();
    const index = day % data.thoughts.length;
    return data.thoughts[index];
  }, [data.thoughts]);

  return (
    <div className="flex-col-24 fade-in-entry">
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Панель самоанализа и рефлексии
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Интегральный обзор ментального здоровья, привычек, физической активности и базы знаний
        </p>
      </div>

      {/* Grid of stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Индекс настроения"
          value={journalStats.total > 0 ? `${journalStats.avgMood}%` : '—'}
          subtitle={journalStats.total > 0 ? getMoodLabel(journalStats.avgMood) : 'Нет записей'}
          icon={<Smile size={20} />}
          accent
        />
        <StatCard
          label="База знаний"
          value={knowledgeStats.total}
          subtitle={`${knowledgeStats.categoryCount} категорий заметок`}
          icon={<Brain size={20} />}
        />
        <StatCard
          label="Привычки на сегодня"
          value={habitsStats.totalActive > 0 ? `${habitsStats.completedToday} / ${habitsStats.totalActive}` : '0'}
          subtitle="Выполнено привычек"
          icon={<Award size={20} />}
          trend={habitsStats.completedToday === habitsStats.totalActive && habitsStats.totalActive > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Занятия спортом"
          value={workoutsStats.total}
          subtitle={`Всего ${Math.round(workoutsStats.totalDuration / 60)}ч активности`}
          icon={<Dumbbell size={20} />}
        />
      </div>

      {/* Dashboard sections details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Recent Journal Entry */}
        <div className="glass-panel padding-20-flex-col-12" style={{ border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <BookOpen size={16} /> Последняя запись дневника
            </h3>
            <Link to="/reflect/journal" className="btn btn--secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Дневник</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {journalStats.lastEntry ? (
            <div className="flex-col-8" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {journalStats.lastEntry.title}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {formatDate(journalStats.lastEntry.dateISO)}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineClamp: 3, WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                {journalStats.lastEntry.content}
              </p>
              <div style={{ fontSize: '0.75rem', marginTop: 'auto', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                Настроение: {journalStats.lastEntry.mood}%
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Нет записей в дневнике рефлексии
            </div>
          )}
        </div>

        {/* Schedule & Habits summary */}
        <div className="glass-panel padding-20-flex-col-12" style={{ border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Calendar size={16} /> Продуктивность сегодня
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link to="/reflect/schedule" className="btn btn--secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                План
              </Link>
              <Link to="/reflect/habits" className="btn btn--secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                Привычки
              </Link>
            </div>
          </div>

          <div className="flex-col-12" style={{ flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Расписание дня</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {scheduleStats.todayTotal > 0 
                    ? `Запланировано ${scheduleStats.todayTotal} событий, выполнено ${scheduleStats.todayCompleted}` 
                    : 'События на сегодня не запланированы'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Трекер привычек</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {habitsStats.totalActive > 0 
                    ? `Выполнено ${habitsStats.completedToday} из ${habitsStats.totalActive} активных привычек` 
                    : 'Активные привычки отсутствуют'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspirational thought from Museum */}
      <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Quote size={16} /> Случайная мысль дня
          </h3>
          <Link to="/reflect/thoughts" className="btn btn--secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Музей мыслей</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {museumThought ? (
          <div style={{ position: 'relative', padding: '10px 16px', borderLeft: '3px solid var(--accent)', margin: '4px 0' }}>
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              "{museumThought.content}"
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                {museumThought.category || 'Общее'}
              </span>
              {museumThought.tags.map((tag, idx) => (
                <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--accent)', background: 'rgba(99,102,241,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            В Музее мыслей пока пусто. Запишите идею, инсайт или цитату.
          </div>
        )}
      </div>
    </div>
  );
}
