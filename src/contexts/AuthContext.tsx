import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type Role = 'director' | 'dg' | 'staff';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  signOut: () => Promise<void>;
  isDirector: boolean;
  isDirectorOrDG: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: 'staff',
  loading: true,
  signOut: async () => {},
  isDirector: false,
  isDirectorOrDG: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>('staff');
  const [loading, setLoading] = useState(true);

  // Fetch role from user_roles table
  const fetchRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (data?.role) {
      setRole(data.role as Role);
    } else {
      setRole('staff');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Defer to avoid Supabase auth deadlock
        setTimeout(() => fetchRole(session.user.id), 0);
      } else {
        setRole('staff');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole('staff');
  }, []);

  const isDirector = role === 'director';
  const isDirectorOrDG = role === 'director' || role === 'dg';

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, isDirector, isDirectorOrDG }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
