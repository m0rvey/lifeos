import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Smile, 
  Award, 
  Zap, 
  Flame 
} from 'lucide-react';
import { computeConnectionScore, isDecaying, getContactThreshold } from '../../cognitive/social';
import { formatDate, todayISO, getDaysSince } from '../../cognitive/helpers';
import { ConfirmDialog } from '../../ui';
import PersonModal from './PersonModal';
import { Person } from '../../types';
import { depthLabels, archetypeLabels, statusLabels, statusPills } from './constants';

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, dispatch } = useData();
  const { addToast } = useApp();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const person = useMemo(() => {
    return data.people.find((p) => p.id === id) || null;
  }, [data.people, id]);

  const score = useMemo(() => {
    if (!person) return 0;
    return computeConnectionScore(person, data.settings.graphWeights);
  }, [person, data.settings.graphWeights]);

  const daysSince = useMemo(() => {
    if (!person) return 0;
    return getDaysSince(person.lastContactISO);
  }, [person]);

  const limit = useMemo(() => {
    if (!person) return 0;
    return getContactThreshold(person.depth);
  }, [person]);

  const isDecayed = useMemo(() => {
    if (!person) return false;
    return isDecaying(person);
  }, [person]);

  const handleMarkContactToday = useCallback(() => {
    if (!person) return;
    dispatch({
      type: 'UPDATE_ENTITY',
      entity: 'people',
      id: person.id,
      payload: { lastContactISO: todayISO() },
    });
    addToast('Контакт отмечен сегодняшним днем', 'success');
  }, [person, dispatch, addToast]);

  const handleSavePerson = useCallback((updatedFields: Partial<Person>) => {
    if (!person) return;
    dispatch({
      type: 'UPDATE_ENTITY',
      entity: 'people',
      id: person.id,
      payload: updatedFields,
    });
    setIsEditOpen(false);
    addToast('Связь успешно сохранена', 'success');
  }, [person, dispatch, addToast]);

  const handleDelete = useCallback(() => {
    if (!person) return;
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'people',
      id: person.id,
    });
    setIsDeleteOpen(false);
    addToast('Контакт удален из сети', 'warning');
    navigate('/social');
  }, [person, dispatch, navigate, addToast]);

  if (!person) {
    return (
      <div className="detail-empty-box">
        <h3 className="detail-empty-title">Связь не найдена</h3>
        <Link to="/social" className="btn btn--secondary">
          <ArrowLeft size={16} /> Назад к списку
        </Link>
      </div>
    );
  }

  const initials = ((person.name.split(' ')[0]?.[0] || '') + (person.name.split(' ')[1]?.[0] || '')).toUpperCase();
  const statusPill = statusPills[person.status] || { bg: 'rgba(0,0,0,0.1)', color: '#fff' };

  return (
    <div className="fade-in-entry detail-container">
      {/* Back button */}
      <div className="detail-back-row">
        <Link to="/social" className="detail-back-link">
          <ArrowLeft size={16} />
          <span>Вернуться к карте социального поля</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="glass-panel detail-profile-header">
        <div className={`detail-avatar ${isDecayed ? 'detail-avatar--decayed' : 'detail-avatar--normal'}`}>
          {initials}
        </div>
        <div className="detail-name-group">
          <h1 className="detail-name">{person.name}</h1>
          <div className="detail-tags">
            <span className="detail-tag-depth">
              {depthLabels[person.depth]}
            </span>
            <span className="detail-tag-archetype">
              {archetypeLabels[person.archetype]}
            </span>
            <span 
              className="detail-tag-status"
              style={{
                background: statusPill.bg,
                color: statusPill.color,
              }}
            >
              {statusLabels[person.status]}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn--secondary detail-btn-edit" onClick={() => setIsEditOpen(true)} aria-label="Редактировать связь">
            <Edit size={16} />
          </button>
          <button className="btn btn--secondary detail-btn-delete" onClick={() => setIsDeleteOpen(true)} aria-label="Удалить связь">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Info Blocks */}
      <div className="detail-metrics-grid">
        
        {/* Metric sliders display */}
        <div className="glass-panel detail-metrics-panel">
          <h3 className="detail-metrics-title">
            <Award size={18} style={{ color: 'var(--accent)' }} />
            <span>Параметры близости</span>
          </h3>

          <div className="detail-metrics-list">
            {/* Energy */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">Энергия (влияние)</span>
                <strong className="detail-metric-val">{person.energy}%</strong>
              </div>
              <div className="detail-metric-bar-bg">
                <div className="detail-metric-bar-fill detail-metric-bar-fill--energy" style={{ width: `${person.energy}%` }} />
              </div>
            </div>

            {/* Resonance */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">Резонанс (ценности)</span>
                <strong className="detail-metric-val">{person.resonance}%</strong>
              </div>
              <div className="detail-metric-bar-bg">
                <div className="detail-metric-bar-fill detail-metric-bar-fill--resonance" style={{ width: `${person.resonance}%` }} />
              </div>
            </div>

            {/* Reciprocity */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">Взаимность (интерес)</span>
                <strong className="detail-metric-val">{person.reciprocity}%</strong>
              </div>
              <div className="detail-metric-bar-bg">
                <div className="detail-metric-bar-fill detail-metric-bar-fill--reciprocity" style={{ width: `${person.reciprocity}%` }} />
              </div>
            </div>

            {/* Volatility */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">Волатильность (хаос)</span>
                <strong className="detail-metric-val">{person.volatility}%</strong>
              </div>
              <div className="detail-metric-bar-bg">
                <div className="detail-metric-bar-fill detail-metric-bar-fill--volatility" style={{ width: `${person.volatility}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Score & Contact Recency */}
        <div className="glass-panel detail-diagnostics-panel">
          <div>
            <h3 className="detail-metrics-title">
              <Zap size={18} style={{ color: 'var(--accent)' }} />
              <span>Диагностика отношений</span>
            </h3>

            <div className="detail-diagnostics-box">
              <div>
                <span className="detail-diagnostics-score-label">Индекс ресурса</span>
                <strong className="detail-diagnostics-score-val">{Math.round(score)}%</strong>
              </div>
              <div className="detail-diagnostics-desc-group">
                <span className="detail-diagnostics-desc-label">Качество связи</span>
                <strong className="detail-diagnostics-desc-val">
                  {score >= 85 ? 'Резонансная' : score >= 65 ? 'Сильная' : score >= 45 ? 'Стабильная' : score >= 25 ? 'Слабая' : 'Критическая'}
                </strong>
              </div>
            </div>
          </div>

          <div className="detail-recency-box">
            <div className="detail-recency-left">
              <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
              <div>
                <span className="detail-recency-label-group">Последнее касание</span>
                <strong className="detail-recency-val">{formatDate(person.lastContactISO)}</strong>
              </div>
            </div>
            <div className="detail-elapsed-group">
              <span className="detail-elapsed-label">Прошло</span>
              <strong className={`detail-elapsed-val ${isDecayed ? 'detail-elapsed-val--decayed' : 'detail-elapsed-val--normal'}`}>
                {daysSince} дн.
              </strong>
            </div>
          </div>

          {isDecayed && (
            <div className="detail-decay-alert">
              <AlertTriangle size={14} style={{ color: 'var(--error)', flexShrink: 0 }} />
              <span className="detail-decay-alert-text">
                Связь остывает! Превышен лимит контакта для круга "{depthLabels[person.depth]}" ({limit} дн.).
              </span>
            </div>
          )}

          <button className="btn btn--primary detail-btn-touch" onClick={handleMarkContactToday}>
            <Check size={16} />
            <span>Касание сегодня</span>
          </button>
        </div>
      </div>

      {/* Reflection and Notes */}
      <div className="detail-content-section">
        
        {/* Reflection */}
        <div className="glass-panel detail-content-panel">
          <h3 className="detail-content-title">
            <Smile size={18} style={{ color: 'var(--accent)' }} />
            <span>Рефлексия (Выводы из общения)</span>
          </h3>
          <div className="detail-content-text-box">
            {person.reflection || (
              <span className="detail-content-text-empty">
                Рефлексии пока нет. Запишите инсайты или эмоции, оставшиеся после общения.
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="glass-panel detail-content-panel">
          <h3 className="detail-content-title">
            <Flame size={18} style={{ color: 'var(--accent)' }} />
            <span>Заметки / Договорённости</span>
          </h3>
          <div className="detail-content-text-box detail-content-text-box--notes">
            {person.notes || (
              <span className="detail-content-text-empty">
                Заметки отсутствуют. Запишите важные детали или планы на следующую встречу.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
        {isEditOpen && (
          <PersonModal
            isOpen={isEditOpen}
            person={person}
            onClose={() => setIsEditOpen(false)}
            onSave={handleSavePerson}
          />
        )}

      {/* Deletion confirmation dialog */}
        {isDeleteOpen && (
          <ConfirmDialog
            isOpen={isDeleteOpen}
            onConfirm={handleDelete}
            onCancel={() => setIsDeleteOpen(false)}
            title="Удалить связь?"
            message={`Вы уверены, что хотите удалить связь с "${person.name}"? Это действие безвозвратно удалит все сопутствующие данные рефлексии и заметок.`}
            confirmLabel="Удалить"
            cancelLabel="Отмена"
            variant="danger"
          />
        )}
    </div>
  );
}
