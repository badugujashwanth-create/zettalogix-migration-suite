import type { AuthChangeEvent, Provider, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "../lib/client";
import { disableDemoMode, isDemoMode } from "../services/demoMode";

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  user: User | null;
  supabase: SupabaseClient | null;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const supabase = useMemo(() => isSupabaseConfigured() ? createClient() : null, []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!active) {
        return;
      }

      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    session,
    user: session?.user ?? null,
    supabase,
    async signInWithOAuth(provider) {
      if (!supabase) throw new Error("Supabase sign-in is not configured for this deployment.");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    },
    async signInWithEmail(email) {
      if (!supabase) throw new Error("Supabase sign-in is not configured for this deployment.");
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    },
    async signOut() {
      if (isDemoMode()) {
        disableDemoMode();
        return;
      }
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    }
  }), [loading, session, supabase]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
