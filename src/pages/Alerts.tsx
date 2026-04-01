import { useSupabaseAlerts } from '@/hooks/useSupabaseAlerts';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { AgentBadge } from '@/components/shared/AgentBadge';
import { Check } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const priorityBorderColors: Record<string, string> = {
  critica: '#EF4444',
  alta: '#F97316',
  media: '#06B6D4',
  info: '#6B7280',
};

export default function Alerts() {
  const { alerts, counts, filter, setFilter, resolveAlert } = useSupabaseAlerts();
  const { agents } = useSupabaseAgents();

  const getAgent = (agentId: string) => agents.find((a: any) => a.id === agentId);

  const filterButtons = [
    { key: 'all', label: 'Todas', count: counts.total, color: 'hsl(var(--foreground))' },
    { key: 'critica', label: 'Críticas', count: counts.critica, color: '#EF4444' },
    { key: 'alta', label: 'Altas', count: counts.alta, color: '#F97316' },
    { key: 'media', label: 'Medias', count: counts.media, color: '#06B6D4' },
    { key: 'info', label: 'Info', count: counts.info, color: '#6B7280' },
  ];

  const showResolved = filter.resolved;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Alertas' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Alertas</h1>
        <button
          onClick={() => setFilter({ ...filter, resolved: showResolved ? undefined : true })}
          className={`text-xs px-3 py-1.5 rounded transition-colors ${
            showResolved ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          {showResolved ? 'Ver pendientes' : 'Ver resueltas'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => {
          const isActive = (!filter.priority && btn.key === 'all') || filter.priority === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setFilter({ ...filter, priority: btn.key === 'all' ? undefined : btn.key })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive ? 'bg-secondary' : 'bg-card hover:bg-secondary'
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

      <div className="space-y-3">
        {alerts.map((alert: any) => {
          const agent = getAgent(alert.agent_id);
          return (
            <div
              key={alert.id}
              className={`rounded-md border border-border bg-card p-4 ${alert.resolved ? 'opacity-50' : ''}`}
              style={{ borderLeftWidth: 4, borderLeftColor: priorityBorderColors[alert.priority] || '#6B7280' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <PriorityBadge priority={alert.priority} />
                    {agent && <AgentBadge code={agent.code} color={agent.color} agentId={agent.id} />}
                    <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(alert.created_at)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{alert.title}</h3>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                  {alert.action_required && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium bg-[#422006] text-[#FDE68A] px-2 py-1 rounded">
                      Acción: {alert.action_required}
                    </div>
                  )}
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#22C55E] transition-colors border border-border rounded px-2 py-1"
                  >
                    <Check size={12} />
                    Resolver
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay alertas con este filtro.</p>
        )}
      </div>
    </div>
  );
}
