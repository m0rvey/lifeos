import { type ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import SettingsModal from './SettingsModal';
import { useApp } from '../context/AppContext';
import { ShortcutsHelp } from '../ui';

interface AppShellProps {
  children: ReactNode;
}

const PATH_LABELS: Record<string, string> = {
  hub: 'Хаб',
  social: 'Социальный круг',
  person: 'Карточка связи',
  finance: 'Капитал',
  reminders: 'Напоминания',
  cycling: 'Велоспорт',
  rides: 'Лог поездок',
  routes: 'Планировщик трасс',
  maintenance: 'Обслуживание',
  reflect: 'Рефлексия',
  journal: 'Дневник настроения',
  knowledge: 'База знаний',
  schedule: 'Gap-Планировщик',
  habits: 'Трекер привычек',
  thoughts: 'Музей мыслей',
  workouts: 'Спортивный лог',
  analytics: 'Аналитика',
};

export default function AppShell({ children }: AppShellProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { toasts, removeToast } = useApp();
  const location = useLocation();

  const showBlobs = true;

  const pathnames = location.pathname.split('/').filter(x => x);
  const showBreadcrumbs = pathnames.length > 0 && pathnames[0] !== 'hub';

  return (
    <div className="app-shell">
      {/* Background blobs for visual style */}
      {showBlobs && (
        <>
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </>
      )}

      {/* Header navbar */}
      <AppHeader onOpenSettings={() => setShowSettings(true)} />

      {/* App main layout */}
      <div className="app-body">
        <AppSidebar />
        <main className="app-main">
          {showBreadcrumbs && (
            <nav className="breadcrumbs" aria-label="breadcrumb">
              <Link to="/hub" className="breadcrumb-item-link">Хаб</Link>
              <span className="breadcrumb-separator">/</span>
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                
                let label = PATH_LABELS[value];
                if (!label) {
                  if (value.includes('_') || value.length > 15) {
                    label = 'Просмотр';
                  } else {
                    label = value;
                  }
                }
                
                return last ? (
                  <span key={to} className="breadcrumb-item active">{label}</span>
                ) : (
                  <span key={to} className="breadcrumb-item">
                    <Link to={to} className="breadcrumb-item-link">{label}</Link>
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
          {toasts.map(toast => {
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
                <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Закрыть">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {/* Keyboard shortcuts help */}
      <ShortcutsHelp />
    </div>
  );
}
