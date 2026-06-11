import { useEffect } from 'react';

interface KeyModifiers {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
}

export function useKeyPress(
  targetKey: string,
  handler: (e: KeyboardEvent) => void,
  modifiers: KeyModifiers = {}
): void {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      // Check target key (case-insensitive)
      if (event.key.toLowerCase() !== targetKey.toLowerCase() && event.code.toLowerCase() !== targetKey.toLowerCase()) {
        return;
      }

      // Verify modifier keys
      if (modifiers.ctrl && !event.ctrlKey) return;
      if (modifiers.alt && !event.altKey) return;
      if (modifiers.shift && !event.shiftKey) return;
      
      // If we expect NO modifiers, make sure they aren't pressed
      if (modifiers.ctrl === false && event.ctrlKey) return;
      if (modifiers.alt === false && event.altKey) return;

      // Ignore if typing inside input, select, or textarea
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable) {
          // Allow Ctrl+S or Alt+Number to pass through even if typing
          const isAppShortcut = event.ctrlKey || event.altKey;
          if (!isAppShortcut) {
            return;
          }
        }
      }

      event.preventDefault();
      handler(event);
    };

    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [targetKey, handler, modifiers.ctrl, modifiers.alt, modifiers.shift]);
}
