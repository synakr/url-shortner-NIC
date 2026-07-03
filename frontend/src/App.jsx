import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import AuthSessionSync    from './components/AuthSessionSync';
import AppLayout         from './components/AppLayout';
import RequireAuth       from './components/RequireAuth';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import VerifyEmailPage   from './pages/VerifyEmailPage';
import ChangeEmailPage   from './pages/ChangeEmailPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage     from './pages/DashboardPage';
import MyUrlsPage        from './pages/MyUrlsPage';
import ExpiredUrlsPage   from './pages/ExpiredUrlsPage';
import AnalyticsPage     from './pages/AnalyticsPage';
import UrlAnalyticsPage  from './pages/UrlAnalyticsPage';
import ProfilePage       from './pages/ProfilePage';
import AdminPage         from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AuthSessionSync />
          <Routes>
            {/* Auth pages (standalone) */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/change-email" element={<ChangeEmailPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* App shell — dashboard is public, others require auth */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route element={<RequireAuth />}>
                <Route path="/my-urls"          element={<MyUrlsPage />} />
                <Route path="/expired-urls"    element={<ExpiredUrlsPage />} />
                <Route path="/analytics"      element={<AnalyticsPage />} />
                <Route path="/analytics/:urlId" element={<UrlAnalyticsPage />} />
                <Route path="/profile"          element={<ProfilePage />} />
                <Route path="/admin"            element={<AdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
