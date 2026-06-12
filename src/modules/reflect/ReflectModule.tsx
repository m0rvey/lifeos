import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./Dashboard'));
const JournalPage = lazy(() => import('./JournalPage'));
const KnowledgePage = lazy(() => import('./KnowledgePage'));
const SchedulePage = lazy(() => import('./SchedulePage'));
const HabitsPage = lazy(() => import('./HabitsPage'));
const MuseumPage = lazy(() => import('./MuseumPage'));
const WorkoutsPage = lazy(() => import('./WorkoutsPage'));

export default function ReflectModule() {
  return (
    <Suspense fallback={<div className="loading-fallback">Загрузка...</div>}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="thoughts" element={<MuseumPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
      </Routes>
    </Suspense>
  );
}
