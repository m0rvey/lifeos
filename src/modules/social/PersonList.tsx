import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { type Person, Depth, PersonStatus, type GraphWeights } from '../../types';
import { computeConnectionScore, isDecaying } from '../../cognitive/social';
import { statusPills } from './constants';
import { useI18n } from '../../i18n';

interface PersonListProps {
  people: Person[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  graphWeights: GraphWeights;
}

export default function PersonList({ people, activeId, onSelect, onAddNew, graphWeights }: PersonListProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepth, setSelectedDepth] = useState<Depth | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<PersonStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'energy' | 'recency' | 'name'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const depthLabelMap: Record<Depth, string> = {
    [Depth.CORE]: t('social.depth.core'),
    [Depth.INNER]: t('social.depth.inner'),
    [Depth.SOCIAL]: t('social.depth.social'),
    [Depth.PERIPHERY]: t('social.depth.periphery'),
  };

  const statusLabelMap: Record<PersonStatus, string> = {
    [PersonStatus.ACTIVE]: t('social.status.active'),
    [PersonStatus.OCCASIONAL]: t('social.status.occasional'),
    [PersonStatus.DISTANT]: t('social.status.distant'),
    [PersonStatus.CONFLICT]: t('social.status.conflict'),
    [PersonStatus.LOST]: t('social.status.lost'),
    [PersonStatus.MENTOR]: t('social.status.mentor'),
  };

  const filteredSortedPeople = useMemo(() => {
    let result = people.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const noteMatch = p.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const reflectionMatch = p.reflection.toLowerCase().includes(searchQuery.toLowerCase());
      const queryMatch = nameMatch || noteMatch || reflectionMatch;

      const depthMatch = selectedDepth === 'ALL' || p.depth === selectedDepth;
      const statusMatch = selectedStatus === 'ALL' || p.status === selectedStatus;

      return queryMatch && depthMatch && statusMatch;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'ru');
      } else if (sortBy === 'energy') {
        comparison = a.energy - b.energy;
      } else if (sortBy === 'recency') {
        comparison = new Date(b.lastContactISO).getTime() - new Date(a.lastContactISO).getTime();
      } else {
        comparison = computeConnectionScore(a, graphWeights) - computeConnectionScore(b, graphWeights);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [people, searchQuery, selectedDepth, selectedStatus, sortBy, sortOrder, graphWeights]);

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  return (
    <div className="social-list-container">
      {/* Search and Add */}
      <div className="social-search-row">
        <div className="glass-panel social-search-input-wrapper">
          <Search size={16} className="social-search-icon" />
          <input
            type="text"
            placeholder={t('social.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="social-search-input"
          />
        </div>
        <button
          className="btn btn--primary social-add-btn"
          onClick={onAddNew}
          aria-label={t('social.add_contact_aria')}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Filter controls */}
      <div className="glass-panel social-filters-panel">
        <div className="social-filters-grid">
          <div>
            <span className="social-filter-label">{t('social.label.depth')}</span>
            <select
              value={selectedDepth}
              onChange={(e) => setSelectedDepth(e.target.value as Depth | 'ALL')}
              className="social-filter-select"
            >
              <option value="ALL">{t('social.filter.all_circles')}</option>
              <option value={Depth.CORE}>{t('social.depth.core')}</option>
              <option value={Depth.INNER}>{t('social.depth.inner')}</option>
              <option value={Depth.SOCIAL}>{t('social.depth.social')}</option>
              <option value={Depth.PERIPHERY}>{t('social.depth.periphery')}</option>
            </select>
          </div>
          <div>
            <span className="social-filter-label">{t('social.label.status')}</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PersonStatus | 'ALL')}
              className="social-filter-select"
            >
              <option value="ALL">{t('social.filter.all_statuses')}</option>
              <option value={PersonStatus.ACTIVE}>{t('social.status.active')}</option>
              <option value={PersonStatus.OCCASIONAL}>{t('social.status.occasional')}</option>
              <option value={PersonStatus.DISTANT}>{t('social.status.distant')}</option>
              <option value={PersonStatus.CONFLICT}>{t('social.status.conflict')}</option>
              <option value={PersonStatus.LOST}>{t('social.status.lost')}</option>
              <option value={PersonStatus.MENTOR}>{t('social.status.mentor')}</option>
            </select>
          </div>
        </div>

        <div className="social-sort-row">
          <div className="social-sort-label-group">
            <span className="social-sort-label">{t('social.sort.label')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'energy' | 'recency' | 'name')}
              className="social-sort-select"
            >
              <option value="score">{t('social.sort.score')}</option>
              <option value="energy">{t('social.sort.energy')}</option>
              <option value="recency">{t('social.sort.recency')}</option>
              <option value="name">{t('social.sort.name')}</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className="btn btn--secondary social-sort-order-btn"
            aria-label={t('social.sort.order_aria')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Contacts Scroller list */}
      <div className="glass-panel social-contacts-panel">
        <div className="social-contacts-scroll">
          {filteredSortedPeople.map((p) => {
            const score = computeConnectionScore(p, graphWeights);
            const pill = statusPills[p.status];
            const isOverdue = isDecaying(p);

            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`social-contact-btn ${activeId === p.id ? 'active' : ''}`}
              >
                <div
                  className={`social-contact-avatar ${isOverdue ? 'social-contact-avatar--decaying' : 'social-contact-avatar--normal'}`}
                >
                  {initials(p.name)}
                </div>
                <div className="social-contact-info">
                  <div className="social-contact-name-row">
                    <span className="social-contact-name">
                      {p.name}
                    </span>
                    <span className="social-contact-score">
                      {Math.round(score)}%
                    </span>
                  </div>
                  <div className="social-contact-tags">
                    <span className="social-contact-tag-depth">
                      {depthLabelMap[p.depth]}
                    </span>
                    <span
                      className="social-contact-tag-status"
                      style={{
                        background: pill.bg,
                        color: pill.color,
                      }}
                    >
                      {statusLabelMap[p.status]}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredSortedPeople.length === 0 && (
            <div className="social-contacts-empty">
              {t('social.empty_list')}
            </div>
          )}
        </div>
        <div className="social-contacts-footer">
          {t('social.total_label')} <strong>{filteredSortedPeople.length}</strong>
        </div>
      </div>
    </div>
  );
}
