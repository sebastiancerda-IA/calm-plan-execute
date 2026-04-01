import { useState, useEffect } from 'react';
import { AudioWaveform } from 'lucide-react';
import { StatusDot } from '@/components/shared/StatusDot';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function TopBar() {
  const [now, setNow] = useState(new Date());
  const [uptime, setUptime] = useState(0);

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

  return (
    <header className="h-12 flex items-center justify-between border-b border-border bg-sidebar px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex items-center gap-2">
          <AudioWaveform size={20} className="text-primary" />
          <span className="font-semibold text-foreground text-sm tracking-tight">La Orquesta IDMA</span>
        </div>
        <span className="text-[10px] font-mono bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">v4.2</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <StatusDot status="operativo" size={6} />
          <span className="text-xs text-[#22C55E] font-medium">Sistema activo</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
          up {uptimeStr}
        </span>
        <div className="text-xs text-muted-foreground font-mono">
          <span className="hidden sm:inline">{dateStr} </span>{timeStr}
        </div>
      </div>
    </header>
  );
}
