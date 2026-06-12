import { useState, type FormEvent } from 'react';
import { type MaintenanceRecord } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecord | null;
  onSave: (recordData: Partial<MaintenanceRecord>) => void;
}

export default function MaintenanceModal({ isOpen, onClose, record, onSave }: MaintenanceModalProps) {
  const { t } = useI18n();
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
      setError(t('cycling.maintenance.errorPart'));
      return;
    }
    if (cost < 0 || isNaN(cost)) {
      setError(t('cycling.maintenance.errorCost'));
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
      title={record ? t('cycling.maintenance.modalEditTitle') : t('cycling.maintenance.modalCreateTitle')}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && (
          <div className="text-error-bold">
            {error}
          </div>
        )}

        <FormField label={t('cycling.maintenance.fieldPart')} required>
          <input
            type="text"
            value={bikePart}
            onChange={(e) => setBikePart(e.target.value)}
            placeholder={t('cycling.maintenance.partPlaceholder')}
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label={t('cycling.maintenance.fieldType')}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceRecord['type'])}
              style={{ width: '100%' }}
            >
              <option value="inspection">{t('cycling.maintenance.type.inspection')}</option>
              <option value="cleaning">{t('cycling.maintenance.type.cleaning')}</option>
              <option value="service">{t('cycling.maintenance.type.service')}</option>
              <option value="repair">{t('cycling.maintenance.type.repair')}</option>
              <option value="replace">{t('cycling.maintenance.type.replace')}</option>
              <option value="upgrade">{t('cycling.maintenance.type.upgrade')}</option>
            </select>
          </FormField>

          <FormField label={t('cycling.maintenance.fieldCost')}>
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
          <FormField label={t('cycling.maintenance.fieldDate')}>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </FormField>

          <FormField label={t('cycling.maintenance.fieldStatus')}>
            <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '8px' }}>
              <input
                type="checkbox"
                id="maint-done"
                checked={isDone}
                onChange={(e) => setIsDone(e.target.checked)}
              />
              <label htmlFor="maint-done" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>{t('cycling.maintenance.completed')}</label>
            </div>
          </FormField>
        </div>

        <FormField label={t('cycling.maintenance.fieldDescription')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('cycling.maintenance.descriptionPlaceholder')}
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {record ? t('cycling.rides.saveChanges') : t('cycling.maintenance.createRecord')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
