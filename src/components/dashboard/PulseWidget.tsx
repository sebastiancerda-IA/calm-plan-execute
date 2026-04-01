import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const intensityColors = ['hsl(var(--secondary))', '#1E3A5F', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

export function PulseWidget() {
  // Use real execution data for pulse
  const { data: executions = [] } = useQuery({
    queryKey: ['pulse_executions'],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 3600000).toISOString();
      const { data } = await supabase
        .from('executions')
        .select('started_at, items_processed')
        .gte('started_at', since)
        .order('started_at', { ascending: true });
      return data || [];
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const data = useMemo(() => {
    const now = new Date();
    const hourBuckets = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 3600000);
      const h = hour.getHours();
      const start = new Date(hour);
      start.setMinutes(0, 0, 0);
      const end = new Date(start.getTime() + 3600000);

      const count = executions.filter((e: any) => {
        const t = new Date(e.started_at).getTime();
        return t >= start.getTime() && t < end.getTime();
      }).length;

      return {
        hour: `${h.toString().padStart(2, '0')}:00`,
        intensity: Math.min(count, 6),
        label: `${h.toString().padStart(2, '0')}:00 — ${count} eventos`,
      };
    });
    return hourBuckets;
  }, [executions]);

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
        Pulso del Sistema — Últimas 24h
      </h3>
      <div className="flex gap-0.5">
        {data.map((d, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className="flex-1 h-6 rounded-sm transition-colors cursor-default"
                style={{
                  backgroundColor: intensityColors[Math.min(d.intensity, intensityColors.length - 1)],
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-secondary border-border text-foreground">
              <p className="text-[10px] font-mono">{d.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-muted-foreground font-mono">
        <span>{data[0]?.hour}</span>
        <span>{data[11]?.hour}</span>
        <span>{data[23]?.hour}</span>
      </div>
    </div>
  );
}
