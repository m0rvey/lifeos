import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type Task } from '../../types';
import { useI18n } from '../../i18n';
import {
  Plus,
  CheckSquare,
  Square,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  Zap,
  ListTodo,
  Grid2X2,
} from 'lucide-react';
import { StatCard, EmptyState, ConfirmDialog } from '../../ui';
import { uid, nowISO, formatDate } from '../../cognitive/helpers';
import TaskModal from './TaskModal';

export default function TasksPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const pendingTasks = useMemo(() => data.tasks.filter((t) => !t.isCompleted), [data.tasks]);
  const completedTasks = useMemo(() => data.tasks.filter((t) => t.isCompleted), [data.tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return pendingTasks;
    if (filter === 'completed') return completedTasks;
    return data.tasks;
  }, [data.tasks, filter, pendingTasks, completedTasks]);

  // Quadrants breakdown for Eisenhower Matrix (based on active pending tasks)
  const matrixQuadrants = useMemo(() => {
    const q1: Task[] = []; // Urgent & Important
    const q2: Task[] = []; // Not Urgent & Important
    const q3: Task[] = []; // Urgent & Not Important
    const q4: Task[] = []; // Not Urgent & Not Important

    filteredTasks.forEach((task) => {
      if (task.urgency >= 50 && task.emotion >= 50) {
        q1.push(task);
      } else if (task.urgency < 50 && task.emotion >= 50) {
        q2.push(task);
      } else if (task.urgency >= 50 && task.emotion < 50) {
        q3.push(task);
      } else {
        q4.push(task);
      }
    });

    return { q1, q2, q3, q4 };
  }, [filteredTasks]);

  const handleToggleComplete = useCallback(
    (task: Task) => {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'tasks',
        id: task.id,
        payload: { isCompleted: !task.isCompleted, updatedAt: nowISO() },
      });
      addToast(
        !task.isCompleted ? 'Задача выполнена' : 'Задача возвращена в работу',
        'success'
      );
    },
    [dispatch, addToast]
  );

  const handleOpenAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = useCallback(
    (taskData: Partial<Task>) => {
      if (editingTask) {
        dispatch({
          type: 'UPDATE_ENTITY',
          entity: 'tasks',
          id: editingTask.id,
          payload: { ...taskData, updatedAt: nowISO() },
        });
        addToast(t('tasks.toast_updated'), 'success');
      } else {
        const newTask: Task = {
          id: `task_${uid()}`,
          title: taskData.title || '',
          description: taskData.description || '',
          urgency: taskData.urgency ?? 50,
          emotion: taskData.emotion ?? 50,
          deadlineISO: taskData.deadlineISO || null,
          tags: taskData.tags || [],
          isCompleted: taskData.isCompleted || false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        dispatch({
          type: 'ADD_ENTITY',
          entity: 'tasks',
          payload: newTask,
        });
        addToast(t('tasks.toast_created'), 'success');
      }
      setIsModalOpen(false);
    },
    [editingTask, dispatch, addToast, t]
  );

  const handleDeleteTrigger = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = useCallback(() => {
    if (taskToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'tasks',
        id: taskToDelete,
      });
      setTaskToDelete(null);
      addToast(t('tasks.toast_deleted'), 'warning');
    }
    setIsDeleteOpen(false);
  }, [taskToDelete, dispatch, addToast, t]);

  const renderTaskCard = (task: Task) => {
    return (
      <div
        key={task.id}
        className="glass-panel"
        style={{
          padding: '12px 14px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          opacity: task.isCompleted ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <button
              className="btn btn--secondary"
              style={{ padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => handleToggleComplete(task)}
            >
              {task.isCompleted ? (
                <CheckSquare size={18} style={{ color: 'var(--success)' }} />
              ) : (
                <Square size={18} style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: task.isCompleted ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="btn btn--secondary"
              style={{ padding: '2px 4px' }}
              onClick={() => handleOpenEdit(task)}
              title="Edit"
            >
              <Edit2 size={12} />
            </button>
            <button
              className="btn btn--secondary btn-padding-4-6-red"
              style={{ padding: '2px 4px' }}
              onClick={() => handleDeleteTrigger(task.id)}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {task.description && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0 26px', lineHeight: 1.4 }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 0 26px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {task.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.65rem',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  color: 'var(--accent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Tag size={9} />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          {task.deadlineISO && (
            <span style={{ fontSize: '0.7rem', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={11} />
              <span>{formatDate(task.deadlineISO)}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-col-24 fade-in-entry">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t('tasks.title')}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {t('tasks.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* View switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}
          >
            <button
              className={`btn btn--secondary ${viewMode === 'matrix' ? 'btn--primary' : ''}`}
              style={{ padding: '4px 10px', height: '32px', fontSize: '0.75rem', border: 'none' }}
              onClick={() => setViewMode('matrix')}
              title="Matrix"
            >
              <Grid2X2 size={14} style={{ marginRight: '4px' }} />
              <span>Matrix</span>
            </button>
            <button
              className={`btn btn--secondary ${viewMode === 'list' ? 'btn--primary' : ''}`}
              style={{ padding: '4px 10px', height: '32px', fontSize: '0.75rem', border: 'none' }}
              onClick={() => setViewMode('list')}
              title="List"
            >
              <ListTodo size={14} style={{ marginRight: '4px' }} />
              <span>List</span>
            </button>
          </div>

          <button className="btn btn--primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>{t('tasks.action_add')}</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Pending Tasks"
          value={pendingTasks.length}
          subtitle={`${completedTasks.length} completed`}
          icon={<Clock size={20} />}
          accent
        />
        <StatCard
          label="Urgent & Important"
          value={matrixQuadrants.q1.length}
          subtitle="Top Priority Q1"
          icon={<AlertCircle size={20} />}
          trend={matrixQuadrants.q1.length > 3 ? 'down' : 'neutral'}
        />
        <StatCard
          label="Strategic (Q2)"
          value={matrixQuadrants.q2.length}
          subtitle="Important, Not Urgent"
          icon={<Zap size={20} />}
        />
        <StatCard
          label="Completion Rate"
          value={`${data.tasks.length > 0 ? Math.round((completedTasks.length / data.tasks.length) * 100) : 0}%`}
          icon={<CheckSquare size={20} />}
          trend="up"
        />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className={`btn btn--secondary ${filter === 'pending' ? 'btn--primary' : ''}`}
          onClick={() => setFilter('pending')}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Active ({pendingTasks.length})
        </button>
        <button
          className={`btn btn--secondary ${filter === 'all' ? 'btn--primary' : ''}`}
          onClick={() => setFilter('all')}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          All ({data.tasks.length})
        </button>
        <button
          className={`btn btn--secondary ${filter === 'completed' ? 'btn--primary' : ''}`}
          onClick={() => setFilter('completed')}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Matrix View (2x2 Grid) */}
      {viewMode === 'matrix' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Q1: Do First */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderTop: '4px solid var(--error, #f2b8b5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {t('tasks.matrix_q1')}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700 }}>
                {matrixQuadrants.q1.length}
              </span>
            </div>
            <div className="flex-col-8">
              {matrixQuadrants.q1.map(renderTaskCard)}
              {matrixQuadrants.q1.length === 0 && (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                  {t('tasks.empty_quadrant')}
                </div>
              )}
            </div>
          </div>

          {/* Q2: Schedule */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderTop: '4px solid var(--primary, #a78bfa)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {t('tasks.matrix_q2')}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                {matrixQuadrants.q2.length}
              </span>
            </div>
            <div className="flex-col-8">
              {matrixQuadrants.q2.map(renderTaskCard)}
              {matrixQuadrants.q2.length === 0 && (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                  {t('tasks.empty_quadrant')}
                </div>
              )}
            </div>
          </div>

          {/* Q3: Delegate / Quick */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderTop: '4px solid var(--warning, #fbbf24)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {t('tasks.matrix_q3')}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700 }}>
                {matrixQuadrants.q3.length}
              </span>
            </div>
            <div className="flex-col-8">
              {matrixQuadrants.q3.map(renderTaskCard)}
              {matrixQuadrants.q3.length === 0 && (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                  {t('tasks.empty_quadrant')}
                </div>
              )}
            </div>
          </div>

          {/* Q4: Eliminate / Backlog */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderTop: '4px solid var(--text-tertiary, #938f99)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {t('tasks.matrix_q4')}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                {matrixQuadrants.q4.length}
              </span>
            </div>
            <div className="flex-col-8">
              {matrixQuadrants.q4.map(renderTaskCard)}
              {matrixQuadrants.q4.length === 0 && (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic', padding: '16px 0', textAlign: 'center' }}>
                  {t('tasks.empty_quadrant')}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="flex-col-12">
          {filteredTasks.map(renderTaskCard)}
          {filteredTasks.length === 0 && (
            <EmptyState
              icon={<CheckSquare size={48} />}
              title="No tasks to display"
              description="Create a task to track your priorities."
              action={
                <button className="btn btn--primary" onClick={handleOpenAdd}>
                  <Plus size={14} />
                  <span>{t('tasks.action_add')}</span>
                </button>
              }
            />
          )}
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}

      {/* Delete confirmation */}
      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteOpen(false)}
          title="Delete task?"
          message="Are you sure you want to delete this task?"
          confirmLabel={t('action.delete')}
          cancelLabel={t('action.cancel')}
          variant="danger"
        />
      )}
    </div>
  );
}
