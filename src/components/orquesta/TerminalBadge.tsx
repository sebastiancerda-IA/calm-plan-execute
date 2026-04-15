import type { ReactNode } from 'react';

const variants: Record<string, string> = {
  live: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  static: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  sync: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  warn: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  neutral: 'border-border bg-secondary/40 text-muted-foreground',
};

type TerminalBadgeProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

export function TerminalBadge({ children, variant = 'neutral', className = '' }: TerminalBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${variants[variant] ?? variants.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
