import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type WorkoutRecord } from '../../types';
import { Plus, Dumbbell, Flame, Clock, Edit2, Trash2, Activity } from 'lucide-react';
import { StatCard, EmptyState, ConfirmDialog, DataTable } from '../../ui';
import { formatDate, formatDuration, uid, nowISO, todayISO } from '../../cognitive/helpers';
import { useCrudEntity } from '../../hooks/useCrudEntity';
import WorkoutModal from './WorkoutModal';

export default function WorkoutsPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { editing: editingWorkout, deleting: workoutToDelete, openAdd, openEdit, openDelete, closeAll } = useCrudEntity<WorkoutRecord>();

  const [isOpen, setIsOpen] = useState(false);

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

  const handleAddNew = () => {
    openAdd();
    setIsOpen(true);
  };

  const handleEdit = (workout: WorkoutRecord) => {
    openEdit(workout);
    setIsOpen(true);
  };

  const handleSaveWorkout = useCallback((workoutData: Partial<WorkoutRecord>) => {
    if (editingWorkout) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'workouts',
        id: editingWorkout.id,
        payload: workoutData
      });
      addToast('Тренировка обновлена успешно', 'success');
    } else {
      const newWorkout: WorkoutRecord = {
        id: `work_${uid()}`,
        type: workoutData.type || 'gym',
        dateISO: workoutData.dateISO || todayISO(),
        durationMin: workoutData.durationMin || 45,
        intensity: workoutData.intensity || 3,
        description: workoutData.description || '',
        calories: workoutData.calories ?? null,
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'workouts',
        payload: newWorkout
      });
      addToast('Новая тренировка успешно зарегистрирована', 'success');
    }
    setIsOpen(false);
    closeAll();
  }, [editingWorkout, dispatch, addToast, closeAll]);

  const handleDeleteTrigger = (id: string) => {
    openDelete({ id } as WorkoutRecord);
  };

  const confirmDelete = useCallback(() => {
    if (workoutToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'workouts',
        id: workoutToDelete.id
      });
      addToast('Тренировка удалена из лога', 'warning');
    }
    closeAll();
  }, [workoutToDelete, dispatch, addToast, closeAll]);

  const translateWorkoutType = (type: WorkoutRecord['type']): string => {
    switch (type) {
      case 'gym': return 'Силовая';
      case 'running': return 'Бег';
      case 'swimming': return 'Плавание';
      case 'yoga': return 'Йога';
      case 'walking': return 'Ходьба';
      case 'other': return 'Другое';
      default: return type;
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Спортивный журнал активности
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Логирование физических нагрузок, учет калорий и управление тренировочным процессом
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Добавить занятие</span>
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Всего занятий"
          value={stats.total}
          subtitle="Выполненных тренировок"
          icon={<Dumbbell size={20} />}
          accent
        />
        <StatCard
          label="Общее время"
          value={formatDuration(stats.duration)}
          subtitle="Активного движения"
          icon={<Clock size={20} />}
        />
        <StatCard
          label="Сжёно энергии"
          value={`${stats.calories} ккал`}
          subtitle="Суммарный расход"
          icon={<Flame size={20} />}
        />
        <StatCard
          label="Средняя нагрузка"
          value={`${stats.avgIntensity} / 5`}
          subtitle="Уровень интенсивности"
          icon={<Activity size={20} />}
        />
      </div>

      {/* Grid / Table list */}
      <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border)' }}>
        {sortedWorkouts.length > 0 ? (
          <DataTable
            data={sortedWorkouts}
            emptyMessage="Записи о тренировках отсутствуют"
            columns={[
              {
                key: 'dateISO',
                label: 'Дата',
                render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{formatDate(v as string)}</span>
              },
              {
                key: 'type',
                label: 'Тип тренировки',
                render: (v) => (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {translateWorkoutType(v as WorkoutRecord['type'])}
                  </span>
                )
              },
              {
                key: 'durationMin',
                label: 'Время',
                render: (v) => <span>{v as number} мин</span>
              },
              {
                key: 'intensity',
                label: 'Интенсивность',
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
                      color: getIntensityBadgeColor(v as number)
                    }}
                  >
                    {v as number} из 5
                  </span>
                )
              },
              {
                key: 'calories',
                label: 'Калории',
                render: (v) => <span>{v !== null ? `${v} ккал` : '—'}</span>
              },
              {
                key: 'description',
                label: 'Описание / Заметки',
                render: (v) => (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      display: 'inline-block',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={v as string}
                  >
                    {(v as string) || '—'}
                  </span>
                )
              },
              {
                key: 'id',
                label: '',
                render: (_, row) => (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn--secondary" style={{ padding: '6px' }} onClick={() => handleEdit(row as WorkoutRecord)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn btn--secondary btn-padding-4-6-red" onClick={() => handleDeleteTrigger((row as WorkoutRecord).id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        ) : (
          <EmptyState
            icon={<Dumbbell size={48} />}
            title="Нет спортивных записей"
            description="Добавьте свою первую тренировку, чтобы вести учет активности, отслеживать прогресс и энергобаланс."
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>Добавить занятие</span>
              </button>
            }
          />
        )}
      </div>

        {isOpen && (
          <WorkoutModal
            isOpen={isOpen}
            workout={editingWorkout}
            onClose={() => { setIsOpen(false); closeAll(); }}
            onSave={handleSaveWorkout}
          />
        )}

        {workoutToDelete && (
          <ConfirmDialog
            isOpen={!!workoutToDelete}
            onConfirm={confirmDelete}
            onCancel={closeAll}
            title="Удалить тренировку?"
            message="Вы уверены, что хотите удалить эту запись из спортивного журнала? Это действие необратимо."
            confirmLabel="Удалить"
            cancelLabel="Отмена"
            variant="danger"
          />
        )}
    </div>
  );
}
