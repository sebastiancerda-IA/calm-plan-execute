import {
  LayoutDashboard, Users, Shield, AlertTriangle, Database, Settings,
  GraduationCap, DollarSign, Handshake,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRAGCount } from '@/hooks/useRAGCount';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, restricted: false },
  { title: 'Agentes', url: '/agents', icon: Users, restricted: false },
  { title: 'CNA Matrix', url: '/cna', icon: Shield, restricted: false },
  { title: 'Acreditación', url: '/acreditacion', icon: GraduationCap, restricted: false },
  { title: 'Finanzas', url: '/finanzas', icon: DollarSign, restricted: true },
  { title: 'Convenios', url: '/convenios', icon: Handshake, restricted: false },
  { title: 'Alertas', url: '/alerts', icon: AlertTriangle, restricted: false },
  { title: 'RAG Explorer', url: '/rag', icon: Database, restricted: false, showBadge: true },
  { title: 'Settings', url: '/settings', icon: Settings, restricted: false },
];

interface AppSidebarProps {
  open?: boolean;
}

export function AppSidebar({ open = true }: AppSidebarProps) {
  const location = useLocation();
  const { isDirectorOrDG } = useAuth();
  const ragCount = useRAGCount();

  const isActive = (url: string) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url);
  };

  const visibleItems = navItems.filter(item => !item.restricted || isDirectorOrDG);

  return (
    <aside className={`${open ? 'w-64' : 'w-0'} hidden md:flex shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-linear overflow-hidden`}>
      <div className="w-64 pt-2">
        <nav className="px-2">
          <ul className="space-y-1">
            {visibleItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === '/'}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive(item.url)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                  }`}
                  activeClassName=""
                >
                  <item.icon size={18} />
                  <span className="flex items-center gap-2">
                    {item.title}
                    {item.showBadge && ragCount > 0 && (
                      <span className="min-w-[18px] h-[18px] rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center px-1">
                        {ragCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
