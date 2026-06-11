import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const CapitalPage = React.lazy(() => import('./CapitalPage'));
const ReminderList = React.lazy(() => import('./ReminderList'));

export default function FinanceModule() {
  return (
    <Suspense fallback={<div className="loading-fallback">Загрузка...</div>}>
      <Routes>
        <Route index element={<CapitalPage />} />
        <Route path="reminders" element={<ReminderList />} />
      </Routes>
    </Suspense>
  );
}

