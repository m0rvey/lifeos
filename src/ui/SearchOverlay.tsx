import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Lightbulb, Users, CheckSquare, BrainCircuit } from 'lucide-react';
import { useGlobalSearch, type SearchResult } from '../hooks/useGlobalSearch';

const TYPE_ICONS: Record<SearchResult['type'], typeof FileText> = {
  journal: FileText,
  knowledge: BrainCircuit,
  thought: Lightbulb,
  person: Users,
  task: CheckSquare,
};

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const results = useGlobalSearch(query);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (prevQuery !== query) {
    setPrevQuery(query);
    setSelectedIndex(0);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = useCallback((result: SearchResult) => {
    onClose();
    navigate(result.url);
  }, [onClose, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="search-overlay-backdrop" onClick={onClose}>
      <div className="search-overlay" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="search-overlay-input-wrapper">
          <Search size={18} className="search-overlay-icon" />
          <input
            ref={inputRef}
            className="search-overlay-input"
            type="text"
            placeholder="Search journal, knowledge, thoughts, people, tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="search-overlay-hint">ESC</kbd>
        </div>

        {query && (
          <div className="search-overlay-results">
            {results.length === 0 ? (
              <div className="search-overlay-empty">No results found</div>
            ) : (
              results.map((result, index) => {
                const Icon = TYPE_ICONS[result.type];
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={`search-overlay-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Icon size={16} className="search-overlay-item-icon" />
                    <div className="search-overlay-item-content">
                      <div className="search-overlay-item-title">{result.title}</div>
                      {result.preview && (
                        <div className="search-overlay-item-preview">{result.preview}</div>
                      )}
                    </div>
                    <span className="search-overlay-item-module">{result.module}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
