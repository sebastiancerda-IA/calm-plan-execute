import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsMobileApp } from '@/hooks/useIsMobileApp';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  const isMobile = useIsMobile();
  const isApp = useIsMobileApp();
  const useMobileNav = isMobile || isApp;

  if (useMobileNav) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar />
        <main className="flex-1 overflow-auto scroll-smooth p-3 sm:p-4 pb-20">
          {children}
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
