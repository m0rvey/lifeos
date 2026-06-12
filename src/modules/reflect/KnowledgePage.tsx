import { useState, useMemo, useCallback, type MouseEvent } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type KnowledgeItem } from '../../types';
import { Plus, Book, Tag, ExternalLink, Search, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState, ConfirmDialog } from '../../ui';
import { uid, nowISO } from '../../cognitive/helpers';
import KnowledgeModal from './KnowledgeModal';
import { useI18n } from '../../i18n';

export default function KnowledgePage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Delete dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const getCategoryLabel = useCallback((cat: string) => {
    switch (cat) {
      case 'Книги':
      case 'Books':
        return t('reflect.knowledge.category_books');
      case 'Статьи':
      case 'Articles':
        return t('reflect.knowledge.category_articles');
      case 'Видео':
      case 'Videos':
        return t('reflect.knowledge.category_videos');
      case 'Подкасты':
      case 'Podcasts':
        return t('reflect.knowledge.category_podcasts');
      case 'Методология':
      case 'Methodology':
        return t('reflect.knowledge.category_methodology');
      default:
        return cat;
    }
  }, [t]);

  const categories = useMemo(() => {
    const cats = new Set(data.knowledge.map((item) => item.category));
    return ['ALL', ...Array.from(cats)];
  }, [data.knowledge]);

  const filteredItems = useMemo(() => {
    return data.knowledge.filter((item) => {
      const matchQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchQuery && matchCategory;
    });
  }, [data.knowledge, searchQuery, selectedCategory]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsOpen(true);
  };

  const handleEdit = (e: MouseEvent, item: KnowledgeItem) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsOpen(true);
  };

  const handleSaveItem = useCallback((itemData: Partial<KnowledgeItem>) => {
    if (editingItem) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'knowledge',
        id: editingItem.id,
        payload: itemData
      });
      addToast(t('reflect.knowledge.toast_updated'), 'success');
    } else {
      const newItem: KnowledgeItem = {
        id: `know_${uid()}`,
        title: itemData.title || '',
        category: itemData.category || t('reflect.knowledge.category_books_val'),
        source: itemData.source || '',
        url: itemData.url || '',
        content: itemData.content || '',
        tags: itemData.tags || [],
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'knowledge',
        payload: newItem
      });
      addToast(t('reflect.knowledge.toast_created'), 'success');
    }
    setIsOpen(false);
  }, [editingItem, dispatch, addToast, t]);

  const handleDeleteTrigger = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'knowledge',
        id: itemToDelete
      });
      setItemToDelete(null);
      addToast(t('reflect.knowledge.toast_deleted'), 'warning');
    }
    setIsDeleteOpen(false);
  }, [itemToDelete, dispatch, addToast, t]);

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  return (
    <div className="flex-col-24 fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t('reflect.knowledge.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {t('reflect.knowledge.subtitle')}
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>{t('reflect.knowledge.action_add')}</span>
        </button>
      </div>

      {/* Search and Filters row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 12px', height: '40px', minWidth: '250px' }}>
          <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
          <input
            type="text"
            placeholder={t('reflect.knowledge.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('reflect.knowledge.filter_section_label')}</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ height: '40px', padding: '0 12px', fontSize: '0.85rem' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? t('filter.all') : getCategoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster of knowledge items */}
      <div className="flex-col-12">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <div 
                key={item.id}
                className="glass-panel"
                onClick={() => toggleExpand(item.id)}
                style={{
                  padding: '16px 20px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Book size={18} style={{ color: 'var(--accent)' }} />
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{item.title}</h3>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        {t('reflect.knowledge.card_category_label')} <strong>{getCategoryLabel(item.category)}</strong> {item.source && ` · ${t('reflect.knowledge.card_source_label')} ${item.source}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button className="btn btn--secondary" style={{ padding: '4px 6px' }} onClick={(e) => handleEdit(e, item)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn btn--secondary btn-padding-4-6-red" onClick={(e) => handleDeleteTrigger(e, item.id)}>
                      <Trash2 size={12} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: '0 0 12px 0' }}>
                      {item.content}
                    </p>

                    {item.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {item.tags.map((tag) => (
                          <span 
                            key={tag} 
                            style={{ 
                              fontSize: '0.7rem', 
                              background: 'rgba(124, 77, 255, 0.05)', 
                              border: '1px solid rgba(124, 77, 255, 0.15)', 
                              color: 'var(--accent)', 
                              padding: '2px 8px', 
                              borderRadius: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Tag size={10} />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={<Book size={48} />}
            title={t('reflect.knowledge.empty_title')}
            description={t('reflect.knowledge.empty_description')}
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>{t('reflect.knowledge.action_add_summary')}</span>
              </button>
            }
          />
        )}
      </div>

        {isOpen && (
          <KnowledgeModal
            isOpen={isOpen}
            item={editingItem}
            onClose={() => setIsOpen(false)}
            onSave={handleSaveItem}
          />
        )}

        {isDeleteOpen && (
          <ConfirmDialog
            isOpen={isDeleteOpen}
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteOpen(false)}
            title={t('reflect.knowledge.confirm_delete_title')}
            message={t('reflect.knowledge.confirm_delete_message')}
            confirmLabel={t('action.delete')}
            cancelLabel={t('action.cancel')}
            variant="danger"
          />
        )}
    </div>
  );
}
