/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from './DataContext';
import type { ModuleKey, ThemeType, ThemeMode, ToastMessage } from '../types';
import { useI18n } from '../i18n';

interface AppContextValue {
  activeModule: ModuleKey;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  userName: string;
  setUserName: (name: string) => void;
  isAdaptive: boolean;
  setIsAdaptive: (adaptive: boolean) => void;
  accentColor: 'purple' | 'orange' | 'green' | 'blue' | 'rose';
  setAccentColor: (accent: 'purple' | 'orange' | 'green' | 'blue' | 'rose') => void;
  fontSizeScale: number;
  setFontSizeScale: (scale: number) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getModuleTheme(module: ModuleKey): ThemeType {
  const map: Record<ModuleKey, ThemeType> = {
    hub: 'slate',
    social: 'mindveyz',
    finance: 'slate',
    cycling: 'cyclist',
    reflect: 'reflect',
    analytics: 'reflect',
    settings: 'slate',
  };
  return map[module] || 'slate';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data, dispatch } = useData();
  const { t } = useI18n();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // 1. Derive active module from location path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const validModules: ModuleKey[] = ['hub', 'social', 'finance', 'cycling', 'reflect', 'analytics', 'settings'];
  const activeModule: ModuleKey = validModules.includes(pathParts[0] as ModuleKey) ? (pathParts[0] as ModuleKey) : 'hub';

  const settings = data.settings;
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // 2. Settings setters that dispatch to DataContext
  const setTheme = useCallback((t: ThemeType) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settingsRef.current,
          theme: t,
          themeMode: 'manual',
        },
      },
    });
  }, [dispatch]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settingsRef.current,
          themeMode: mode,
          isAdaptive: mode === 'adaptive',
        },
      },
    });
  }, [dispatch]);

  const setIsAdaptive = useCallback((v: boolean) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settingsRef.current,
          isAdaptive: v,
          theme: v ? getModuleTheme(activeModule) : settingsRef.current.theme,
        },
      },
    });
  }, [dispatch, activeModule]);

  const setAccentColor = useCallback((accent: 'purple' | 'orange' | 'green' | 'blue' | 'rose') => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settingsRef.current,
          accentColor: accent,
        },
      },
    });
  }, [dispatch]);

  const setUserName = useCallback((name: string) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settingsRef.current,
          userName: name,
        },
      },
    });
  }, [dispatch]);

  const setFontSizeScale = useCallback((scale: number) => {
    // clamp between 0.8 and 1.2
    const clamped = Math.min(Math.max(scale, 0.8), 1.2);
    dispatch({
      type: 'SET_DATA',
      payload: {
        settings: {
          ...settingsRef.current,
          fontSizeScale: clamped,
        },
      },
    });
  }, [dispatch]);

  // 3. Toasts manager
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timersRef.current.delete(id);
    }, duration);
    timersRef.current.set(id, timer);
  }, []);

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Cleanup all toast timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // 4. Adaptive theme update on module change
  useEffect(() => {
    if (settings.themeMode === 'adaptive' || (settings.isAdaptive && settings.themeMode !== 'system')) {
      const targetTheme = getModuleTheme(activeModule);
      if (targetTheme !== settings.theme) {
        dispatch({
          type: 'SET_DATA',
          payload: {
            settings: {
              ...settings,
              theme: targetTheme,
            },
          },
        });
      }
    }
  }, [activeModule, settings.themeMode, settings.isAdaptive, settings.theme, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4b. System theme detection
  useEffect(() => {
    if (settings.themeMode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = (isDark: boolean) => {
      const systemTheme: ThemeType = isDark ? 'slate' : 'reflect';
      if (systemTheme !== settings.theme) {
        dispatch({
          type: 'SET_DATA',
          payload: {
            settings: {
              ...settingsRef.current,
              theme: systemTheme,
            },
          },
        });
      }
    };

    applySystemTheme(mq.matches);
    const handler = (e: MediaQueryListEvent) => applySystemTheme(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.themeMode, settings.theme, dispatch]);


  // 5. Sync theme, accent and font scale to document element
  useEffect(() => {
    const themes: ThemeType[] = ['mindveyz', 'cyclist', 'reflect', 'slate'];
    themes.forEach(theme => document.body.classList.remove(`theme-${theme}`));
    document.body.classList.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  useEffect(() => {
    const accents = ['purple', 'orange', 'green', 'blue', 'rose'];
    accents.forEach(a => document.body.classList.remove(`accent-${a}`));
    document.body.classList.add(`accent-${settings.accentColor}`);
  }, [settings.accentColor]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSizeScale * 100}%`;
  }, [settings.fontSizeScale]);

  useEffect(() => {
    const handleStorageError = (e: Event) => {
      const customEvent = e as CustomEvent;
      const errorMsg = customEvent.detail?.message || t('error.storage_quota');
      addToast(t('error.save_failed', { message: errorMsg }), 'error', 5000);
    };
    window.addEventListener('storage-error', handleStorageError);
    return () => window.removeEventListener('storage-error', handleStorageError);
  }, [addToast, t]);

  return (
    <AppContext.Provider
      value={{
        activeModule,
        theme: settings.theme,
        setTheme,
        themeMode: settings.themeMode,
        setThemeMode,
        userName: settings.userName,
        setUserName,
        isAdaptive: settings.isAdaptive,
        setIsAdaptive,
        accentColor: settings.accentColor,
        setAccentColor,
        fontSizeScale: settings.fontSizeScale,
        setFontSizeScale,
        toasts,
        addToast,
        removeToast,
        isSidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
