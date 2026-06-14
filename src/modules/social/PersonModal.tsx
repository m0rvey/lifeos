import { useState, type FormEvent } from 'react';
import { type Person, Depth, Archetype, PersonStatus } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSave: (personData: Partial<Person>) => void;
}

export default function PersonModal({ isOpen, onClose, person, onSave }: PersonModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState(person?.name || '');
  const [depth, setDepth] = useState<Depth>(person?.depth || Depth.INNER);
  const [archetype, setArchetype] = useState<Archetype>(
    person?.archetype || Archetype.INTELLECTUAL
  );
  const [status, setStatus] = useState<PersonStatus>(person?.status || PersonStatus.ACTIVE);
  const [lastContactISO, setLastContactISO] = useState(
    person?.lastContactISO ? person.lastContactISO.slice(0, 10) : todayISO()
  );
  const [energy, setEnergy] = useState(person?.energy ?? 60);
  const [resonance, setResonance] = useState(person?.resonance ?? 60);
  const [reciprocity, setReciprocity] = useState(person?.reciprocity ?? 60);
  const [volatility, setVolatility] = useState(person?.volatility ?? 30);
  const [reflection, setReflection] = useState(person?.reflection || '');
  const [notes, setNotes] = useState(person?.notes || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('social.modal.name_required_error'));
      return;
    }

    onSave({
      name: name.trim(),
      depth,
      archetype,
      status,
      lastContactISO,
      energy,
      resonance,
      reciprocity,
      volatility,
      reflection: reflection.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={person ? t('social.modal.edit_title') : t('social.modal.create_title')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex-col-16">
        {error && <div className="text-error-bold">{error}</div>}

        <FormField label={t('social.modal.name_label')} required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('social.modal.name_placeholder')}
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label={t('social.label.depth')}>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as Depth)}
              style={{ width: '100%' }}
            >
              <option value={Depth.CORE}>{t('social.modal.depth_core_detail')}</option>
              <option value={Depth.INNER}>{t('social.modal.depth_inner_detail')}</option>
              <option value={Depth.SOCIAL}>{t('social.modal.depth_social_detail')}</option>
              <option value={Depth.PERIPHERY}>{t('social.modal.depth_periphery_detail')}</option>
            </select>
          </FormField>

          <FormField label={t('social.label.archetype')}>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as Archetype)}
              style={{ width: '100%' }}
            >
              <option value={Archetype.INTELLECTUAL}>{t('social.archetype.intellectual')}</option>
              <option value={Archetype.EMOTIONAL}>{t('social.archetype.emotional')}</option>
              <option value={Archetype.BUSINESS}>{t('social.archetype.business')}</option>
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label={t('social.label.status')}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PersonStatus)}
              style={{ width: '100%' }}
            >
              <option value={PersonStatus.ACTIVE}>{t('social.status.active')}</option>
              <option value={PersonStatus.OCCASIONAL}>
                {t('social.status.occasional')} / {t('social.status.episodic')}
              </option>
              <option value={PersonStatus.DISTANT}>{t('social.status.distant')}</option>
              <option value={PersonStatus.CONFLICT}>{t('social.status.conflict')}</option>
              <option value={PersonStatus.LOST}>{t('social.status.lost')}</option>
              <option value={PersonStatus.MENTOR}>{t('social.status.mentor')}</option>
            </select>
          </FormField>

          <FormField label={t('social.modal.last_contact_label')}>
            <input
              type="date"
              value={lastContactISO}
              onChange={(e) => setLastContactISO(e.target.value)}
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            {t('social.modal.metrics_title')}
          </span>

          <div className="form-row">
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              >
                <span>{t('social.metric.energy')}</span>
                <strong>{energy}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              >
                <span>{t('social.metric.resonance')}</span>
                <strong>{resonance}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={resonance}
                onChange={(e) => setResonance(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              >
                <span>{t('social.metric.reciprocity')}</span>
                <strong>{reciprocity}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reciprocity}
                onChange={(e) => setReciprocity(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              >
                <span>{t('social.metric.volatility')}</span>
                <strong>{volatility}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={volatility}
                onChange={(e) => setVolatility(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <FormField label={t('social.modal.reflection_label')}>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
            placeholder={t('social.modal.reflection_placeholder')}
          />
        </FormField>

        <FormField label={t('social.modal.notes_label')}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
            placeholder={t('social.modal.notes_placeholder')}
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('action.cancel')}
          </button>
          <button type="submit" className="btn btn--primary">
            {person ? t('social.modal.save_changes') : t('social.modal.create_connection')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
