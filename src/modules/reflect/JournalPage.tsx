import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type JournalEntry } from '../../types';
import { Plus, BookOpen, Smile, Edit2, Trash2 } from 'lucide-react';
import { StatCard, EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, uid, nowISO } from '../../cognitive/helpers';
import JournalModal from './JournalModal';

export default function JournalPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const sortedEntries = useMemo(() => {
    return [...data.journal].sort(
      (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
  }, [data.journal]);

  const avgMood = useMemo(() => {
    if (data.journal.length === 0) return 0;
    const sum = data.journal.reduce((acc, e) => acc + e.mood, 0);
    return Math.round(sum / data.journal.length);
  }, [data.journal]);

  const handleAddNew = () => {
    setEditingEntry(null);
    setIsOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsOpen(true);
  };

  const handleSaveEntry = useCallback((entryData: Partial<JournalEntry>) => {
    if (editingEntry) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'journal',
        id: editingEntry.id,
        payload: { ...entryData, updatedAt: nowISO() }
      });
      addToast('Запись в дневнике сохранена', 'success');
    } else {
      const newEntry: JournalEntry = {
        id: `journ_${uid()}`,
        title: entryData.title || '',
        content: entryData.content || '',
        mood: entryData.mood ?? 50,
        dateISO: entryData.dateISO || new Date().toISOString(),
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'journal',
        payload: newEntry
      });
      addToast('Новая страница рефлексии добавлена в дневник', 'success');
    }
    setIsOpen(false);
  }, [editingEntry, dispatch, addToast]);

  const handleDeleteTrigger = (id: string) => {
    setEntryToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = useCallback(() => {
    if (entryToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'journal',
        id: entryToDelete
      });
      setEntryToDelete(null);
      addToast('Запись дневника удалена', 'warning');
    }
    setIsDeleteOpen(false);
  }, [entryToDelete, dispatch, addToast]);

  const getMoodEmoji = (moodVal: number) => {
    if (moodVal >= 80) return { emoji: '😁', color: 'var(--success, #16a34a)' };
    if (moodVal >= 60) return { emoji: '🙂', color: 'var(--accent)' };
    if (moodVal >= 40) return { emoji: '😐', color: 'var(--text-secondary)' };
    if (moodVal >= 20) return { emoji: '🙁', color: 'var(--warning, #f59e0b)' };
    return { emoji: '😢', color: 'var(--error, #ef4444)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Дневник настроения и рефлексии
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Фиксация ментальных состояний, отслеживание колебаний настроения и анализ мыслей
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Новая запись</span>
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Всего записей"
          value={data.journal.length}
          subtitle="Зафиксированных дней рефлексии"
          icon={<BookOpen size={20} />}
          accent
        />
        <StatCard
          label="Средний индекс настроения"
          value={`${avgMood}%`}
          subtitle="Общий показатель благополучия"
          icon={<Smile size={20} />}
          trend={avgMood >= 60 ? 'up' : 'neutral'}
        />
      </div>

      {/* Journal Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedEntries.length > 0 ? (
          sortedEntries.map((entry) => {
            const moodInfo = getMoodEmoji(entry.mood);
            return (
              <div 
                key={entry.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${moodInfo.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{moodInfo.emoji}</span>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{entry.title}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(entry.dateISO)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '4px 10px', borderRadius: '24px', border: '1px solid var(--border)', fontWeight: 600 }}>
                      Настроение: {entry.mood}%
                    </span>
                    <button className="btn btn--secondary" style={{ padding: '6px' }} onClick={() => handleEdit(entry)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn btn--secondary" style={{ padding: '6px', color: 'var(--error, #ef4444)' }} onClick={() => handleDeleteTrigger(entry.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {entry.content}
                </p>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={<BookOpen size={48} />}
            title="Дневник пуст"
            description="Запишите ваши мысли за сегодня. Рефлексия помогает лучше справляться со стрессом и усталостью."
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>Начать дневник</span>
              </button>
            }
          />
        )}
      </div>

        {isOpen && (
          <JournalModal
            isOpen={isOpen}
            entry={editingEntry}
            onClose={() => setIsOpen(false)}
            onSave={handleSaveEntry}
          />
        )}

        {isDeleteOpen && (
          <ConfirmDialog
            isOpen={isDeleteOpen}
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteOpen(false)}
            title="Удалить страницу из дневника?"
            message="Вы уверены, что хотите удалить эту запись? Данные рефлексии настроения за этот день будут утеряны."
            confirmLabel="Удалить"
            cancelLabel="Отмена"
            variant="danger"
          />
        )}
    </div>
  );
}
