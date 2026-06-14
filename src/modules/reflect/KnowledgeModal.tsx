import { useState, type FormEvent } from 'react';
import { type KnowledgeItem } from '../../types';
import { Modal, FormField } from '../../ui';
import { useI18n } from '../../i18n';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: KnowledgeItem | null;
  onSave: (itemData: Partial<KnowledgeItem>) => void;
}

export default function KnowledgeModal({ isOpen, onClose, item, onSave }: KnowledgeModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState(
    item?.category || t('reflect.knowledge.category_books_val')
  );
  const [source, setSource] = useState(item?.source || '');
  const [url, setUrl] = useState(item?.url || '');
  const [content, setContent] = useState(item?.content || '');
  const [tagsText, setTagsText] = useState(item?.tags ? item.tags.join(', ') : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('reflect.knowledge.error_title_empty'));
      return;
    }
    if (!content.trim()) {
      setError(t('reflect.knowledge.error_content_empty'));
      return;
    }

    onSave({
      title: title.trim(),
      category: category.trim(),
      source: source.trim(),
      url: url.trim(),
      content: content.trim(),
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        item ? t('reflect.knowledge.modal_edit_title') : t('reflect.knowledge.modal_create_title')
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <div className="form-row-2-1">
          <FormField label={t('reflect.knowledge.field_title')} required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('reflect.knowledge.placeholder_title')}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('reflect.knowledge.field_category')}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value={t('reflect.knowledge.category_books_val')}>
                {t('reflect.knowledge.category_books')}
              </option>
              <option value={t('reflect.knowledge.category_articles_val')}>
                {t('reflect.knowledge.category_articles')}
              </option>
              <option value={t('reflect.knowledge.category_videos_val')}>
                {t('reflect.knowledge.category_videos')}
              </option>
              <option value={t('reflect.knowledge.category_podcasts_val')}>
                {t('reflect.knowledge.category_podcasts')}
              </option>
              <option value={t('reflect.knowledge.category_methodology_val')}>
                {t('reflect.knowledge.category_methodology')}
              </option>
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label={t('reflect.knowledge.field_source')}>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={t('reflect.knowledge.placeholder_source')}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('reflect.knowledge.field_url')}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label={t('reflect.knowledge.field_content')} required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('reflect.knowledge.placeholder_content')}
            required
            style={{ width: '100%', height: '140px', resize: 'vertical' }}
          />
        </FormField>

        <FormField label={t('reflect.knowledge.field_tags')}>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder={t('reflect.knowledge.placeholder_tags')}
            style={{ width: '100%' }}
          />
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {t('reflect.knowledge.tags_hint')}
          </span>
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {item ? t('reflect.knowledge.action_save') : t('reflect.knowledge.action_create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
