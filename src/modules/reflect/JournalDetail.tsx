import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { ArrowLeft, Edit2, Trash2, Calendar, Smile } from 'lucide-react';
import { ConfirmDialog } from '../../ui';
import { formatDate, getMoodEmoji, nowISO } from '../../cognitive/helpers';
import JournalModal from './JournalModal';
import { type JournalEntry } from '../../types';

export default function JournalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const entry = useMemo(() => {
    return data.journal.find((j) => j.id === id);
  }, [data.journal, id]);

  const handleSaveEntry = useCallback(
    (entryData: Partial<JournalEntry>) => {
      if (entry) {
        dispatch({
          type: 'UPDATE_ENTITY',
          entity: 'journal',
          id: entry.id,
          payload: { ...entryData, updatedAt: nowISO() },
        });
        addToast(t('journal.saved'), 'success');
      }
      setIsEditOpen(false);
    },
    [entry, dispatch, addToast, t]
  );

  const confirmDelete = useCallback(() => {
    if (entry) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'journal',
        id: entry.id,
      });
      addToast(t('reflect.journal.toast_deleted'), 'warning');
      navigate('/reflect/journal');
    }
    setIsDeleteOpen(false);
  }, [entry, dispatch, addToast, t, navigate]);

  if (!entry) {
    return (
      <div className="flex-col-24 fade-in-entry" style={{ padding: '24px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>{t('reflect.journal.empty_title')}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{t('common.no_data')}</p>
        <button
          className="btn btn--secondary"
          onClick={() => navigate('/reflect/journal')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            margin: '16px auto 0 auto',
          }}
        >
          <ArrowLeft size={16} />
          <span>{t('action.back')}</span>
        </button>
      </div>
    );
  }

  const moodInfo = getMoodEmoji(entry.mood);

  return (
    <div className="flex-col-24 fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn btn--secondary"
          onClick={() => navigate('/reflect/journal')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>{t('action.back')}</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn--secondary"
            onClick={() => setIsEditOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit2 size={14} />
            <span>{t('action.edit')}</span>
          </button>
          <button
            className="btn btn--secondary btn-padding-4-6-red"
            onClick={() => setIsDeleteOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
          >
            <Trash2 size={14} />
            <span>{t('common.delete')}</span>
          </button>
        </div>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '32px',
          border: '1px solid var(--border)',
          borderLeft: `6px solid ${moodInfo.color}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>{moodInfo.emoji}</span>
            <h1
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {entry.title}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {formatDate(entry.dateISO)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Smile size={14} />
              {t('reflect.journal.mood_prefix')} {entry.mood}%
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: '1rem',
            color: 'var(--text-primary)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            background: 'rgba(255,255,255,0.01)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          {entry.content}
        </div>
      </div>

      {isEditOpen && (
        <JournalModal
          isOpen={isEditOpen}
          entry={entry}
          onClose={() => setIsEditOpen(false)}
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
