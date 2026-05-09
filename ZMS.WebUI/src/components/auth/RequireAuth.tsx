import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AuthStatusPage from "../../pages/AuthStatusPage";

export default function RequireAuth(): JSX.Element {
  const location = useLocation();
  const { loading, session } = useAuth();

  if (loading) {
    return <AuthStatusPage title="Checking session" message="Validating your Supabase login." />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
