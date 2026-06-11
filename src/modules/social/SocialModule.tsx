import { Routes, Route } from 'react-router-dom';
import SocialPage from './SocialPage';
import PersonDetail from './PersonDetail';

export default function SocialModule() {
  return (
    <Routes>
      <Route index element={<SocialPage />} />
      <Route path=":id" element={<PersonDetail />} />
    </Routes>
  );
}
