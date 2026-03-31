import { mockCriteria } from '@/data/mockCNA';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const levelColors = {
  N1: '#991B1B',
  N2: '#854D0E',
  N3: '#166534',
};

const criticalIds = ['C13', 'C14'];

export function CNASnapshot() {
  return (
    <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4 h-full">
      <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
        CNA Snapshot
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {mockCriteria.map((c) => (
          <Tooltip key={c.id}>
            <TooltipTrigger asChild>
              <div
                className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                  criticalIds.includes(c.id) ? 'ring-1 ring-[#EF4444] animate-pulse-slow' : ''
                }`}
                style={{ backgroundColor: levelColors[c.currentLevel] }}
              >
                <span className="font-mono text-xs font-bold text-[#F1F5F9]">{c.id}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1E293B] border-[#374151] text-[#F1F5F9]">
              <p className="font-semibold text-xs">{c.name}</p>
              <p className="text-[10px] text-[#9CA3AF]">
                {c.currentLevel} → {c.targetLevel}
                {c.gap && ` | ${c.gap}`}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-[#6B7280]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded" style={{ backgroundColor: '#991B1B' }} /> N1 Brecha
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded" style={{ backgroundColor: '#854D0E' }} /> N2 En meta
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded" style={{ backgroundColor: '#166534' }} /> N3 Fortaleza
        </span>
      </div>
    </div>
  );
}
