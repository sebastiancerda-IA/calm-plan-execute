import { AgentStatus } from '@/types';

const statusColors: Record<AgentStatus, string> = {
  operativo: 'hsl(var(--idma-green))',
  listo: '#EAB308',
  disenado: '#6B7280',
  futuro: '#4B5563',
  error: 'hsl(var(--destructive))',
  procesando: 'hsl(var(--idma-blue))',
};

interface StatusDotProps {
  status: AgentStatus;
  size?: number;
}

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  const color = statusColors[status];
  const isPulsing = status === 'procesando' || status === 'operativo';

  return (
    <span className="relative inline-flex">
      {isPulsing && (
        <span
          className="absolute inline-flex h-full w-full rounded-full"
          style={{
            backgroundColor: color,
            animation: status === 'procesando'
              ? 'procesando-pulse 1.5s ease-in-out infinite'
              : 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            opacity: 0.35,
          }}
        />
      )}
      <span
        className="relative inline-flex rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: isPulsing ? `0 0 ${size}px ${color}` : 'none',
        }}
      />
    </span>
  );
}
