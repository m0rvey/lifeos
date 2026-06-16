export type Language = 'ru' | 'en';

export function getCurrentLanguage(): Language {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('lifeos-lang') as Language | null;
    if (saved && (saved === 'ru' || saved === 'en')) return saved;
  }
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language || 'ru';
    return nav.startsWith('en') ? 'en' : 'ru';
  }
  return 'ru';
}
