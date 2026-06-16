import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type Thought } from '../../types';
import { Plus, BookOpen, Search, Tag, Edit2, Trash2 } from 'lucide-react';
import { StatCard, EmptyState, ConfirmDialog } from '../../ui';
import { uid, nowISO } from '../../cognitive/helpers';
import MuseumModal from './MuseumModal';
import { useI18n } from '../../i18n';

export default function MuseumPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<Thought | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Deletion dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [thoughtToDelete, setThoughtToDelete] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(data.thoughts.map((t) => t.category));
    return ['ALL', ...Array.from(cats)];
  }, [data.thoughts]);

  const filteredThoughts = useMemo(() => {
    return data.thoughts.filter((thought) => {
      const matchQuery =
        thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thought.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || thought.category === selectedCategory;

      return matchQuery && matchCategory;
    });
  }, [data.thoughts, searchQuery, selectedCategory]);

  const sortedThoughts = useMemo(() => {
    return [...filteredThoughts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredThoughts]);

  const handleAddNew = () => {
    setEditingThought(null);
    setIsOpen(true);
  };

  const handleEdit = (thought: Thought) => {
    setEditingThought(thought);
    setIsOpen(true);
  };

  const handleSaveThought = useCallback(
    (thoughtData: Partial<Thought>) => {
      if (editingThought) {
        dispatch({
          type: 'UPDATE_ENTITY',
          entity: 'thoughts',
          id: editingThought.id,
          payload: thoughtData,
        });
        addToast(t('reflect.museum.toast_edited'), 'success');
      } else {
        const newThought: Thought = {
          id: `thou_${uid()}`,
          content: thoughtData.content || '',
          category: thoughtData.category || t('reflect.museum.default_category'),
          tags: thoughtData.tags || [],
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        dispatch({
          type: 'ADD_ENTITY',
          entity: 'thoughts',
          payload: newThought,
        });
        addToast(t('reflect.museum.toast_created'), 'success');
      }
      setIsOpen(false);
    },
    [editingThought, dispatch, addToast, t]
  );

  const handleDeleteTrigger = (id: string) => {
    setThoughtToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = useCallback(() => {
    if (thoughtToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'thoughts',
        id: thoughtToDelete,
      });
      setThoughtToDelete(null);
      addToast(t('reflect.museum.toast_deleted'), 'warning');
    }
    setIsDeleteOpen(false);
  }, [thoughtToDelete, dispatch, addToast, t]);

  return (
    <div className="flex-col-24 fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2
            style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}
          >
            {t('reflect.museum.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {t('reflect.museum.subtitle')}
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={handleAddNew}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>{t('reflect.museum.add')}</span>
        </button>
      </div>

      {/* Summary Stat */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          label={t('reflect.museum.total_label')}
          value={data.thoughts.length}
          subtitle={t('reflect.museum.total_sub')}
          icon={<BookOpen size={20} />}
          accent
        />
      </div>

      {/* Search and Category Filter row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div
          className="glass-panel"
          style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            height: '40px',
            minWidth: '250px',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
          <input
            type="text"
            placeholder={t('reflect.museum.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {t('reflect.museum.category_label')}
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ height: '40px', padding: '0 34px 0 12px', fontSize: '0.85rem' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? t('filter.all') : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards list in Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {sortedThoughts.length > 0 ? (
          sortedThoughts.map((thought) => (
            <div
              key={thought.id}
              className="glass-panel"
              style={{
                padding: '24px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(124, 77, 255, 0.05)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(124, 77, 255, 0.15)',
                    }}
                  >
                    {thought.category}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn--secondary"
                      style={{ padding: '4px 6px' }}
                      onClick={() => handleEdit(thought)}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn btn--secondary btn-padding-4-6-red"
                      onClick={() => handleDeleteTrigger(thought.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.95rem',
                    fontStyle: 'italic',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  « {thought.content} »
                </p>
              </div>

              {thought.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                    marginTop: '12px',
                  }}
                >
                  {thought.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <Tag size={8} />
                      <span>#{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              icon={<BookOpen size={48} />}
              title={t('reflect.museum.empty_title')}
              description={t('reflect.museum.empty_desc')}
              action={
                <button className="btn btn--primary" onClick={handleAddNew}>
                  <Plus size={14} />
                  <span>{t('reflect.museum.save')}</span>
                </button>
              }
            />
          </div>
        )}
      </div>

      {isOpen && (
        <MuseumModal
          isOpen={isOpen}
          thought={editingThought}
          onClose={() => setIsOpen(false)}
          onSave={handleSaveThought}
        />
      )}

      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteOpen(false)}
          title={t('reflect.museum.delete_title')}
          message={t('reflect.museum.delete_message')}
          confirmLabel={t('action.delete')}
          cancelLabel={t('action.cancel')}
          variant="danger"
        />
      )}
    </div>
  );
}
