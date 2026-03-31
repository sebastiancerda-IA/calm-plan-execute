import { useAlerts } from '@/hooks/useAlerts';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { AgentBadge } from '@/components/shared/AgentBadge';
import { mockAgents } from '@/data/mockAgents';
import { Priority } from '@/types';
import { Check } from 'lucide-react';

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const priorityBorderColors: Record<Priority, string> = {
  critica: '#EF4444',
  alta: '#F97316',
  media: '#06B6D4',
  info: '#6B7280',
};

export default function Alerts() {
  const { alerts, counts, filter, setFilter } = useAlerts();

  const getAgent = (code: string) => mockAgents.find((a) => a.code === code);

  const filterButtons: { key: Priority | 'all'; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'Todas', count: counts.total, color: '#F1F5F9' },
    { key: 'critica', label: 'Críticas', count: counts.critica, color: '#EF4444' },
    { key: 'alta', label: 'Altas', count: counts.alta, color: '#F97316' },
    { key: 'media', label: 'Medias', count: counts.media, color: '#06B6D4' },
    { key: 'info', label: 'Info', count: counts.info, color: '#6B7280' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[#F1F5F9]">Alertas</h1>

      {/* Counters */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => {
          const isActive = (!filter.priority && btn.key === 'all') || filter.priority === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setFilter({ ...filter, priority: btn.key === 'all' ? undefined : (btn.key as Priority) })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive ? 'bg-[#1E293B]' : 'bg-[#111827] hover:bg-[#1E293B]'
              }`}
              style={{ color: btn.color }}
            >
              {btn.label}
              <span className={`font-mono ${btn.key === 'critica' && btn.count > 0 ? 'animate-pulse' : ''}`}>
                {btn.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const agent = getAgent(alert.source);
          return (
            <div
              key={alert.id}
              className={`rounded-md border border-[#1E293B] bg-[#111827] p-4 ${
                alert.resolved ? 'opacity-50' : ''
              }`}
              style={{ borderLeftWidth: 4, borderLeftColor: priorityBorderColors[alert.priority] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <PriorityBadge priority={alert.priority} />
                    {agent && <AgentBadge code={agent.code} color={agent.color} agentId={agent.id} />}
                    <span className="text-[10px] text-[#6B7280] font-mono">{timeAgo(alert.timestamp)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">{alert.title}</h3>
                  <p className="text-xs text-[#9CA3AF]">{alert.description}</p>
                  {alert.actionRequired && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium bg-[#422006] text-[#FDE68A] px-2 py-1 rounded">
                      Acción: {alert.actionRequired}
                    </div>
                  )}
                </div>
                {!alert.resolved && (
                  <button className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#22C55E] transition-colors border border-[#1E293B] rounded px-2 py-1">
                    <Check size={12} />
                    Resolver
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
