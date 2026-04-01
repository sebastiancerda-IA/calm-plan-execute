import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function generateActivityData() {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() - (23 - i) * 3600000);
    const h = hour.getHours();
    // Simulate activity: higher during work hours
    let intensity: number;
    if (h >= 7 && h <= 9) intensity = 3 + Math.floor(Math.random() * 4);
    else if (h >= 10 && h <= 18) intensity = 1 + Math.floor(Math.random() * 3);
    else if (h >= 22 || h <= 1) intensity = Math.random() > 0.7 ? 2 : 0; // indexing window
    else intensity = Math.floor(Math.random() * 2);
    return {
      hour: `${h.toString().padStart(2, '0')}:00`,
      intensity,
      label: `${h.toString().padStart(2, '0')}:00 — ${intensity} eventos`,
    };
  });
}

const intensityColors = ['hsl(var(--secondary))', '#1E3A5F', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

export function PulseWidget() {
  const data = useMemo(generateActivityData, []);

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
