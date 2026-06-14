import { useEffect } from 'react';
import Modal from './Modal';
import { useI18n } from '../i18n';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const { t } = useI18n();

  const shortcuts = [
    { keys: ['Alt', '1-5'], description: t('shortcuts.module_nav') },
    { keys: ['Ctrl', 'S'], description: t('shortcuts.export_backup') },
    { keys: ['Esc'], description: t('shortcuts.close_menu') },
    { keys: ['Tab'], description: t('shortcuts.element_nav') },
    { keys: ['Enter'], description: t('shortcuts.activate_element') },
    { keys: ['?'], description: t('shortcuts.show_shortcuts') },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shortcuts.title')} maxWidth="sm">
      <div className="flex-col-12">
        {shortcuts.map((shortcut, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < shortcuts.length - 1 ? '1px solid var(--border-light)' : 'none',
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
  );
}
