import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import TournamentDetailPage from '@/pages/TournamentDetailPage';
import AnalysisPage from '@/pages/AnalysisPage';
import CalculatorPage from '@/pages/CalculatorPage';
import PlayerProfilePage from '@/pages/PlayerProfilePage';
import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import CookiesPage from '@/pages/CookiesPage';
import TournamentsPage from '@/pages/TournamentsPage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  const initialize = useAuthStore(s => s.initialize);

  // Initialize Supabase auth session on app load
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/:slug" element={<TournamentDetailPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/player/:username" element={<PlayerProfilePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
