import { useState, type FormEvent } from 'react';
import { type JournalEntry } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO, getMoodEmoji } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onSave: (entryData: Partial<JournalEntry>) => void;
}

export default function JournalModal({ isOpen, onClose, entry, onSave }: JournalModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood ?? 50);
  const [dateISO, setDateISO] = useState(entry?.dateISO ? entry.dateISO.slice(0, 10) : todayISO());
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('reflect.journal.error_title'));
      return;
    }
    if (!content.trim()) {
      setError(t('reflect.journal.error_content'));
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      mood,
      dateISO,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        entry ? t('reflect.journal.modal_edit_title') : t('reflect.journal.modal_create_title')
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <div className="form-row">
          <FormField label={t('reflect.journal.field_title')} required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('reflect.journal.placeholder_title')}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('reflect.journal.field_date')}>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label={t('reflect.journal.field_mood')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>{getMoodEmoji(mood).emoji}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <strong style={{ minWidth: '36px', textAlign: 'right' }}>{mood}%</strong>
          </div>
        </FormField>

        <FormField label={t('reflect.journal.field_content')} required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('reflect.journal.placeholder_content')}
            required
            style={{ width: '100%', height: '120px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {entry ? t('reflect.journal.action_save') : t('reflect.journal.action_create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
