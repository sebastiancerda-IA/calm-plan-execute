import type { ReactNode } from 'react';

type KpiTileProps = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
};

export function KpiTile({ label, value, sub, icon, className = '', valueClassName = '' }: KpiTileProps) {
  return (
    <article className={`orquesta-panel-dense flex flex-col ${className}`}>
      <p className="orquesta-section-kicker">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className={`orquesta-kpi-value ${valueClassName}`}>{value}</div>
        {icon ? <div className="shrink-0 text-muted-foreground">{icon}</div> : null}
      </div>
      {sub ? <div className="mt-2 text-[11px] leading-snug text-muted-foreground">{sub}</div> : null}
    </article>
  );
}
