import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PageContainer } from '@/components/layout/PageContainer';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Dashboard from './pages/Dashboard';

const AgentDetail = lazy(() => import('./pages/AgentDetail'));
const AgentsList = lazy(() => import('./pages/AgentsList'));
const CNAMatrix = lazy(() => import('./pages/CNAMatrix'));
const Alerts = lazy(() => import('./pages/Alerts'));
const RAGExplorer = lazy(() => import('./pages/RAGExplorer'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));

const queryClient = new QueryClient();

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    const agentsChannel = supabase
      .channel('agents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        qc.invalidateQueries({ queryKey: ['agents'] });
      })
      .subscribe();

    const alertsChannel = supabase
      .channel('new-alerts')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'alerts',
        filter: 'priority=eq.critica',
      }, (payload) => {
        toast.error(`Alerta crítica: ${(payload.new as any).title}`, { duration: 8000 });
        qc.invalidateQueries({ queryKey: ['alerts'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [qc]);

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<SkeletonLoader />} key={location.pathname}>
        <PageTransition>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/agents" element={<AuthGuard><AgentsList /></AuthGuard>} />
            <Route path="/agent/:id" element={<AuthGuard><AgentDetail /></AuthGuard>} />
            <Route path="/cna" element={<AuthGuard><CNAMatrix /></AuthGuard>} />
            <Route path="/alerts" element={<AuthGuard><Alerts /></AuthGuard>} />
            <Route path="/rag" element={<AuthGuard><RAGExplorer /></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          </Routes>
        </PageTransition>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RealtimeProvider>
            <CommandPalette />
            <Routes>
              <Route path="/login" element={
                <Suspense fallback={<SkeletonLoader />}><Login /></Suspense>
              } />
              <Route path="/*" element={
                <AuthGuard>
                  <PageContainer>
                    <AnimatedRoutes />
                  </PageContainer>
                </AuthGuard>
              } />
            </Routes>
          </RealtimeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
