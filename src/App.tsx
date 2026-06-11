import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './shell/AppShell';
import { ErrorBoundary } from './ui';
import { useKeyPress } from './hooks/useKeyPress';
import { exportBackup } from './storage/backup';

// ... (keep the rest unchanged until App component)


// Lazy load module components
const HubPage = React.lazy(() => import('./modules/hub/HubPage'));
const SocialModule = React.lazy(() => import('./modules/social/SocialModule'));
const FinanceModule = React.lazy(() => import('./modules/finance/FinanceModule'));
const CyclingModule = React.lazy(() => import('./modules/cycling/CyclingModule'));
const ReflectModule = React.lazy(() => import('./modules/reflect/ReflectModule'));
const StatisticsPage = React.lazy(() => import('./modules/analytics/StatisticsPage'));

function AppInner() {
  const navigate = useNavigate();
  const { data } = useData();
  const { addToast } = useApp();

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
      addToast('Резервная копия успешно экспортирована', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      addToast(`Ошибка при экспорте резервной копии: ${message}`, 'error');
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
          <span style={{ fontSize: '0.85rem' }}>Загрузка модуля платформы...</span>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/hub" replace />} />
          <Route path="/hub" element={<HubPage />} />
          <Route path="/social/*" element={<SocialModule />} />
          <Route path="/finance/*" element={<FinanceModule />} />
          <Route path="/cycling/*" element={<CyclingModule />} />
          <Route path="/reflect/*" element={<ReflectModule />} />
          <Route path="/analytics" element={<StatisticsPage />} />
        </Routes>
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
