import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { useCountUp } from '@/hooks/useCountUp';
import { useNavigate } from 'react-router-dom';

interface MetricTileProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
  color?: string;
  suffix?: string;
  href?: string;
}

export function MetricTile({ label, value, trend, sparkline, color = '#3B82F6', suffix, href }: MetricTileProps) {
  const navigate = useNavigate();
  const numericValue = typeof value === 'number' ? value : null;
  const animatedValue = useCountUp(numericValue ?? 0, 600);

  const content = (
    <div
      className={`rounded-md border border-border bg-card p-4 flex flex-col gap-2 transition-all duration-200 ${
        href ? 'cursor-pointer hover:border-primary hover:bg-card/80' : ''
      }`}
      onClick={href ? () => navigate(href) : undefined}
    >
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-bold text-foreground">
            {numericValue !== null ? animatedValue : value}
            {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
          </span>
          {trend === 'up' && <ArrowUp size={14} className="text-[#22C55E]" />}
          {trend === 'down' && <ArrowDown size={14} className="text-[#EF4444]" />}
          {trend === 'stable' && <Minus size={14} className="text-muted-foreground" />}
        </div>
        {sparkline && <Sparkline data={sparkline} color={color} />}
      </div>
    </div>
  );

  return content;
}
