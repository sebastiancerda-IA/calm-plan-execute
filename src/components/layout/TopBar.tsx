import { AudioWaveform } from 'lucide-react';
import { StatusDot } from '@/components/shared/StatusDot';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function TopBar() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="h-12 flex items-center justify-between border-b border-[#1E293B] bg-[#0A0F1C] px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-[#6B7280] hover:text-[#F1F5F9]" />
        <div className="flex items-center gap-2">
          <AudioWaveform size={20} className="text-[#3B82F6]" />
          <span className="font-semibold text-[#F1F5F9] text-sm tracking-tight">La Orquesta IDMA</span>
        </div>
        <span className="text-[10px] font-mono bg-[#1E293B] text-[#6B7280] px-1.5 py-0.5 rounded">v4.2</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <StatusDot status="operativo" size={6} />
          <span className="text-xs text-[#22C55E] font-medium">Sistema activo</span>
        </div>
        <div className="text-xs text-[#6B7280] font-mono">
          {dateStr} {timeStr}
        </div>
      </div>
    </header>
  );
}
