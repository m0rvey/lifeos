import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { type JournalEntry } from '../../types';
import { Plus, BookOpen, Smile, Edit2, Trash2 } from 'lucide-react';
import { StatCard, EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, uid, nowISO, getMoodEmoji } from '../../cognitive/helpers';
import JournalModal from './JournalModal';

export default function JournalPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

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
      addToast(t('journal.saved'), 'success');
    } else {
      const newEntry: JournalEntry = {
        id: `journ_${uid()}`,
        title: entryData.title || '',
        content: entryData.content || '',
        mood: entryData.mood ?? 50,
        dateISO: entryData.dateISO || new Date().toISOString(),
        tags: [],
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'journal',
        payload: newEntry
      });
      addToast(t('reflect.journal.toast_created'), 'success');
    }
    setIsOpen(false);
  }, [editingEntry, dispatch, addToast, t]);

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
      addToast(t('reflect.journal.toast_deleted'), 'warning');
    }
    setIsDeleteOpen(false);
  }, [entryToDelete, dispatch, addToast, t]);

  return (
    <div className="flex-col-24 fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t('reflect.journal.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {t('reflect.journal.subtitle')}
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>{t('reflect.journal.action_new')}</span>
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label={t('reflect.journal.stat_entries')}
          value={data.journal.length}
          subtitle={t('reflect.journal.stat_entries_desc')}
          icon={<BookOpen size={20} />}
          accent
        />
        <StatCard
          label={t('reflect.journal.stat_mood')}
          value={`${avgMood}%`}
          subtitle={t('reflect.journal.stat_mood_desc')}
          icon={<Smile size={20} />}
          trend={avgMood >= 60 ? 'up' : 'neutral'}
        />
      </div>

      {/* Journal Cards List */}
      <div className="flex-col-16">
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
                      {t('reflect.journal.mood_prefix')} {entry.mood}%
                    </span>
                    <button className="btn btn--secondary" style={{ padding: '6px' }} onClick={() => handleEdit(entry)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn btn--secondary btn-padding-4-6-red" onClick={() => handleDeleteTrigger(entry.id)}>
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
            title={t('reflect.journal.empty_title')}
            description={t('reflect.journal.empty_desc')}
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>{t('reflect.journal.action_start')}</span>
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
            title={t('reflect.journal.confirm_delete_title')}
            message={t('reflect.journal.confirm_delete_message')}
            confirmLabel={t('common.delete')}
            cancelLabel={t('common.cancel')}
            variant="danger"
          />
        )}
    </div>
  );
}
