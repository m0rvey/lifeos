import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AppProvider, useApp } from './context/AppContext';
import { useI18n } from './i18n';
import AppShell from './shell/AppShell';
import { ErrorBoundary, PageTransition } from './ui';
import { useKeyPress } from './hooks/useKeyPress';
import { exportBackup } from './storage/backup';

// Lazy load module components
const HubPage = lazy(() => import('./modules/hub/HubPage'));
const SocialModule = lazy(() => import('./modules/social/SocialModule'));
const FinanceModule = lazy(() => import('./modules/finance/FinanceModule'));
const CyclingModule = lazy(() => import('./modules/cycling/CyclingModule'));
const ReflectModule = lazy(() => import('./modules/reflect/ReflectModule'));
const StatisticsPage = lazy(() => import('./modules/analytics/StatisticsPage'));

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useData();
  const { addToast } = useApp();
  const { t } = useI18n();

  // Keyboard Shortcuts: Alt+1 to Alt+5 for navigation, Ctrl+S for export backup
  useKeyPress('1', () => navigate('/hub'), { alt: true });
  useKeyPress('2', () => navigate('/social'), { alt: true });
  useKeyPress('3', () => navigate('/finance'), { alt: true });
  useKeyPress('4', () => navigate('/cycling'), { alt: true });
  useKeyPress('5', () => navigate('/reflect'), { alt: true });
  
  useKeyPress('s', (e) => {
    e.preventDefault();
    try {
      exportBackup(data);
      addToast(t('toast.export_success'), 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addToast(t('error.save_failed', { message }), 'error');
    }
  }, { ctrl: true });

  return (
    <AppShell>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '400px',
          color: 'var(--text-secondary)',
          gap: '16px'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '0.85rem' }}>{t('loading')}</span>
        </div>
      }>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Navigate to="/hub" replace />} />
            <Route path="/hub" element={<ErrorBoundary key={location.pathname}><HubPage /></ErrorBoundary>} />
            <Route path="/social/*" element={<ErrorBoundary key={location.pathname}><SocialModule /></ErrorBoundary>} />
            <Route path="/finance/*" element={<ErrorBoundary key={location.pathname}><FinanceModule /></ErrorBoundary>} />
            <Route path="/cycling/*" element={<ErrorBoundary key={location.pathname}><CyclingModule /></ErrorBoundary>} />
            <Route path="/reflect/*" element={<ErrorBoundary key={location.pathname}><ReflectModule /></ErrorBoundary>} />
            <Route path="/analytics" element={<ErrorBoundary key={location.pathname}><StatisticsPage /></ErrorBoundary>} />
          </Routes>
        </PageTransition>
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppProvider>
        <ErrorBoundary>
          <AppInner />
        </ErrorBoundary>
      </AppProvider>
    </DataProvider>
  );
}
