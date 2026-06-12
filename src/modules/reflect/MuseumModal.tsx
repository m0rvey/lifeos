import { useState, type FormEvent } from 'react';
import { type Thought } from '../../types';
import { Modal, FormField } from '../../ui';
import { useI18n } from '../../i18n';

interface MuseumModalProps {
  isOpen: boolean;
  onClose: () => void;
  thought: Thought | null;
  onSave: (thoughtData: Partial<Thought>) => void;
}

export default function MuseumModal({ isOpen, onClose, thought, onSave }: MuseumModalProps) {
  const { t } = useI18n();
  const [content, setContent] = useState(thought?.content || '');
  const [category, setCategory] = useState(thought?.category || 'Философия');
  const [tagsText, setTagsText] = useState(thought?.tags ? thought.tags.join(', ') : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError(t('reflect.museum.error_empty'));
      return;
    }

    onSave({
      content: content.trim(),
      category: category.trim(),
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={thought ? t('reflect.museum.modal_edit_title') : t('reflect.museum.modal_create_title')}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && (
          <div className="text-error-bold">
            {error}
          </div>
        )}

        <FormField label={t('reflect.museum.field_thought')} required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('reflect.museum.placeholder_thought')}
            required
            style={{ width: '100%', height: '120px', resize: 'vertical' }}
          />
        </FormField>

        <FormField label={t('reflect.museum.field_category')}>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t('reflect.museum.placeholder_category')}
            style={{ width: '100%' }}
          />
        </FormField>

        <FormField label={t('reflect.museum.field_tags')}>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder={t('reflect.museum.placeholder_tags')}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            {t('reflect.museum.tags_hint')}
          </span>
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {thought ? t('reflect.museum.save') : t('reflect.museum.action_capture')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
