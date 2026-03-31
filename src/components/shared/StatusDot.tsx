import { AgentStatus } from '@/types';

const statusColors: Record<AgentStatus, string> = {
  operativo: '#22C55E',
  listo: '#EAB308',
  disenado: '#6B7280',
  futuro: '#4B5563',
  error: '#EF4444',
  procesando: '#3B82F6',
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
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}
