import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PageContainer } from '@/components/layout/PageContainer';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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
const Acreditacion = lazy(() => import('./pages/Acreditacion'));
const Finanzas = lazy(() => import('./pages/Finanzas'));
const Convenios = lazy(() => import('./pages/Convenios'));
const Install = lazy(() => import('./pages/Install'));
const Login = lazy(() => import('./pages/Login'));
const CommandPalette = lazy(() => import('./components/shared/CommandPalette').then(m => ({ default: m.CommandPalette })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Realtime: only agents table here. Alerts + RAG are in useNotifications (single source).
function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    const agentsChannel = supabase
      .channel('agents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        qc.invalidateQueries({ queryKey: ['agents'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(agentsChannel);
    };
  }, [qc, session]);

  return <>{children}</>;
}

function AuthenticatedApp() {
  const location = useLocation();
  return (
    <PageContainer>
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <AnimatePresence mode="wait">
        <Suspense fallback={<SkeletonLoader />} key={location.pathname}>
          <PageTransition>
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<AgentsList />} />
              <Route path="/agent/:id" element={<AgentDetail />} />
              <Route path="/cna" element={<CNAMatrix />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/rag" element={<RAGExplorer />} />
              <Route path="/acreditacion" element={<Acreditacion />} />
              <Route path="/finanzas" element={<Finanzas />} />
              <Route path="/convenios" element={<Convenios />} />
              <Route path="/install" element={<Install />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </AnimatePresence>
    </PageContainer>
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
            <Routes>
              <Route path="/login" element={
                <Suspense fallback={<SkeletonLoader />}><Login /></Suspense>
              } />
              <Route path="/*" element={
                <AuthGuard><AuthenticatedApp /></AuthGuard>
              } />
            </Routes>
          </RealtimeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
