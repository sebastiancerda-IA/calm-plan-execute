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
      className={`group glass-card glass-card-hover shine-effect rounded-lg p-3 sm:p-4 flex flex-col gap-1.5 ${
        href ? 'cursor-pointer' : ''
      }`}
      onClick={href ? () => navigate(href) : undefined}
    >
      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-mono font-bold text-foreground">
              {numericValue !== null ? animatedValue : value}
            </span>
            {trend === 'up' && <ArrowUp size={14} className="text-[hsl(var(--idma-green))]" />}
            {trend === 'down' && <ArrowDown size={14} className="text-destructive" />}
            {trend === 'stable' && <Minus size={14} className="text-muted-foreground" />}
          </div>
          {suffix && <span className="text-[10px] sm:text-xs text-muted-foreground">{suffix}</span>}
        </div>
        {sparkline && <Sparkline data={sparkline} color={color} />}
      </div>
    </motion.div>
  );
}

export const MetricTile = memo(MetricTileInner);
