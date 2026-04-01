import { useState, useEffect, useRef } from 'react';
import { LogOut, Leaf, Bell } from 'lucide-react';
import { StatusDot } from '@/components/shared/StatusDot';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseAlerts } from '@/hooks/useSupabaseAlerts';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const [now, setNow] = useState(new Date());
  const [uptime, setUptime] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { user, role, signOut } = useAuth();
  const { alerts, counts, resolveAlert } = useSupabaseAlerts();
  const { requestPermission } = useNotifications();
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const uptimeStr = uptime < 60 ? `${uptime}m` : `${Math.floor(uptime / 60)}h ${uptime % 60}m`;
  const roleLabel = role === 'director' ? 'DIRECTOR' : role === 'dg' ? 'DG' : 'STAFF';

  const unresolvedAlerts = alerts.filter((a: any) => !a.resolved).slice(0, 8);

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
        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <Bell size={16} />
            {counts.total > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                {counts.total > 9 ? '9+' : counts.total}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Alertas ({counts.total})</span>
                <button onClick={() => { navigate('/alerts'); setBellOpen(false); }} className="text-[10px] text-primary hover:underline">
                  Ver todas
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {unresolvedAlerts.length === 0 ? (
                  <p className="p-4 text-xs text-muted-foreground text-center">Sin alertas pendientes ✅</p>
                ) : (
                  unresolvedAlerts.map((alert: any) => (
                    <div key={alert.id} className="px-3 py-2.5 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <StatusDot status={alert.priority === 'critica' ? 'error' : alert.priority === 'alta' ? 'procesando' : 'listo'} size={6} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{alert.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{alert.description}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); resolveAlert(alert.id); }}
                          className="text-[9px] text-primary hover:underline shrink-0"
                        >
                          Resolver
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
