import { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import Modal from './Modal';

const SHORTCUTS = [
  { keys: ['Alt', '1-5'], description: 'Навигация по модулям' },
  { keys: ['Ctrl', 'S'], description: 'Экспорт резервной копии' },
  { keys: ['Esc'], description: 'Закрыть модалку/меню' },
  { keys: ['Tab'], description: 'Навигация по элементам' },
  { keys: ['Enter'], description: 'Активировать элемент' },
  { keys: ['?'], description: 'Показать.shortcuts' },
];

export default function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        className="btn btn--ghost btn--icon"
        onClick={() => setIsOpen(true)}
        aria-label="Горячие клавиши"
        title="Горячие клавиши (?)"
        style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 100 }}
      >
        <Keyboard size={18} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Горячие клавиши" maxWidth="sm">
        <div className="flex-col-12">
          {SHORTCUTS.map((shortcut, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: i < SHORTCUTS.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                {shortcut.description}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
