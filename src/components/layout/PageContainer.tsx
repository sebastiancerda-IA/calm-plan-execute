import { ReactNode, useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar open={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar showMenuButton onMenuClick={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 overflow-auto scroll-smooth p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
