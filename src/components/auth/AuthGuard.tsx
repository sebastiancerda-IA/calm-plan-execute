import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <SkeletonLoader />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
