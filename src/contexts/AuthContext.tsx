import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type Role = 'director' | 'dg' | 'staff';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  isDirector: boolean;
  isDirectorOrDG: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: 'staff',
  loading: true,
  authError: null,
  signOut: async () => {},
  isDirector: false,
  isDirectorOrDG: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>('staff');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data?.role as Role | undefined) ?? 'staff';
  }, []);

  const resetAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setRole('staff');
  }, []);

  useEffect(() => {
    let mounted = true;

    const safeSetLoading = (value: boolean) => {
      if (mounted) setLoading(value);
    };

    const safeApplySignedOut = (message: string | null = null) => {
      if (!mounted) return;
      resetAuthState();
      setAuthError(message);
      setLoading(false);
    };

    const restoreRole = async (userId: string) => {
      try {
        const nextRole = await fetchRole(userId);
        if (!mounted) return;
        setRole(nextRole);
        setAuthError(null);
      } catch (error) {
        if (!mounted) return;
        setRole('staff');
        setAuthError(error instanceof Error ? error.message : 'No pudimos cargar tus permisos.');
      } finally {
        safeSetLoading(false);
      }
    };

    const recoverFromSessionError = async (error: unknown) => {
      const message = error instanceof Error ? error.message : 'No pudimos restaurar tu sesión.';
      const isStaleSession = /refresh token|session|jwt/i.test(message);

      if (isStaleSession) {
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          // noop: local cleanup below is the important part
        }
      }

      safeApplySignedOut(
        isStaleSession
          ? 'Tu sesión anterior expiró o quedó inválida. Vuelve a iniciar sesión.'
          : message,
      );
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        safeApplySignedOut(null);
        return;
      }

      setAuthError(null);
      setLoading(true);

      setTimeout(() => {
        void restoreRole(nextSession.user.id);
      }, 0);
    });

    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (!data.session?.user) {
          safeApplySignedOut(null);
          return;
        }

        await restoreRole(data.session.user.id);
      } catch (error) {
        await recoverFromSessionError(error);
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole, resetAuthState]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      resetAuthState();
      setAuthError(null);
      setLoading(false);
    }
  }, [resetAuthState]);

  const isDirector = role === 'director';
  const isDirectorOrDG = role === 'director' || role === 'dg';

  return (
    <AuthContext.Provider value={{ user, session, role, loading, authError, signOut, isDirector, isDirectorOrDG }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
