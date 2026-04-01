import { useState, useEffect } from 'react';
import { LogOut, Leaf } from 'lucide-react';
import { StatusDot } from '@/components/shared/StatusDot';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from '@/components/shared/NotificationPanel';

export function TopBar() {
  const [now, setNow] = useState(new Date());
  const [uptime, setUptime] = useState(0);
  const { user, role, signOut } = useAuth();
  const { requestPermission } = useNotifications();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      setUptime((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const uptimeStr = uptime < 60 ? `${uptime}m` : `${Math.floor(uptime / 60)}h ${uptime % 60}m`;
  const roleLabel = role === 'director' ? 'DIRECTOR' : role === 'dg' ? 'DG' : 'STAFF';

  return (
    <header className="h-12 flex items-center justify-between bg-sidebar px-4 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-idma-green via-idma-teal to-idma-blue opacity-60" />

      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Leaf size={20} className="text-idma-green" />
            <div className="absolute inset-0 blur-md bg-idma-green/20 rounded-full" />
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight hidden sm:inline">La Orquesta IDMA</span>
        </div>
        <span className="text-[10px] font-mono bg-idma-green/15 text-idma-green-light px-1.5 py-0.5 rounded border border-idma-green/20">v4.2</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Panel (in-app + alerts) */}
        <NotificationPanel />

        <div className="flex items-center gap-2">
          <StatusDot status="operativo" size={6} />
          <span className="text-xs text-idma-green font-medium hidden sm:inline">Activo</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground hidden md:inline">up {uptimeStr}</span>
        <div className="text-xs text-muted-foreground font-mono">
          <span className="hidden sm:inline">{dateStr} </span>{timeStr}
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono hidden md:inline">
              {user.email?.split('@')[0]} <span className="text-idma-green">({roleLabel})</span>
            </span>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
