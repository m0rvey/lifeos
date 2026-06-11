import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = React.lazy(() => import('./Dashboard'));
const JournalPage = React.lazy(() => import('./JournalPage'));
const KnowledgePage = React.lazy(() => import('./KnowledgePage'));
const SchedulePage = React.lazy(() => import('./SchedulePage'));
const HabitsPage = React.lazy(() => import('./HabitsPage'));
const MuseumPage = React.lazy(() => import('./MuseumPage'));
const WorkoutsPage = React.lazy(() => import('./WorkoutsPage'));

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
