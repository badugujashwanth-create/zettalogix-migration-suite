import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/auth/RequireAuth";
import AppLayout from "./layouts/AppLayout";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MigrationsPage from "./pages/MigrationsPage";
import MigrationDetailPage from "./pages/MigrationDetailPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import SettingsPage from "./pages/SettingsPage";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<RequireAuth />}>
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/migrations" element={<MigrationsPage />} />
                <Route path="/migrations/:id" element={<MigrationDetailPage />} />
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </AppLayout>
          }
        />
      </Route>
    </Routes>
  );
}
