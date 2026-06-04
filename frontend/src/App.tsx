import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ResearchPage } from '@/pages/ResearchPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DebatePage } from '@/pages/DebatePage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ResearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="debate/:ticker" element={<DebatePage />} />
          {/* Placeholder routes */}
          <Route path="market" element={<ResearchPage />} />
          <Route path="screener" element={<ResearchPage />} />
          <Route path="calendar" element={<ResearchPage />} />
          <Route path="news" element={<ResearchPage />} />
          <Route path="alerts" element={<ResearchPage />} />
          <Route path="portfolio" element={<ResearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
