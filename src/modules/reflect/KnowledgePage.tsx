import { useState, useMemo, useCallback, type MouseEvent } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type KnowledgeItem } from '../../types';
import { Plus, Book, Tag, ExternalLink, Search, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState, ConfirmDialog } from '../../ui';
import { uid, nowISO } from '../../cognitive/helpers';
import KnowledgeModal from './KnowledgeModal';

export default function KnowledgePage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Delete dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(data.knowledge.map((item) => item.category));
    return ['Все', ...Array.from(cats)];
  }, [data.knowledge]);

  const filteredItems = useMemo(() => {
    return data.knowledge.filter((item) => {
      const matchQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'Все' || item.category === selectedCategory;

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
      addToast('Статья БЗ обновлена', 'success');
    } else {
      const newItem: KnowledgeItem = {
        id: `know_${uid()}`,
        title: itemData.title || '',
        category: itemData.category || 'Книги',
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
      addToast('Новые знания добавлены в базу', 'success');
    }
    setIsOpen(false);
  }, [editingItem, dispatch, addToast]);

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
      addToast('Запись БЗ удалена', 'warning');
    }
    setIsDeleteOpen(false);
  }, [itemToDelete, dispatch, addToast]);

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            База знаний (Second Brain)
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Накопление структурированной информации, конспекты книг, статьи и полезные ссылки
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Добавить знания</span>
        </button>
      </div>

      {/* Search and Filters row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 12px', height: '40px', minWidth: '250px' }}>
          <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Искать в конспектах, тегах и заголовках..."
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Раздел:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ height: '40px', padding: '0 12px', fontSize: '0.85rem' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster of knowledge items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                        Категория: <strong>{item.category}</strong> {item.source && ` · Источник: ${item.source}`}
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
                    <button className="btn btn--secondary" style={{ padding: '4px 6px', color: 'var(--error, #ef4444)' }} onClick={(e) => handleDeleteTrigger(e, item.id)}>
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
            title="База знаний пуста"
            description="Ничего не найдено. Добавьте конспекты, статьи или цитаты, чтобы начать формирование вашей базы знаний."
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>Добавить конспект</span>
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
            title="Удалить запись БЗ?"
            message="Вы уверены, что хотите удалить эту статью из базы знаний? Это действие необратимо."
            confirmLabel="Удалить"
            cancelLabel="Отмена"
            variant="danger"
          />
        )}
    </div>
  );
}
