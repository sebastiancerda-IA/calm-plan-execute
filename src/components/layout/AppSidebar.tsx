import {
  LayoutDashboard, Users, Shield, AlertTriangle, Database, Settings,
  GraduationCap, DollarSign, Handshake,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRAGCount } from '@/hooks/useRAGCount';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

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

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isDirectorOrDG } = useAuth();
  const ragCount = useRAGCount();

  const isActive = (url: string) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url);
  };

  const visibleItems = navItems.filter(item => !item.restricted || isDirectorOrDG);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
                      {!collapsed && (
                        <span className="flex items-center gap-2">
                          {item.title}
                          {item.showBadge && ragCount > 0 && (
                            <span className="min-w-[18px] h-[18px] rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center px-1">
                              {ragCount}
                            </span>
                          )}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
