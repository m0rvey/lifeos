import { useState, useMemo, useCallback, memo, type FormEvent } from 'react';
import { type Habit } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Plus, Flame, CheckSquare, Trash2, Calendar, Sparkles } from 'lucide-react';
import { StatCard, ConfirmDialog } from '../../ui';
import { calcStreak, getStreakLevel } from '../../cognitive/habits';
import { uid, nowISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

const catColors = {
  social: 'var(--color-purple, #8b5cf6)',
  health: 'var(--color-red, #ef4444)',
  mind: 'var(--color-blue, #2563eb)',
  productivity: 'var(--color-yellow, #f59e0b)',
  other: 'var(--color-grey, #64748b)'
};

// Generates an array of last N dates (YYYY-MM-DD)
function getLastNDates(n: number): string[] {
  const list = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12, 0, 0);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    list.push(`${yyyy}-${mm}-${dd}`);
  }
  return list;
}

interface HabitRowProps {
  habit: Habit;
  last7Days: string[];
  catColors: Record<string, string>;
  onToggleDate: (habit: Habit, date: string) => void;
  onDelete: (id: string) => void;
}

const HabitRow = memo(function HabitRow({
  habit,
  last7Days,
  catColors,
  onToggleDate,
  onDelete,
}: HabitRowProps) {
  const { t } = useI18n();
  const streak = calcStreak(habit.completedDates);
  const streakLevel = getStreakLevel(streak.current);

  return (
    <tr className="habits-table-row">
      <td>
        <div className="flex-row-center-gap8">
          <span className="habits-category-dot" style={{ background: catColors[habit.category] }} />
          <span className="text-semibold">{habit.title}</span>
        </div>
        <span className="habits-category-label">
          {t(`reflect.habits.cat_${habit.category}`)}
        </span>
      </td>
      <td style={{ textAlign: 'center' }}>
        <div className="habits-streak-wrapper" style={{ color: streakLevel > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
          <Flame size={14} fill={streakLevel > 0 ? 'var(--accent)' : 'none'} />
          <strong className="text-md-scale">{streak.current}</strong>
          <span className="habits-streak-max">/ max {streak.max}</span>
        </div>
      </td>

      {/* 7 checkbox columns */}
      {last7Days.map((date) => {
        const isCompleted = habit.completedDates.includes(date);
        return (
          <td key={date} style={{ textAlign: 'center' }}>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => onToggleDate(habit, date)}
              className="habits-checkbox-input"
            />
          </td>
        );
      })}

      <td style={{ textAlign: 'center' }}>
        <button
          onClick={() => onDelete(habit.id)}
          className="habits-delete-btn"
          title={t('action.delete')}
          aria-label={t('reflect.habits.delete_aria', { title: habit.title })}
        >
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  );
});

export default function HabitsPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t, lang } = useI18n();

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Habit['category']>('mind');

  // Deletion dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  // Active dates range for checklists (last 7 days)
  const last7Days = useMemo(() => getLastNDates(7), []);

  // 30 days dates list for heatmap
  const last30Days = useMemo(() => getLastNDates(30), []);

  const handleAddNew = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: Habit = {
      id: `habit_${uid()}`,
      title: newTitle.trim(),
      category: newCategory,
      completedDates: [],
      isActive: true,
      createdAt: nowISO(),
      updatedAt: nowISO()
    };

    dispatch({
      type: 'ADD_ENTITY',
      entity: 'habits',
      payload: newHabit
    });

    setNewTitle('');
    addToast(t('reflect.habits.toast_created', { title: newHabit.title }), 'success');
  };

  const handleDeleteTrigger = useCallback((id: string) => {
    setHabitToDelete(id);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (habitToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'habits',
        id: habitToDelete
      });
      setHabitToDelete(null);
      addToast(t('reflect.habits.toast_deleted'), 'warning');
    }
    setIsDeleteOpen(false);
  }, [habitToDelete, dispatch, addToast, t]);

  const handleToggleHabitDate = useCallback((habit: Habit, dateStr: string) => {
    const dates = [...habit.completedDates];
    const index = dates.indexOf(dateStr);
    
    if (index >= 0) {
      // Remove date (uncheck)
      dates.splice(index, 1);
    } else {
      // Add date (check)
      dates.push(dateStr);
    }

    dispatch({
      type: 'UPDATE_ENTITY',
      entity: 'habits',
      id: habit.id,
      payload: { completedDates: dates }
    });
  }, [dispatch]);

  // Compute stats for heat map (completions count per day)
  const heatmapStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
    last30Days.forEach(date => {
      stats[date] = 0;
    });

    data.habits.forEach(h => {
      h.completedDates.forEach(date => {
        const key = date.slice(0, 10);
        if (stats[key] !== undefined) {
          stats[key]++;
        }
      });
    });

    return stats;
  }, [data.habits, last30Days]);

  const maxCompletionsPerDay = useMemo(() => {
    const vals = Object.values(heatmapStats);
    return Math.max(...vals, 1);
  }, [heatmapStats]);

  const getHeatmapColor = (completions: number) => {
    if (completions === 0) return 'rgba(255,255,255,0.02)';
    const pct = completions / maxCompletionsPerDay;
    // Shade of accent color based on pct
    return `color-mix(in srgb, var(--accent) ${Math.round((0.15 + pct * 0.85) * 100)}%, transparent)`;
  };

  // Streak summaries
  const totalMaxStreak = useMemo(() => {
    return data.habits.reduce((max, h) => Math.max(max, calcStreak(h.completedDates).max), 0);
  }, [data.habits]);

  return (
    <div className="fade-in-entry flex-col-24">
      <div className="flex-row-between">
        <div>
          <h2 className="text-lg-scale text-bold no-margin">
            {t('reflect.habits.title')}
          </h2>
          <p className="text-sm-scale text-secondary margin-top4">
            {t('reflect.habits.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats summaries */}
      <div className="grid-cols-stats">
        <StatCard
          label={t('reflect.habits.stat_total')}
          value={data.habits.length}
          subtitle={t('reflect.habits.stat_total_desc')}
          icon={<CheckSquare size={20} />}
          accent
        />
        <StatCard
          label={t('reflect.habits.stat_streak')}
          value={t('reflect.habits.days_count', { count: totalMaxStreak })}
          subtitle={t('reflect.habits.stat_streak_desc')}
          icon={<Flame size={20} />}
          trend="up"
        />
      </div>

      {/* Heatmap Compliance Grid */}
      <div className="glass-panel padding-20-flex-col-12">
        <h3 className="habits-section-title">
          <Calendar size={14} />
          <span>{t('reflect.habits.heatmap_title')}</span>
        </h3>

        <div className="habits-heatmap-container">
          {last30Days.map((date) => {
            const count = heatmapStats[date] || 0;
            const cellColor = getHeatmapColor(count);
            
            // Format label for tooltip
            const dayLabel = new Date(date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short' });
            
            return (
              <div
                key={date}
                className="habits-heatmap-cell"
                style={{
                  background: cellColor,
                  color: count > 0 ? '#fff' : 'var(--text-secondary)'
                }}
                title={t('reflect.habits.heatmap_tooltip', { dayLabel, count })}
              >
                {new Date(date).getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Checklist items */}
      <div className="glass-panel padding-20-flex-col-16">
        <div className="flex-row-between-wrap">
          <h3 className="habits-section-title">
            <Sparkles size={14} />
            <span>{t('reflect.habits.grid_title')}</span>
          </h3>

          <form onSubmit={handleAddNew} className="habits-form">
            <input
              type="text"
              placeholder={t('reflect.habits.placeholder_new')}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="input habits-form-input"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Habit['category'])}
              className="habits-form-select"
            >
              <option value="mind">{t('reflect.habits.cat_mind')}</option>
              <option value="health">{t('reflect.habits.cat_health')}</option>
              <option value="social">{t('reflect.habits.cat_social')}</option>
              <option value="productivity">{t('reflect.habits.cat_productivity')}</option>
              <option value="other">{t('reflect.habits.cat_other')}</option>
            </select>
            <button type="submit" className="btn btn--primary habits-form-btn">
              <Plus size={14} />
              <span>{t('reflect.habits.action_create')}</span>
            </button>
          </form>
        </div>

        {/* Desktop grid layout for checklist */}
        <div className="habits-table-wrapper">
          <table className="habits-table">
            <thead>
              <tr className="habits-table-header-row">
                <th>{t('reflect.habits.column_title')}</th>
                <th style={{ width: '120px', textAlign: 'center' }}>{t('reflect.habits.column_streak')}</th>
                {last7Days.map((date) => {
                  const dayNum = new Date(date).getDate();
                  const weekday = new Date(date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { weekday: 'short' });
                  return (
                    <th key={date} style={{ width: '60px', textAlign: 'center' }}>
                      <span className="habits-table-weekday">{weekday}</span>
                      <span>{dayNum}</span>
                    </th>
                  );
                })}
                <th style={{ width: '60px', textAlign: 'center' }} />
              </tr>
            </thead>
            <tbody>
              {data.habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  last7Days={last7Days}
                  catColors={catColors}
                  onToggleDate={handleToggleHabitDate}
                  onDelete={handleDeleteTrigger}
                />
              ))}

              {data.habits.length === 0 && (
                <tr>
                  <td colSpan={10} className="habits-empty-cell">
                    {t('reflect.habits.empty_message')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

        {isDeleteOpen && (
          <ConfirmDialog
            isOpen={isDeleteOpen}
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteOpen(false)}
            title={t('reflect.habits.confirm_delete_title')}
            message={t('reflect.habits.confirm_delete_message')}
            confirmLabel={t('action.delete')}
            cancelLabel={t('action.cancel')}
            variant="danger"
          />
        )}
    </div>
  );
}
