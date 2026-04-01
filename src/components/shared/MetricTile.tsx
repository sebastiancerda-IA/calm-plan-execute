import { memo } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
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
  index?: number;
}

function MetricTileInner({ label, value, trend, sparkline, color = 'hsl(var(--idma-blue))', suffix, href, index = 0 }: MetricTileProps) {
  const navigate = useNavigate();
  const numericValue = typeof value === 'number' ? value : null;
  const animatedValue = useCountUp(numericValue ?? 0, 600);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`group rounded-lg border border-border bg-card p-4 flex flex-col gap-2 transition-all duration-200 ${
        href ? 'cursor-pointer hover:border-idma-green/50' : ''
      } hover:shadow-lg hover:shadow-idma-green/5`}
      onClick={href ? () => navigate(href) : undefined}
    >
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-bold text-foreground">
            {numericValue !== null ? animatedValue : value}
            {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
          </span>
          {trend === 'up' && <ArrowUp size={14} className="text-idma-green" />}
          {trend === 'down' && <ArrowDown size={14} className="text-destructive" />}
          {trend === 'stable' && <Minus size={14} className="text-muted-foreground" />}
        </div>
        {sparkline && <Sparkline data={sparkline} color={color} />}
      </div>
    </motion.div>
  );
}

export const MetricTile = memo(MetricTileInner);
