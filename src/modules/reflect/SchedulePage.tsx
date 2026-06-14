import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type ScheduleBlock } from '../../types';
import { Plus, Trash2, Edit2, Clock, Calendar, CheckSquare, Square } from 'lucide-react';
import { StatCard, EmptyState, ConfirmDialog } from '../../ui';
import { uid, nowISO, todayISO, formatDuration, formatDate } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';
import ScheduleModal from './ScheduleModal';

const typeColors: Record<ScheduleBlock['type'], string> = {
  work: '#3b82f6',      // Blue
  personal: '#10b981',  // Green
  health: '#ef4444',    // Red
  social: '#8b5cf6',    // Purple
  learning: '#f59e0b',  // Yellow
  rest: '#64748b'       // Grey
};

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function computeEndTime(startTime: string, duration: number): string {
  const total = parseTime(startTime) + duration;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function SchedulePage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

  const [activeDate, setActiveDate] = useState(todayISO());
  const [isOpen, setIsOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  
  // For clicking on gaps
  const [defaultStart, setDefaultStart] = useState('09:00');
  const [defaultDur, setDefaultDur] = useState(60);

  // Delete dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  // Filter schedule for the selected date
  const dayBlocks = useMemo(() => {
    return data.schedule
      .filter((b) => b.dateISO.startsWith(activeDate))
      .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  }, [data.schedule, activeDate]);

  const totalScheduledMinutes = useMemo(() => {
    return dayBlocks.reduce((sum, b) => sum + b.durationMin, 0);
  }, [dayBlocks]);

  const handleAddNew = () => {
    setEditingBlock(null);
    setDefaultStart('09:00');
    setDefaultDur(60);
    setIsOpen(true);
  };

  const handleEdit = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setIsOpen(true);
  };

  const handleSaveBlock = useCallback((blockData: Partial<ScheduleBlock>) => {
    if (editingBlock) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'schedule',
        id: editingBlock.id,
        payload: blockData
      });
      addToast(t('reflect.schedule.toast_updated'), 'success');
    } else {
      const newBlock: ScheduleBlock = {
        id: `sched_${uid()}`,
        title: blockData.title || '',
        dateISO: blockData.dateISO || new Date(activeDate).toISOString(),
        startTime: blockData.startTime || '09:00',
        durationMin: blockData.durationMin || 60,
        type: blockData.type || 'work',
        isCompleted: blockData.isCompleted || false,
        tags: [],
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'schedule',
        payload: newBlock
      });
      addToast(t('reflect.schedule.toast_created'), 'success');
    }
    setIsOpen(false);
  }, [editingBlock, activeDate, dispatch, addToast, t]);

  const handleDeleteTrigger = (id: string) => {
    setBlockToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = useCallback(() => {
    if (blockToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'schedule',
        id: blockToDelete
      });
      setBlockToDelete(null);
      addToast(t('reflect.schedule.toast_deleted'), 'warning');
    }
    setIsDeleteOpen(false);
  }, [blockToDelete, dispatch, addToast, t]);

  const handleToggleComplete = useCallback((block: ScheduleBlock) => {
    dispatch({
      type: 'UPDATE_ENTITY',
      entity: 'schedule',
      id: block.id,
      payload: { isCompleted: !block.isCompleted }
    });
    addToast(block.isCompleted ? t('reflect.schedule.toast_uncompleted') : t('reflect.schedule.toast_completed'), 'success');
  }, [dispatch, addToast, t]);

  const handleGapClick = (startTime: string, duration: number) => {
    setEditingBlock(null);
    setDefaultStart(startTime);
    setDefaultDur(duration);
    setIsOpen(true);
  };

  const translateType = (type: ScheduleBlock['type']): string => {
    switch (type) {
      case 'work': return t('reflect.schedule.type_work');
      case 'personal': return t('reflect.schedule.type_personal');
      case 'health': return t('reflect.schedule.type_health');
      case 'social': return t('reflect.schedule.type_social');
      case 'learning': return t('reflect.schedule.type_learning');
      case 'rest': return t('reflect.schedule.type_rest');
      default: return type;
    }
  };

  return (
    <div className="fade-in-entry flex-col-24">
      <div className="flex-row-between-wrap">
        <div>
          <h2 className="text-lg-scale text-bold no-margin">
            {t('reflect.schedule.title')}
          </h2>
          <p className="text-sm-scale text-secondary margin-top4">
            {t('reflect.schedule.subtitle')}
          </p>
        </div>

        <div className="flex-row-center-gap12">
          <input 
            type="date" 
            value={activeDate} 
            onChange={(e) => setActiveDate(e.target.value)} 
            className="input"
          />
          <button className="btn btn--primary flex-row-center-gap6" onClick={handleAddNew}>
            <Plus size={16} />
            <span>{t('reflect.schedule.action_add')}</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-cols-stats">
        <StatCard
          label={t('reflect.schedule.stat_time')}
          value={formatDuration(totalScheduledMinutes)}
          subtitle={t('reflect.schedule.stat_time_desc')}
          icon={<Clock size={20} />}
          accent
        />
        <StatCard
          label={t('reflect.schedule.stat_blocks')}
          value={dayBlocks.length}
          subtitle={t('reflect.schedule.date_prefix', { date: formatDate(new Date(activeDate).toISOString()) })}
          icon={<Calendar size={20} />}
          trend="neutral"
        />
      </div>

      {/* Timeline view panel */}
      <div className="glass-panel schedule-timeline-panel">
        {dayBlocks.length > 0 ? (
          <div className="schedule-timeline-wrapper">
            {/* Timeline vertical bar */}
            <div className="schedule-vertical-line" />

            {dayBlocks.map((block, idx) => {
              const prevEnd = idx > 0 ? parseTime(dayBlocks[idx - 1].startTime) + dayBlocks[idx - 1].durationMin : -1;
              const blockStart = parseTime(block.startTime);
              const gap = idx > 0 ? blockStart - prevEnd : 0;
              const gapHour = idx > 0 ? Math.floor(prevEnd / 60) : 0;
              const gapMin = idx > 0 ? prevEnd % 60 : 0;
              const gapStartString = `${String(gapHour).padStart(2, '0')}:${String(gapMin).padStart(2, '0')}`;

              return (
                <div key={block.id}>
                  {/* Gap Indicator */}
                  {gap > 0 && (
                    <div 
                      onClick={() => handleGapClick(gapStartString, gap)}
                      className="schedule-gap-btn"
                      title={t('reflect.schedule.gap_title')}
                    >
                      {t('reflect.schedule.gap_text', { duration: formatDuration(gap), start: gapStartString })}
                    </div>
                  )}

                  {/* Schedule Block Card */}
                  <div
                    className={`schedule-block-card ${block.isCompleted ? 'completed' : ''}`}
                  >
                    {/* Visual left type stripe */}
                    <div className="schedule-block-stripe" style={{
                      background: typeColors[block.type] || '#999',
                    }} />

                    {/* Clock Times Block */}
                    <div className="schedule-block-time-col">
                      <span>{block.startTime}</span>
                      <span className="schedule-block-end-time">
                        {computeEndTime(block.startTime, block.durationMin)}
                      </span>
                    </div>

                    {/* Content Block */}
                    <div className="schedule-block-content-col">
                      <button
                        onClick={() => handleToggleComplete(block)}
                        className={`schedule-block-checkbox ${block.isCompleted ? 'completed' : ''}`}
                      >
                        {block.isCompleted ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>

                      <span 
                        className="badge" 
                        style={{
                          background: `${typeColors[block.type]}15`,
                          color: typeColors[block.type],
                          border: `1px solid ${typeColors[block.type]}30`,
                        }}
                      >
                        {translateType(block.type)}
                      </span>

                      <span className={`schedule-block-title ${block.isCompleted ? 'completed' : ''}`}>
                        {block.title}
                      </span>
                      
                      <span className="schedule-block-duration">
                        {formatDuration(block.durationMin)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="schedule-block-actions">
                      <button
                        className="btn btn--secondary btn-padding-4-6"
                        onClick={() => handleEdit(block)}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn btn--secondary btn-padding-4-6-red"
                        onClick={() => handleDeleteTrigger(block.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Clock size={48} />}
            title={t('reflect.schedule.empty_title')}
            description={t('reflect.schedule.empty_desc', { date: formatDate(new Date(activeDate).toISOString()) })}
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>{t('reflect.schedule.action_schedule')}</span>
              </button>
            }
          />
        )}
      </div>

        {isOpen && (
          <ScheduleModal
            isOpen={isOpen}
            block={editingBlock}
            onClose={() => setIsOpen(false)}
            onSave={handleSaveBlock}
            defaultStartTime={defaultStart}
            defaultDuration={defaultDur}
            defaultDate={activeDate}
          />
        )}

        {isDeleteOpen && (
          <ConfirmDialog
            isOpen={isDeleteOpen}
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteOpen(false)}
            title={t('reflect.schedule.confirm_delete_title')}
            message={t('reflect.schedule.confirm_delete_message')}
            confirmLabel={t('common.delete')}
            cancelLabel={t('common.cancel')}
            variant="danger"
          />
        )}
    </div>
  );
}
