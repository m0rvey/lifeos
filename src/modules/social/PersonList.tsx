import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { type Person, Depth, PersonStatus, type GraphWeights } from '../../types';
import { computeConnectionScore, isDecaying } from '../../cognitive/social';
import { depthLabels, statusLabels, statusPills } from './constants';

interface PersonListProps {
  people: Person[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  graphWeights: GraphWeights;
}

export default function PersonList({ people, activeId, onSelect, onAddNew, graphWeights }: PersonListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepth, setSelectedDepth] = useState<Depth | 'Все'>('Все');
  const [selectedStatus, setSelectedStatus] = useState<PersonStatus | 'Все'>('Все');
  const [sortBy, setSortBy] = useState<'score' | 'energy' | 'recency' | 'name'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredSortedPeople = useMemo(() => {
    let result = people.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const noteMatch = p.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const reflectionMatch = p.reflection.toLowerCase().includes(searchQuery.toLowerCase());
      const queryMatch = nameMatch || noteMatch || reflectionMatch;

      const depthMatch = selectedDepth === 'Все' || p.depth === selectedDepth;
      const statusMatch = selectedStatus === 'Все' || p.status === selectedStatus;

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
            placeholder="Поиск связей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="social-search-input"
          />
        </div>
        <button
          className="btn btn--primary social-add-btn"
          onClick={onAddNew}
          aria-label="Добавить новый контакт"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Filter controls */}
      <div className="glass-panel social-filters-panel">
        <div className="social-filters-grid">
          <div>
            <span className="social-filter-label">Круг близости</span>
            <select
              value={selectedDepth}
              onChange={(e) => setSelectedDepth(e.target.value as Depth | 'Все')}
              className="social-filter-select"
            >
              <option value="Все">Все круги</option>
              <option value={Depth.CORE}>Ядро</option>
              <option value={Depth.INNER}>Ближний круг</option>
              <option value={Depth.SOCIAL}>Социальный слой</option>
              <option value={Depth.PERIPHERY}>Периферия</option>
            </select>
          </div>
          <div>
            <span className="social-filter-label">Статус общения</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PersonStatus | 'Все')}
              className="social-filter-select"
            >
              <option value="Все">Все статусы</option>
              <option value={PersonStatus.ACTIVE}>Активен</option>
              <option value={PersonStatus.OCCASIONAL}>Покой</option>
              <option value={PersonStatus.DISTANT}>На расстоянии</option>
              <option value={PersonStatus.CONFLICT}>В конфликте</option>
              <option value={PersonStatus.LOST}>Не общаемся</option>
              <option value={PersonStatus.MENTOR}>Наставник</option>
            </select>
          </div>
        </div>

        <div className="social-sort-row">
          <div className="social-sort-label-group">
            <span className="social-sort-label">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'energy' | 'recency' | 'name')}
              className="social-sort-select"
            >
              <option value="score">Ресурс связи</option>
              <option value="energy">Энергия</option>
              <option value="recency">Свежесть касания</option>
              <option value="name">Имя</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className="btn btn--secondary social-sort-order-btn"
            aria-label="Изменить порядок сортировки"
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
                      {depthLabels[p.depth]}
                    </span>
                    <span
                      className="social-contact-tag-status"
                      style={{
                        background: pill.bg,
                        color: pill.color,
                      }}
                    >
                      {statusLabels[p.status]}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredSortedPeople.length === 0 && (
            <div className="social-contacts-empty">
              Связи не найдены
            </div>
          )}
        </div>
        <div className="social-contacts-footer">
          Всего связей: <strong>{filteredSortedPeople.length}</strong>
        </div>
      </div>
    </div>
  );
}
