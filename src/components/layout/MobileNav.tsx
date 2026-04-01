import { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  GraduationCap,
  MoreHorizontal,
} from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/agents', icon: Users, label: 'Agentes' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alertas' },
  { to: '/acreditacion', icon: GraduationCap, label: 'Acredit.' },
  { to: '/settings', icon: MoreHorizontal, label: 'Más' },
];

export const MobileNav = memo(function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
});
