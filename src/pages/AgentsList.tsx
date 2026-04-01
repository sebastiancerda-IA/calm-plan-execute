import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAgents } from '@/data/mockAgents';
import { StatusDot } from '@/components/shared/StatusDot';
import { AgentStatus } from '@/types';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

const statusLabels: Record<AgentStatus, string> = {
  operativo: 'Operativo',
  listo: 'Listo',
  disenado: 'Diseñado',
  futuro: 'Futuro',
  error: 'Error',
  procesando: 'Procesando',
};

const areas = ['vcm', 'otec', 'rectoria', 'finanzas', 'acreditacion', 'rag', 'sistema'] as const;
const platforms = ['n8n', 'claude_project', 'claude_code', 'hybrid'] as const;

function timeAgo(iso?: string) {
  if (!iso) return '—';
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export default function AgentsList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return mockAgents.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (areaFilter !== 'all' && a.area !== areaFilter) return false;
      if (platformFilter !== 'all' && a.platform !== platformFilter) return false;
      return true;
    });
  }, [statusFilter, areaFilter, platformFilter]);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Agentes' }]} />
      <h1 className="text-xl font-semibold text-foreground">Agentes</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <div className="flex gap-1">
            {['all', ...Object.keys(statusLabels)].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as AgentStatus | 'all')}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'all' ? 'Todos' : statusLabels[s as AgentStatus]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((agent) => (
          <div
            key={agent.id}
            onClick={() => navigate(`/agent/${agent.id}`)}
            className="rounded-md border border-border bg-card p-4 cursor-pointer transition-all duration-200 hover:border-primary hover:scale-[1.01]"
            style={{ borderLeftWidth: 4, borderLeftColor: agent.color }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold" style={{ color: agent.color }}>{agent.code}</span>
                <StatusDot status={agent.status} size={6} />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{agent.platform}</span>
            </div>
            <h3 className="text-sm font-medium text-foreground truncate">{agent.name}</h3>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
            <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
              <span>{timeAgo(agent.lastRun)}</span>
              <span className="font-mono">{agent.itemsProcessed24h} items/24h</span>
            </div>
            {agent.criteriaCNA.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {agent.criteriaCNA.slice(0, 4).map((c) => (
                  <span key={c} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{c}</span>
                ))}
                {agent.criteriaCNA.length > 4 && (
                  <span className="text-[9px] text-muted-foreground">+{agent.criteriaCNA.length - 4}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
