import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
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
import { Person, Depth, Archetype, PersonStatus } from '../../types';
import { statusPills } from './constants';

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

  const depthLabelMap: Record<Depth, string> = {
    [Depth.CORE]: t('social.depth.core'),
    [Depth.INNER]: t('social.depth.inner'),
    [Depth.SOCIAL]: t('social.depth.social'),
    [Depth.PERIPHERY]: t('social.depth.periphery'),
  };

  const archetypeLabelMap: Record<Archetype, string> = {
    [Archetype.INTELLECTUAL]: t('social.archetype.intellectual'),
    [Archetype.EMOTIONAL]: t('social.archetype.emotional'),
    [Archetype.BUSINESS]: t('social.archetype.business'),
  };

  const statusLabelMap: Record<PersonStatus, string> = {
    [PersonStatus.ACTIVE]: t('social.status.active'),
    [PersonStatus.OCCASIONAL]: t('social.status.occasional'),
    [PersonStatus.DISTANT]: t('social.status.distant'),
    [PersonStatus.CONFLICT]: t('social.status.conflict'),
    [PersonStatus.LOST]: t('social.status.lost'),
    [PersonStatus.MENTOR]: t('social.status.mentor'),
  };

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
    addToast(t('social.toast.contact_today'), 'success');
  }, [person, dispatch, addToast, t]);

  const handleSavePerson = useCallback((updatedFields: Partial<Person>) => {
    if (!person) return;
    dispatch({
      type: 'UPDATE_ENTITY',
      entity: 'people',
      id: person.id,
      payload: updatedFields,
    });
    setIsEditOpen(false);
    addToast(t('social.toast.contact_saved'), 'success');
  }, [person, dispatch, addToast, t, setIsEditOpen]);

  const handleDelete = useCallback(() => {
    if (!person) return;
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'people',
      id: person.id,
    });
    setIsDeleteOpen(false);
    addToast(t('social.toast.contact_deleted'), 'warning');
    navigate('/social');
  }, [person, dispatch, navigate, addToast, t, setIsDeleteOpen]);

  if (!person) {
    return (
      <div className="detail-empty-box">
        <h3 className="detail-empty-title">{t('social.detail.not_found')}</h3>
        <Link to="/social" className="btn btn--secondary">
          <ArrowLeft size={16} /> {t('social.detail.back_to_list')}
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
          <span>{t('social.detail.back_to_map')}</span>
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
              {depthLabelMap[person.depth]}
            </span>
            <span className="detail-tag-archetype">
              {archetypeLabelMap[person.archetype]}
            </span>
            <span 
              className="detail-tag-status"
              style={{
                background: statusPill.bg,
                color: statusPill.color,
              }}
            >
              {statusLabelMap[person.status]}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn--secondary detail-btn-edit" onClick={() => setIsEditOpen(true)} aria-label={t('social.detail.edit_aria')}>
            <Edit size={16} />
          </button>
          <button className="btn btn--secondary detail-btn-delete" onClick={() => setIsDeleteOpen(true)} aria-label={t('social.detail.delete_aria')}>
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
            <span>{t('social.detail.metrics_title')}</span>
          </h3>

          <div className="detail-metrics-list">
            {/* Energy */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">{t('social.metric.energy')}</span>
                <strong className="detail-metric-val">{person.energy}%</strong>
              </div>
              <div className="detail-metric-bar-bg">
                <div className="detail-metric-bar-fill detail-metric-bar-fill--energy" style={{ width: `${person.energy}%` }} />
              </div>
            </div>

            {/* Resonance */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">{t('social.metric.resonance')}</span>
                <strong className="detail-metric-val">{person.resonance}%</strong>
              </div>
              <div className="detail-metric-bar-bg">
                <div className="detail-metric-bar-fill detail-metric-bar-fill--resonance" style={{ width: `${person.resonance}%` }} />
              </div>
            </div>

            {/* Reciprocity */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">{t('social.metric.reciprocity')}</span>
                <strong className="detail-metric-val">{person.reciprocity}%</strong>
              </div>
              <div className="detail-metric-bar-bg">
                <div className="detail-metric-bar-fill detail-metric-bar-fill--reciprocity" style={{ width: `${person.reciprocity}%` }} />
              </div>
            </div>

            {/* Volatility */}
            <div>
              <div className="detail-metric-row">
                <span className="detail-metric-label">{t('social.metric.volatility')}</span>
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
              <span>{t('social.detail.diagnostics_title')}</span>
            </h3>

            <div className="detail-diagnostics-box">
              <div>
                <span className="detail-diagnostics-score-label">{t('social.stat.resource_index')}</span>
                <strong className="detail-diagnostics-score-val">{Math.round(score)}%</strong>
              </div>
              <div className="detail-diagnostics-desc-group">
                <span className="detail-diagnostics-desc-label">{t('social.detail.quality_label')}</span>
                <strong className="detail-diagnostics-desc-val">
                  {score >= 85 ? t('social.quality.resonant') : score >= 65 ? t('social.quality.strong') : score >= 45 ? t('social.quality.stable') : score >= 25 ? t('social.quality.weak') : t('social.quality.critical')}
                </strong>
              </div>
            </div>
          </div>

          <div className="detail-recency-box">
            <div className="detail-recency-left">
              <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
              <div>
                <span className="detail-recency-label-group">{t('social.detail.last_touch')}</span>
                <strong className="detail-recency-val">{formatDate(person.lastContactISO)}</strong>
              </div>
            </div>
            <div className="detail-elapsed-group">
              <span className="detail-elapsed-label">{t('social.detail.elapsed')}</span>
              <strong className={`detail-elapsed-val ${isDecayed ? 'detail-elapsed-val--decayed' : 'detail-elapsed-val--normal'}`}>
                {daysSince} {t('days_abbrev')}
              </strong>
            </div>
          </div>

          {isDecayed && (
            <div className="detail-decay-alert">
              <AlertTriangle size={14} style={{ color: 'var(--error)', flexShrink: 0 }} />
              <span className="detail-decay-alert-text">
                {t('social.detail.decay_alert', { depth: depthLabelMap[person.depth], limit })}
              </span>
            </div>
          )}

          <button className="btn btn--primary detail-btn-touch" onClick={handleMarkContactToday}>
            <Check size={16} />
            <span>{t('social.detail.touch_today')}</span>
          </button>
        </div>
      </div>

      {/* Reflection and Notes */}
      <div className="detail-content-section">
        
        {/* Reflection */}
        <div className="glass-panel detail-content-panel">
          <h3 className="detail-content-title">
            <Smile size={18} style={{ color: 'var(--accent)' }} />
            <span>{t('social.detail.reflection_title')}</span>
          </h3>
          <div className="detail-content-text-box">
            {person.reflection || (
              <span className="detail-content-text-empty">
                {t('social.detail.reflection_empty')}
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="glass-panel detail-content-panel">
          <h3 className="detail-content-title">
            <Flame size={18} style={{ color: 'var(--accent)' }} />
            <span>{t('social.detail.notes_title')}</span>
          </h3>
          <div className="detail-content-text-box detail-content-text-box--notes">
            {person.notes || (
              <span className="detail-content-text-empty">
                {t('social.detail.notes_empty')}
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
            title={t('social.detail.delete_title')}
            message={t('social.detail.delete_message', { name: person.name })}
            confirmLabel={t('action.delete')}
            cancelLabel={t('action.cancel')}
            variant="danger"
          />
        )}
    </div>
  );
}
