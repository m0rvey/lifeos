import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { type WorkoutRecord } from '../../types';
import { Plus, Dumbbell, Flame, Clock, Edit2, Trash2, Activity } from 'lucide-react';
import { StatCard, EmptyState, ConfirmDialog, DataTable } from '../../ui';
import { formatDate, formatDuration, uid, nowISO, todayISO } from '../../cognitive/helpers';
import { useCrudModal } from '../../hooks/useCrudModal';
import { useI18n } from '../../i18n';
import WorkoutModal from './WorkoutModal';

export default function WorkoutsPage() {
  const { data } = useData();
  const { t } = useI18n();

  const {
    isOpen,
    editingItem: editingWorkout,
    isDeleteOpen,
    openAdd: handleAddNew,
    openEdit: handleEdit,
    openDelete: handleDeleteTrigger,
    handleSave: handleSaveWorkout,
    confirmDelete,
    closeAll,
  } = useCrudModal<WorkoutRecord>({
    entity: 'workouts',
    toastKeys: {
      created: 'reflect.workout.toast_created',
      updated: 'reflect.workout.toast_updated',
      deleted: 'reflect.workout.toast_deleted',
    },
    createDefaults: (workoutData) => ({
      id: `work_${uid()}`,
      type: workoutData?.type || 'gym',
      dateISO: workoutData?.dateISO || todayISO(),
      durationMin: workoutData?.durationMin || 45,
      intensity: workoutData?.intensity || 3,
      description: workoutData?.description || '',
      calories: workoutData?.calories ?? null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }),
  });

  const sortedWorkouts = useMemo(() => {
    return [...data.workouts].sort(
      (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
  }, [data.workouts]);

  const stats = useMemo(() => {
    const total = data.workouts.length;
    if (total === 0) return { total, duration: 0, calories: 0, avgIntensity: 0 };

    const duration = data.workouts.reduce((acc, w) => acc + w.durationMin, 0);
    const calories = data.workouts.reduce((acc, w) => acc + (w.calories || 0), 0);
    const intensitySum = data.workouts.reduce((acc, w) => acc + w.intensity, 0);
    const avgIntensity = Math.round((intensitySum / total) * 10) / 10;

    return { total, duration, calories, avgIntensity };
  }, [data.workouts]);

  const translateWorkoutType = (type: WorkoutRecord['type']): string => {
    switch (type) {
      case 'gym':
        return t('reflect.workout.type_gym_short');
      case 'running':
        return t('reflect.workout.type_running_short');
      case 'swimming':
        return t('reflect.workout.type_swimming_short');
      case 'yoga':
        return t('reflect.workout.type_yoga_short');
      case 'walking':
        return t('reflect.workout.type_walking_short');
      case 'other':
        return t('reflect.workout.type_other_short');
      default:
        return type;
    }
  };

  const getIntensityBadgeColor = (intensity: number) => {
    if (intensity >= 5) return 'var(--error, #ef4444)';
    if (intensity >= 4) return 'var(--warning, #f59e0b)';
    if (intensity >= 3) return 'var(--accent, #6366f1)';
    if (intensity >= 2) return 'var(--success, #16a34a)';
    return 'var(--text-secondary, #94a3b8)';
  };

  return (
    <div className="flex-col-24 fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2
            style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}
          >
            {t('reflect.workout.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {t('reflect.workout.subtitle')}
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={handleAddNew}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>{t('reflect.workout.action_add')}</span>
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          label={t('reflect.workout.stat_total')}
          value={stats.total}
          subtitle={t('reflect.workout.stat_total_desc')}
          icon={<Dumbbell size={20} />}
          accent
        />
        <StatCard
          label={t('reflect.workout.stat_time')}
          value={formatDuration(stats.duration)}
          subtitle={t('reflect.workout.stat_time_desc')}
          icon={<Clock size={20} />}
        />
        <StatCard
          label={t('reflect.workout.stat_calories')}
          value={t('reflect.workout.calories_unit', { val: stats.calories })}
          subtitle={t('reflect.workout.stat_calories_desc')}
          icon={<Flame size={20} />}
        />
        <StatCard
          label={t('reflect.workout.stat_intensity')}
          value={`${stats.avgIntensity} / 5`}
          subtitle={t('reflect.workout.stat_intensity_desc')}
          icon={<Activity size={20} />}
        />
      </div>

      {/* Grid / Table list */}
      <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border)' }}>
        {sortedWorkouts.length > 0 ? (
          <DataTable
            data={sortedWorkouts}
            emptyMessage={t('reflect.workout.empty_message')}
            columns={[
              {
                key: 'dateISO',
                label: t('reflect.workout.column_date'),
                render: (v) => (
                  <span style={{ whiteSpace: 'nowrap' }}>{formatDate(v as string)}</span>
                ),
              },
              {
                key: 'type',
                label: t('reflect.workout.column_type'),
                render: (v) => (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {translateWorkoutType(v as WorkoutRecord['type'])}
                  </span>
                ),
              },
              {
                key: 'durationMin',
                label: t('reflect.workout.column_time'),
                render: (v) => (
                  <span>{t('reflect.workout.minutes_unit', { val: v as number })}</span>
                ),
              },
              {
                key: 'intensity',
                label: t('reflect.workout.column_intensity'),
                render: (v) => (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${getIntensityBadgeColor(v as number)}`,
                      color: getIntensityBadgeColor(v as number),
                    }}
                  >
                    {t('reflect.workout.intensity_of_five', { val: v as number })}
                  </span>
                ),
              },
              {
                key: 'calories',
                label: t('reflect.workout.column_calories'),
                render: (v) => (
                  <span>
                    {v !== null ? t('reflect.workout.calories_unit', { val: v as number }) : '—'}
                  </span>
                ),
              },
              {
                key: 'description',
                label: t('reflect.workout.column_description'),
                render: (v) => (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      display: 'inline-block',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={v as string}
                  >
                    {(v as string) || '—'}
                  </span>
                ),
              },
              {
                key: 'id',
                label: '',
                render: (_, row) => (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn--secondary"
                      style={{ padding: '6px' }}
                      onClick={() => handleEdit(row as WorkoutRecord)}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn btn--secondary btn-padding-4-6-red"
                      onClick={() => handleDeleteTrigger((row as WorkoutRecord).id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            icon={<Dumbbell size={48} />}
            title={t('reflect.workout.empty_title')}
            description={t('reflect.workout.empty_desc')}
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>{t('reflect.workout.action_add')}</span>
              </button>
            }
          />
        )}
      </div>

      {isOpen && (
        <WorkoutModal
          isOpen={isOpen}
          workout={editingWorkout}
          onClose={closeAll}
          onSave={handleSaveWorkout}
        />
      )}

      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onConfirm={confirmDelete}
          onCancel={closeAll}
          title={t('reflect.workout.confirm_delete_title')}
          message={t('reflect.workout.confirm_delete_message')}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          variant="danger"
        />
      )}
    </div>
  );
}
