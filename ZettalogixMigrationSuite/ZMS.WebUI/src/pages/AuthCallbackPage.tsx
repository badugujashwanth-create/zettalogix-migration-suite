import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthStatusPage from "./AuthStatusPage";

export default function AuthCallbackPage(): JSX.Element {
  const navigate = useNavigate();
  const { loading, session } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    navigate(session ? "/dashboard" : "/login", { replace: true });
  }, [loading, navigate, session]);

  return <AuthStatusPage title="Completing sign in" message="Finishing the Supabase OAuth callback." />;
}
