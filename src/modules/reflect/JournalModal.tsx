import React, { useState } from 'react';
import { type JournalEntry } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onSave: (entryData: Partial<JournalEntry>) => void;
}

export default function JournalModal({ isOpen, onClose, entry, onSave }: JournalModalProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood ?? 50);
  const [dateISO, setDateISO] = useState(entry?.dateISO ? entry.dateISO.slice(0, 10) : todayISO());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Укажите тему дневниковой записи');
      return;
    }
    if (!content.trim()) {
      setError('Содержание записи не может быть пустым');
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      mood,
      dateISO
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entry ? 'Редактировать запись в дневнике' : 'Новая запись рефлексии'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <div className="form-row">
          <FormField label="Тема / Заголовок" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Утренний настрой..."
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Дата записи">
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label="Ваше настроение">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>
              {mood >= 80 ? '😁' : mood >= 60 ? '🙂' : mood >= 40 ? '😐' : mood >= 20 ? '🙁' : '😢'}
            </span>
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

        <FormField label="Текст записи (Опишите мысли, эмоции, события)" required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Сегодня я почувствовал..."
            required
            style={{ width: '100%', height: '120px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {entry ? 'Сохранить изменения' : 'Записать в дневник'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
