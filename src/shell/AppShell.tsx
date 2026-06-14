import { type ReactNode, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import SettingsModal from './SettingsModal';
import SearchOverlay from '../ui/SearchOverlay';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n';

interface AppShellProps {
  children: ReactNode;
}

const PATH_I18N: Record<string, string> = {
  hub: 'nav.hub',
  social: 'nav.social',
  person: 'breadcrumb.view',
  finance: 'nav.finance',
  reminders: 'sidebar.reminders',
  cycling: 'nav.cycling',
  rides: 'sidebar.rides',
  routes: 'sidebar.routes',
  maintenance: 'sidebar.maintenance',
  reflect: 'nav.reflect',
  journal: 'sidebar.journal',
  knowledge: 'sidebar.knowledge',
  schedule: 'sidebar.schedule',
  habits: 'sidebar.habits',
  thoughts: 'sidebar.thoughts',
  workouts: 'sidebar.workouts',
  analytics: 'nav.analytics',
};

export default function AppShell({ children }: AppShellProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { toasts, removeToast } = useApp();
  const { t } = useI18n();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const pathnames = location.pathname.split('/').filter((x) => x);
  const showBreadcrumbs = pathnames.length > 0 && pathnames[0] !== 'hub';

  return (
    <div className="app-shell">
      {/* Background blobs for visual style */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />

      {/* Header navbar */}
      <AppHeader
        onOpenSettings={() => setShowSettings(true)}
        onOpenSearch={() => setShowSearch(true)}
      />

      {/* App main layout */}
      <div className="app-body">
        <AppSidebar />
        <main className="app-main">
          {showBreadcrumbs && (
            <nav className="breadcrumbs" aria-label="breadcrumb">
              <Link to="/hub" className="breadcrumb-item-link">
                {t('breadcrumb.hub')}
              </Link>
              <span className="breadcrumb-separator">/</span>
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                const i18nKey = PATH_I18N[value];
                const label = i18nKey ? t(i18nKey) : value;

                return last ? (
                  <span key={to} className="breadcrumb-item active">
                    {label}
                  </span>
                ) : (
                  <span key={to} className="breadcrumb-item">
                    <Link to={to} className="breadcrumb-item-link">
                      {label}
                    </Link>
                    <span className="breadcrumb-separator">/</span>
                  </span>
                );
              })}
            </nav>
          )}
          {children}
        </main>
      </div>

      {/* Toast notifications portal */}
      {createPortal(
        <div className="toast-container">
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle size={16} />,
              error: <XCircle size={16} />,
              warning: <AlertTriangle size={16} />,
              info: <Info size={16} />,
            };
            return (
              <div
                key={toast.id}
                className={`toast toast--${toast.type}`}
                onClick={() => removeToast(toast.id)}
              >
                <span className="toast-icon">{icons[toast.type]}</span>
                <span className="toast-message">{toast.message}</span>
                <button
                  className="toast-close"
                  onClick={() => removeToast(toast.id)}
                  aria-label={t('action.close')}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}

      {/* SearchOverlay */}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
