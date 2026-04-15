import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

/** Rutas ORQUESTA: sesión requerida. La primera pintura no depende de Supabase — solo de AuthContext bootstrap. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <SkeletonLoader />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
