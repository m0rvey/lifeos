import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useI18n } from '../../i18n';

const CapitalPage = lazy(() => import('./CapitalPage'));
const ReminderList = lazy(() => import('./ReminderList'));

export default function FinanceModule() {
  const { t } = useI18n();

  return (
    <Suspense fallback={<div className="loading-fallback">{t('common.loading')}</div>}>
      <Routes>
        <Route index element={<CapitalPage />} />
        <Route path="reminders" element={<ReminderList />} />
      </Routes>
    </Suspense>
  );
}
