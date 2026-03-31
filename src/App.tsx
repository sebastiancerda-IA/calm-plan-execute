import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PageContainer } from '@/components/layout/PageContainer';
import Dashboard from './pages/Dashboard';

const AgentDetail = lazy(() => import('./pages/AgentDetail'));
const CNAMatrix = lazy(() => import('./pages/CNAMatrix'));
const Alerts = lazy(() => import('./pages/Alerts'));
const RAGExplorer = lazy(() => import('./pages/RAGExplorer'));
const Settings = lazy(() => import('./pages/Settings'));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageContainer>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agent/:id" element={<AgentDetail />} />
              <Route path="/cna" element={<CNAMatrix />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/rag" element={<RAGExplorer />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </PageContainer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
