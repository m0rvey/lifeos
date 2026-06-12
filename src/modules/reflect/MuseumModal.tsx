import { useState, type FormEvent } from 'react';
import { type Thought } from '../../types';
import { Modal, FormField } from '../../ui';

interface MuseumModalProps {
  isOpen: boolean;
  onClose: () => void;
  thought: Thought | null;
  onSave: (thoughtData: Partial<Thought>) => void;
}

export default function MuseumModal({ isOpen, onClose, thought, onSave }: MuseumModalProps) {
  const [content, setContent] = useState(thought?.content || '');
  const [category, setCategory] = useState(thought?.category || 'Философия');
  const [tagsText, setTagsText] = useState(thought?.tags ? thought.tags.join(', ') : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Содержание мысли не может быть пустым');
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
      title={thought ? 'Редактировать мысль' : 'Зафиксировать инсайт / Цитату'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <FormField label="Текст мысли / Инсайт / Цитата" required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Запишите то, что вас вдохновило или пришло на ум..."
            required
            style={{ width: '100%', height: '120px', resize: 'vertical' }}
          />
        </FormField>

        <FormField label="Категория">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Например: Философия, Цитаты, Инсайты"
            style={{ width: '100%' }}
          />
        </FormField>

        <FormField label="Теги">
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="жизнь, мудрость, мотивация"
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            Перечислите теги через запятую.
          </span>
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {thought ? 'Сохранить изменения' : 'Запечатлеть'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
