import React, { useState } from 'react';
import { type KnowledgeItem } from '../../types';
import { Modal, FormField } from '../../ui';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: KnowledgeItem | null;
  onSave: (itemData: Partial<KnowledgeItem>) => void;
}

export default function KnowledgeModal({ isOpen, onClose, item, onSave }: KnowledgeModalProps) {
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState(item?.category || 'Книги');
  const [source, setSource] = useState(item?.source || '');
  const [url, setUrl] = useState(item?.url || '');
  const [content, setContent] = useState(item?.content || '');
  const [tagsText, setTagsText] = useState(item?.tags ? item.tags.join(', ') : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Укажите название статьи / идеи');
      return;
    }
    if (!content.trim()) {
      setError('Содержимое записи не может быть пустым');
      return;
    }

    onSave({
      title: title.trim(),
      category: category.trim(),
      source: source.trim(),
      url: url.trim(),
      content: content.trim(),
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Редактировать статью БЗ' : 'Добавить новые знания'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <div className="form-row-2-1">
          <FormField label="Название статьи / Идея" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Методика ведения заметок Zettelkasten"
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Категория">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Книги">Книги / Конспекты</option>
              <option value="Статьи">Статьи / Блоги</option>
              <option value="Видео">Видео / Лекции</option>
              <option value="Подкасты">Подкасты</option>
              <option value="Методология">Методологии / Личное</option>
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Источник информации">
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Например: Блог Ивана Никитина, книга С. Кузнецова"
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Ссылка (URL)">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label="Конспект / Ключевые идеи" required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Опишите главные тезисы, конспект или цитаты..."
            required
            style={{ width: '100%', height: '140px', resize: 'vertical' }}
          />
        </FormField>

        <FormField label="Теги">
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="продуктивность, фокус, философия"
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            Перечислите теги через запятую.
          </span>
        </FormField>

        <div className="modal__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {item ? 'Сохранить изменения' : 'Добавить знания'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
