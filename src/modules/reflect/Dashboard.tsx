import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
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
  Clock,
} from 'lucide-react';
import { StatCard, EmptyState } from '../../ui';
import { formatDate, todayISO, getMoodLabel } from '../../cognitive/helpers';

export default function Dashboard() {
  const { data } = useData();
  const { t } = useI18n();

  const journalStats = useMemo(() => {
    const total = data.journal.length;
    if (total === 0) return { total, avgMood: 0, lastEntry: null };
    const avgMood = Math.round(data.journal.reduce((sum, e) => sum + e.mood, 0) / total);
    const sorted = [...data.journal].sort(
      (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
    return { total, avgMood, lastEntry: sorted[0] };
  }, [data.journal]);

  const knowledgeStats = useMemo(() => {
    const total = data.knowledge.length;
    const categories = new Set(data.knowledge.map((k) => k.category));
    return { total, categoryCount: categories.size };
  }, [data.knowledge]);

  const habitsStats = useMemo(() => {
    const activeHabits = data.habits.filter((h) => h.isActive);
    const totalActive = activeHabits.length;
    const today = todayISO();
    const completedToday = activeHabits.filter((h) => h.completedDates.includes(today)).length;
    return { totalActive, completedToday };
  }, [data.habits]);

  const scheduleStats = useMemo(() => {
    const today = todayISO();
    const todayBlocks = data.schedule.filter((b) => b.dateISO.startsWith(today));
    const completedBlocks = todayBlocks.filter((b) => b.isCompleted).length;
    return { todayTotal: todayBlocks.length, todayCompleted: completedBlocks };
  }, [data.schedule]);

  const workoutsStats = useMemo(() => {
    const total = data.workouts.length;
    const totalDuration = data.workouts.reduce((acc, w) => acc + w.durationMin, 0);
    return { total, totalDuration };
  }, [data.workouts]);

  const museumThought = useMemo(() => {
    if (data.thoughts.length === 0) return null;
    const day = new Date().getDate();
    const index = day % data.thoughts.length;
    return data.thoughts[index];
  }, [data.thoughts]);

  return (
    <div className="flex-col-24 fade-in-entry">
      <div>
        <h2 className="dash-title">{t('dashboard.title')}</h2>
        <p className="dash-subtitle">{t('dashboard.description')}</p>
      </div>

      <div className="dash-stats-grid">
        <StatCard
          label={t('dashboard.moodIndex')}
          value={journalStats.total > 0 ? `${journalStats.avgMood}%` : '\u2014'}
          subtitle={
            journalStats.total > 0 ? getMoodLabel(journalStats.avgMood) : t('dashboard.noEntries')
          }
          icon={<Smile size={20} />}
          accent
        />
        <StatCard
          label={t('dashboard.knowledgeBase')}
          value={knowledgeStats.total}
          subtitle={`${knowledgeStats.categoryCount} ${t('dashboard.categories')}`}
          icon={<Brain size={20} />}
        />
        <StatCard
          label={t('dashboard.habitsToday')}
          value={
            habitsStats.totalActive > 0
              ? `${habitsStats.completedToday} / ${habitsStats.totalActive}`
              : '0'
          }
          subtitle={t('dashboard.habitsCompleted')}
          icon={<Award size={20} />}
          trend={
            habitsStats.completedToday === habitsStats.totalActive && habitsStats.totalActive > 0
              ? 'up'
              : 'neutral'
          }
        />
        <StatCard
          label={t('dashboard.workouts')}
          value={workoutsStats.total}
          subtitle={`${t('dashboard.total')} ${Math.round(workoutsStats.totalDuration / 60)}${t('dashboard.hoursActive')}`}
          icon={<Dumbbell size={20} />}
        />
      </div>

      <div className="dash-panels-grid">
        <div className="glass-panel padding-20-flex-col-12">
          <div className="dash-panel-header">
            <h3 className="dash-panel-h3">
              <BookOpen size={16} /> {t('dashboard.latestJournalEntry')}
            </h3>
            <Link to="/reflect/journal" className="btn btn--secondary dash-btn-sm">
              <span>{t('dashboard.journal')}</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {journalStats.lastEntry ? (
            <div className="flex-col-8 dash-flex-1">
              <div className="dash-panel-header">
                <strong className="dash-info-label">
                  {journalStats.lastEntry.title}
                </strong>
                <span className="dash-info-sub">
                  {formatDate(journalStats.lastEntry.dateISO)}
                </span>
              </div>
              <p className="dash-line-clamp">
                {journalStats.lastEntry.content}
              </p>
              <div className="dash-mood-badge">
                {t('dashboard.mood')}: {journalStats.lastEntry.mood}%
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={32} />}
              title={t('dashboard.noReflectionEntries')}
            />
          )}
        </div>

        <div className="glass-panel padding-20-flex-col-12">
          <div className="dash-panel-header">
            <h3 className="dash-panel-h3">
              <Calendar size={16} /> {t('dashboard.productivityToday')}
            </h3>
            <div className="dash-btn-group">
              <Link to="/reflect/schedule" className="btn btn--secondary dash-btn-sm">
                {t('dashboard.plan')}
              </Link>
              <Link to="/reflect/habits" className="btn btn--secondary dash-btn-sm">
                {t('dashboard.habits')}
              </Link>
            </div>
          </div>

          <div className="flex-col-12 dash-flex-1 dash-justify-center">
            <div className="flex-row-center-gap12">
              <div className="dash-icon-box dash-icon-box--accent">
                <Clock size={20} />
              </div>
              <div>
                <div className="dash-info-label">{t('dashboard.daySchedule')}</div>
                <div className="dash-info-sub">
                  {scheduleStats.todayTotal > 0
                    ? `${t('dashboard.planned')} ${scheduleStats.todayTotal} ${t('dashboard.events')}, ${t('dashboard.completed')} ${scheduleStats.todayCompleted}`
                    : t('dashboard.noEventsToday')}
                </div>
              </div>
            </div>

            <div className="flex-row-center-gap12">
              <div className="dash-icon-box dash-icon-box--success">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="dash-info-label">{t('dashboard.habitTracker')}</div>
                <div className="dash-info-sub">
                  {habitsStats.totalActive > 0
                    ? `${t('dashboard.completed')} ${habitsStats.completedToday} ${t('dashboard.of')} ${habitsStats.totalActive} ${t('dashboard.activeHabits')}`
                    : t('dashboard.noActiveHabits')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel padding-20-flex-col-12">
        <div className="dash-panel-header">
          <h3 className="dash-panel-h3">
            <Quote size={16} /> {t('dashboard.randomThoughtOfDay')}
          </h3>
          <Link to="/reflect/thoughts" className="btn btn--secondary dash-btn-sm">
            <span>{t('dashboard.museumOfThoughts')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {museumThought ? (
          <div className="dash-thought-block">
            <p className="dash-thought-quote">
              &ldquo;{museumThought.content}&rdquo;
            </p>
            <div className="dash-chip-group">
              <span className="dash-chip">
                {museumThought.category || t('dashboard.general')}
              </span>
              {museumThought.tags.map((tag, idx) => (
                <span key={idx} className="dash-chip--accent dash-chip">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
            <EmptyState
              icon={<Quote size={32} />}
              title={t('dashboard.museumEmpty')}
            />
          )}
      </div>
    </div>
  );
}
