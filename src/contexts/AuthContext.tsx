import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

  const fetchRole = useCallback(async (userId: string): Promise<Role> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    // No bloquear acceso si la tabla/RLS falla: el usuario entra como staff.
    if (error) {
      console.warn('[auth] user_roles no disponible, usando rol staff:', error.message);
      return 'staff';
    }

    return (data?.role as Role | undefined) ?? 'staff';
  }, []);

  const resetAuthState = useCallback(() => {
    setSession(null);
    setUser(null);
    setRole('staff');
  }, []);

  // Evita loading eterno si Supabase/red/rol se quedan colgados (AuthGuard y Login quedaban bloqueados).
  useEffect(() => {
    const id = window.setTimeout(() => {
      setLoading((prev) => {
        if (!prev) return prev;
        console.warn('[auth] Bootstrap tardó demasiado; liberando pantalla para permitir login.');
        return false;
      });
    }, 15000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    let mounted = true;

    const clearBrokenSession = () => {
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-wipeaufqdiohfdtcbhac-auth-token');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && /^sb-[\w-]+-auth-token$/i.test(k)) {
            localStorage.removeItem(k);
          }
        }
      } catch {
        // Best effort cleanup for corrupted local auth cache.
      }
    };

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
      const nextRole = await fetchRole(userId);
      if (!mounted) return;
      setRole(nextRole);
      setAuthError(null);
      safeSetLoading(false);
    };

    /** Solo errores típicos de refresh inválido — evitar coincidir con cualquier mensaje que diga "session". */
    const isRefreshTokenBroken = (message: string) => {
      const m = message.toLowerCase();
      return (
        m.includes('invalid refresh token') ||
        m.includes('refresh token not found') ||
        m.includes('refresh_token') ||
        (m.includes('refresh') && m.includes('token') && (m.includes('invalid') || m.includes('expired') || m.includes('revoked')))
      );
    };

    const recoverFromSessionError = async (error: unknown) => {
      const message = error instanceof Error ? error.message : 'No pudimos restaurar tu sesión.';
      const isStaleSession = isRefreshTokenBroken(message);

      if (isStaleSession) {
        clearBrokenSession();
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          // noop: local cleanup is the important part
        }
        safeApplySignedOut(
          'Tu sesión anterior expiró o quedó inválida. Vuelve a iniciar sesión.',
        );
        toast.error('Sesión local inválida o expirada. Inicia sesión de nuevo.', { duration: 8000 });
        return;
      }

      safeApplySignedOut(message);
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
