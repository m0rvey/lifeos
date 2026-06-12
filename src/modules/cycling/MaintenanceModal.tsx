import { useState, type FormEvent } from 'react';
import { type MaintenanceRecord } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecord | null;
  onSave: (recordData: Partial<MaintenanceRecord>) => void;
}

export default function MaintenanceModal({ isOpen, onClose, record, onSave }: MaintenanceModalProps) {
  const [bikePart, setBikePart] = useState(record?.bikePart || '');
  const [type, setType] = useState<MaintenanceRecord['type']>(record?.type || 'service');
  const [description, setDescription] = useState(record?.description || '');
  const [cost, setCost] = useState(record?.cost || 0);
  const [dateISO, setDateISO] = useState(record?.dateISO ? record.dateISO.slice(0, 10) : todayISO());
  const [isDone, setIsDone] = useState(record?.isDone || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bikePart.trim()) {
      setError('Укажите обслуженную деталь / узел велосипеда');
      return;
    }
    if (cost < 0 || isNaN(cost)) {
      setError('Стоимость должна быть числом не меньше нуля');
      return;
    }

    onSave({
      bikePart: bikePart.trim(),
      type,
      description: description.trim(),
      cost,
      dateISO,
      isDone,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Редактировать запись ТО' : 'Зафиксировать техническое обслуживание'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && (
          <div className="text-error-bold">
            {error}
          </div>
        )}

        <FormField label="Узел велосипеда / Запчасть" required>
          <input
            type="text"
            value={bikePart}
            onChange={(e) => setBikePart(e.target.value)}
            placeholder="Например: Цепь, Амортизатор, Покрышки"
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label="Тип обслуживания">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceRecord['type'])}
              style={{ width: '100%' }}
            >
              <option value="inspection">Осмотр / Диагностика</option>
              <option value="cleaning">Очистка / Смазка</option>
              <option value="service">Настройка / Сервис</option>
              <option value="repair">Ремонт поломки</option>
              <option value="replace">Замена детали</option>
              <option value="upgrade">Апгрейд (Тюнинг)</option>
            </select>
          </FormField>

          <FormField label="Стоимость обслуживания (₽)">
            <input
              type="number"
              min="0"
              value={cost || ''}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
              placeholder="0"
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Дата проведения">
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label="Статус выполнения">
            <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '8px' }}>
              <input
                type="checkbox"
                id="maint-done"
                checked={isDone}
                onChange={(e) => setIsDone(e.target.checked)}
              />
              <label htmlFor="maint-done" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Завершено</label>
            </div>
          </FormField>
        </div>

        <FormField label="Описание работ / Детали">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите проведенные работы, бренд новой детали или состояние..."
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {record ? 'Сохранить изменения' : 'Создать запись'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
