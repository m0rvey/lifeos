import { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';

const Dashboard = lazy(() => import('./Dashboard'));
const RidesPage = lazy(() => import('./RidesPage'));
const RoutePlanner = lazy(() => import('./RoutePlanner'));
const MaintenancePage = lazy(() => import('./MaintenancePage'));

export default function CyclingModule() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleNavigateTab = (tab: string) => {
    if (tab === '') {
      navigate('/cycling');
    } else {
      navigate(`/cycling/${tab}`);
    }
  };

  return (
    <Suspense fallback={<div className="loading-fallback">{t('common.loading')}</div>}>
      <Routes>
        <Route index element={<Dashboard onNavigateTab={handleNavigateTab} />} />
        <Route path="rides" element={<RidesPage />} />
        <Route path="routes" element={<RoutePlanner />} />
        <Route path="maintenance" element={<MaintenancePage />} />
      </Routes>
    </Suspense>
  );
}
