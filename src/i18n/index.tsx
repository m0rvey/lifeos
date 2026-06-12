import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import ru from './locales/ru';
import en from './locales/en';

export type Language = 'ru' | 'en';

const locales: Record<Language, Record<string, string>> = { ru, en };

function detectLanguage(): Language {
  const saved = localStorage.getItem('lifeos-lang') as Language | null;
  if (saved && locales[saved]) return saved;
  const nav = navigator.language || 'ru';
  return nav.startsWith('en') ? 'en' : 'ru';
}

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lifeos-lang', newLang);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let text = locales[lang]?.[key] || locales.ru[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const lang = detectLanguage();
  let text = locales[lang]?.[key] || locales.ru[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}
