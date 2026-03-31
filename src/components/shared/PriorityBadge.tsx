import { Priority } from '@/types';

const priorityConfig: Record<Priority, { bg: string; text: string; label: string }> = {
  critica: { bg: '#7F1D1D', text: '#EF4444', label: 'Crítica' },
  alta: { bg: '#7C2D12', text: '#F97316', label: 'Alta' },
  media: { bg: '#164E63', text: '#06B6D4', label: 'Media' },
  info: { bg: '#1F2937', text: '#6B7280', label: 'Info' },
};

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
