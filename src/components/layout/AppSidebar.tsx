import {
  LayoutDashboard,
  Users,
  Shield,
  AlertTriangle,
  Database,
  Settings,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Agentes', url: '/agent/a1-vcm', icon: Users },
  { title: 'CNA Matrix', url: '/cna', icon: Shield },
  { title: 'Alertas', url: '/alerts', icon: AlertTriangle },
  { title: 'RAG Explorer', url: '/rag', icon: Database },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-[#1E293B]">
      <SidebarContent className="bg-[#0A0F1C] pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                        isActive(item.url)
                          ? 'bg-[#1E293B] text-[#F1F5F9] font-medium'
                          : 'text-[#6B7280] hover:text-[#F1F5F9] hover:bg-[#111827]'
                      }`}
                      activeClassName=""
                    >
                      <item.icon size={18} />
                      {!collapsed && <span>{item.title}</span>}
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
