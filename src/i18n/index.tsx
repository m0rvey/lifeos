import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import LoadingScreen from '../ui/LoadingScreen';
import { getCurrentLanguage, type Language } from './language';

function detectLanguage(): Language {
  return getCurrentLanguage();
}

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    setIsLoading(true);
    localStorage.setItem('lifeos-lang', newLang);
  }, []);

  useEffect(() => {
    let active = true;

    const loadTranslations = async () => {
      try {
        let module;
        if (lang === 'ru') {
          module = await import('./locales/ru');
        } else {
          module = await import('./locales/en');
        }
        if (active) {
          setTranslations(module.default);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load translations', err);
        if (active) setIsLoading(false);
      }
    };

    loadTranslations();

    return () => {
      active = false;
    };
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let text = translations[key] || key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    [translations]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
