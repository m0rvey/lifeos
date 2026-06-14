import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTagRegistry } from '../context/TagRegistry';

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagPicker({ value, onChange, placeholder = 'Add tag...' }: TagPickerProps) {
  const { allTags } = useTagRegistry();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = allTags.filter(
    t => !value.includes(t) && t.toLowerCase().includes(input.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="tag-picker" ref={wrapperRef}>
      <div className="tag-picker-chips">
        {value.map(tag => (
          <span key={tag} className="tag-chip">
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-picker-input"
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleInputKey}
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>

      {showSuggestions && input && suggestions.length > 0 && (
        <div className="tag-picker-suggestions">
          {suggestions.slice(0, 8).map(tag => (
            <button
              key={tag}
              type="button"
              className="tag-picker-suggestion"
              onClick={() => addTag(tag)}
              onMouseDown={e => e.preventDefault()}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
