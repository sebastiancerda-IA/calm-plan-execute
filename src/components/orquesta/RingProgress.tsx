type RingProgressProps = {
  /** 0–100 */
  pct: number;
  size?: number;
  stroke?: number;
  className?: string;
};

/** Anillo de progreso SVG (sin dependencia extra de gráficos). */
export function RingProgress({ pct, size = 120, stroke = 10, className = '' }: RingProgressProps) {
  const clamped = Math.min(100, Math.max(0, pct));
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`pointer-events-none shrink-0 -rotate-90 ${className}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(142 71% 45%)"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}
