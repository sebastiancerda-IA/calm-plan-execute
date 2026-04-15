import type { ReactNode } from 'react';

type PanelHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  right?: ReactNode;
  className?: string;
};

export function PanelHeader({ kicker, title, description, right, className = '' }: PanelHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-start md:justify-between ${className}`}>
      <div>
        {kicker ? <p className="orquesta-section-kicker">{kicker}</p> : null}
        <h1 className="orquesta-command-title mt-1">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
