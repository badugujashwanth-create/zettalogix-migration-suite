import type { Provider } from "@supabase/supabase-js";
import type { FormEvent } from "react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { enableDemoMode } from "../services/demoMode";
import styles from "./AuthPage.module.css";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const providerLabels: Array<{ provider: Provider; icon: string; label: string }> = [
  { provider: "google", icon: "account_circle", label: "Continue with Google" }
];

export default function AuthPage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, session, signInWithOAuth, signInWithEmail } = useAuth();
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [pendingEmail, setPendingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const locationState = location.state as LocationState | null;
  const redirectPath = locationState?.from?.pathname ?? "/dashboard";

  if (!loading && session) {
    return <Navigate to={redirectPath} replace />;
  }

  const beginOAuth = async (provider: Provider) => {
    setErrorMessage("");
    setSuccessMessage("");
    setPendingProvider(provider);

    try {
      await signInWithOAuth(provider);
    } catch (error) {
      setPendingProvider(null);
      setErrorMessage(error instanceof Error ? error.message : "Supabase OAuth sign in failed.");
    }
  };

  const beginEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Enter your email address.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setPendingEmail(true);

    try {
      await signInWithEmail(trimmedEmail);
      setSuccessMessage("Check your email for the sign-in link.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Email sign in failed.");
    } finally {
      setPendingEmail(false);
    }
  };

  return (
    <main className={styles.authShell}>
      <section className={styles.authPanel}>
        <div className={styles.brandMark}>Z</div>
        <span className="eyebrow">Secure Access</span>
        <h1>Zettalogix Migration Suite</h1>
        <p>Sign in with Google or request an email link to open the migration control plane.</p>

        <button
          type="button"
          className={styles.providerButton}
          onClick={() => {
            enableDemoMode();
            navigate("/dashboard", { replace: true });
          }}
        >
          <span className="material-symbols-outlined">science</span>
          Explore the synthetic demo
        </button>
        <p>Demo mode uses only fictional data and never calls migration or identity services.</p>

        <div className={styles.providerStack}>
          {providerLabels.map((item) => (
            <button
              key={item.provider}
              type="button"
              className={styles.providerButton}
              onClick={() => void beginOAuth(item.provider)}
              disabled={Boolean(pendingProvider)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {pendingProvider === item.provider ? "Redirecting..." : item.label}
            </button>
          ))}
        </div>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <form className={styles.emailForm} onSubmit={beginEmailSignIn}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button type="submit" className={styles.emailButton} disabled={pendingEmail || Boolean(pendingProvider)}>
            <span className="material-symbols-outlined">mail</span>
            {pendingEmail ? "Sending link..." : "Send sign-in link"}
          </button>
        </form>

        {successMessage ? <p className={styles.authSuccess}>{successMessage}</p> : null}
        {errorMessage ? <p className={styles.authError}>{errorMessage}</p> : null}
      </section>
    </main>
  );
}
