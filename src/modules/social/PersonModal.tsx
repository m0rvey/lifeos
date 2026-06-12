import { useState, type FormEvent } from 'react';
import { type Person, Depth, Archetype, PersonStatus } from '../../types';
import { Modal, FormField } from '../../ui';
import { todayISO } from '../../cognitive/helpers';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onSave: (personData: Partial<Person>) => void;
}

export default function PersonModal({ isOpen, onClose, person, onSave }: PersonModalProps) {
  const [name, setName] = useState(person?.name || '');
  const [depth, setDepth] = useState<Depth>(person?.depth || Depth.INNER);
  const [archetype, setArchetype] = useState<Archetype>(person?.archetype || Archetype.INTELLECTUAL);
  const [status, setStatus] = useState<PersonStatus>(person?.status || PersonStatus.ACTIVE);
  const [lastContactISO, setLastContactISO] = useState(person?.lastContactISO ? person.lastContactISO.slice(0, 10) : todayISO());
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
      setError('Имя контакта обязательно');
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
      title={person ? 'Настройка социальной связи' : 'Регистрация нового знакомства'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ color: 'var(--error, #ef4444)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <FormField label="Имя и Фамилия" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Константин Вернадский"
            required
            style={{ width: '100%' }}
          />
        </FormField>

        <div className="form-row">
          <FormField label="Круг близости">
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as Depth)}
              style={{ width: '100%' }}
            >
              <option value={Depth.CORE}>Ядро (Семья, Близкие)</option>
              <option value={Depth.INNER}>Ближний круг (Друзья)</option>
              <option value={Depth.SOCIAL}>Социальный слой (Коллеги)</option>
              <option value={Depth.PERIPHERY}>Периферия (Знакомые)</option>
            </select>
          </FormField>

          <FormField label="Архетип связи">
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as Archetype)}
              style={{ width: '100%' }}
            >
              <option value={Archetype.INTELLECTUAL}>Интеллектуальный</option>
              <option value={Archetype.EMOTIONAL}>Эмоциональный</option>
              <option value={Archetype.BUSINESS}>Деловой</option>
            </select>
          </FormField>
        </div>

        <div className="form-row">
          <FormField label="Статус общения">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PersonStatus)}
              style={{ width: '100%' }}
            >
              <option value={PersonStatus.ACTIVE}>Активен</option>
              <option value={PersonStatus.OCCASIONAL}>Покой / Эпизодически</option>
              <option value={PersonStatus.DISTANT}>На расстоянии</option>
              <option value={PersonStatus.CONFLICT}>В конфликте</option>
              <option value={PersonStatus.LOST}>Потерян / Не общаемся</option>
              <option value={PersonStatus.MENTOR}>Наставник</option>
            </select>
          </FormField>

          <FormField label="Дата последнего контакта">
            <input
              type="date"
              value={lastContactISO}
              onChange={(e) => setLastContactISO(e.target.value)}
              style={{ width: '100%' }}
            />
          </FormField>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
            Количественные метрики (0-100)
          </span>
          
          <div className="form-row">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>Энергия (влияние)</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>Резонанс (ценности)</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>Взаимность (интерес)</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>Волатильность (хаос)</span>
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

        <FormField label="Рефлексия (ваши выводы)">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
            placeholder="Какие инсайты или эмоции принесло общение?"
          />
        </FormField>

        <FormField label="Заметки / Договорённости">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', height: '60px', resize: 'vertical' }}
            placeholder="О чем договорились встретиться или списаться в будущем?"
          />
        </FormField>

        <div className="modal-form-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            {person ? 'Сохранить изменения' : 'Создать связь'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
