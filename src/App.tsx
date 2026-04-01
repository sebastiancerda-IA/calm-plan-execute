import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PageContainer } from '@/components/layout/PageContainer';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import Dashboard from './pages/Dashboard';

const AgentDetail = lazy(() => import('./pages/AgentDetail'));
const AgentsList = lazy(() => import('./pages/AgentsList'));
const CNAMatrix = lazy(() => import('./pages/CNAMatrix'));
const Alerts = lazy(() => import('./pages/Alerts'));
const RAGExplorer = lazy(() => import('./pages/RAGExplorer'));
const Settings = lazy(() => import('./pages/Settings'));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
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
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </PageTransition>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CommandPalette />
        <PageContainer>
          <AnimatedRoutes />
        </PageContainer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
