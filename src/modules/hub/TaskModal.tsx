import { useState, type FormEvent } from 'react';
import { type Task } from '../../types';
import { Modal, FormField } from '../../ui';
import { useI18n } from '../../i18n';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (taskData: Partial<Task>) => void;
}

export default function TaskModal({ isOpen, onClose, task, onSave }: TaskModalProps) {
  const { t } = useI18n();

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [urgency, setUrgency] = useState(task?.urgency ?? 50);
  const [emotion, setEmotion] = useState(task?.emotion ?? 50);
  const [deadlineISO, setDeadlineISO] = useState(
    task?.deadlineISO ? task.deadlineISO.slice(0, 10) : ''
  );
  const [tagsInput, setTagsInput] = useState(task?.tags ? task.tags.join(', ') : '');
  const [isCompleted, setIsCompleted] = useState(task?.isCompleted || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('tasks.field_title') + ' is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim(),
      urgency,
      emotion,
      deadlineISO: deadlineISO || null,
      tags,
      isCompleted,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? t('tasks.modal_edit_title') : t('tasks.modal_create_title')}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <FormField label={t('tasks.field_title')} required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Prepare Q3 roadmap presentation"
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label={`${t('tasks.field_urgency')} (${urgency}%)`}>
            <input
              type="range"
              min="0"
              max="100"
              value={urgency}
              onChange={(e) => setUrgency(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={`${t('tasks.field_emotion')} (${emotion}%)`}>
            <input
              type="range"
              min="0"
              max="100"
              value={emotion}
              onChange={(e) => setEmotion(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label={t('tasks.field_deadline')}>
            <input
              type="date"
              value={deadlineISO}
              onChange={(e) => setDeadlineISO(e.target.value)}
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('tasks.field_tags')}>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="work, project, focus"
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <FormField label={t('tasks.field_desc')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed notes or subtasks..."
            style={{ width: '100%', height: '70px', resize: 'vertical' }}
          />
        </FormField>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="task-complete-toggle"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          <label htmlFor="task-complete-toggle" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
            Mark as completed
          </label>
        </div>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {t('action.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
