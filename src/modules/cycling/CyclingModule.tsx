import React, { Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

const Dashboard = React.lazy(() => import('./Dashboard'));
const RidesPage = React.lazy(() => import('./RidesPage'));
const RoutePlanner = React.lazy(() => import('./RoutePlanner'));
const MaintenancePage = React.lazy(() => import('./MaintenancePage'));

export default function CyclingModule() {
  const navigate = useNavigate();

  const handleNavigateTab = (tab: string) => {
    if (tab === '') {
      navigate('/cycling');
    } else {
      navigate(`/cycling/${tab}`);
    }
  };

  return (
    <Suspense fallback={<div className="loading-fallback">Загрузка...</div>}>
      <Routes>
        <Route 
          index 
          element={
            <Dashboard 
              onNavigateTab={handleNavigateTab} 
            />
          } 
        />
        <Route path="rides" element={<RidesPage />} />
        <Route path="routes" element={<RoutePlanner />} />
        <Route path="maintenance" element={<MaintenancePage />} />
      </Routes>
    </Suspense>
  );
}
