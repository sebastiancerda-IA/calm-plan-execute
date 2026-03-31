import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface MetricTileProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
  color?: string;
  suffix?: string;
}

export function MetricTile({ label, value, trend, sparkline, color = '#3B82F6', suffix }: MetricTileProps) {
  return (
    <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4 flex flex-col gap-2">
      <span className="text-xs text-[#6B7280] uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-bold text-[#F1F5F9]">
            {value}
            {suffix && <span className="text-sm text-[#6B7280] ml-1">{suffix}</span>}
          </span>
          {trend === 'up' && <ArrowUp size={14} className="text-[#22C55E]" />}
          {trend === 'down' && <ArrowDown size={14} className="text-[#EF4444]" />}
          {trend === 'stable' && <Minus size={14} className="text-[#6B7280]" />}
        </div>
        {sparkline && <Sparkline data={sparkline} color={color} />}
      </div>
    </div>
  );
}
