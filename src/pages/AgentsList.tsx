import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { StatusDot } from '@/components/shared/StatusDot';
import { ExportButton } from '@/components/shared/ExportButton';
import { AgentStatus } from '@/types';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { LayoutGrid, List, Play, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const statusLabels: Record<AgentStatus, string> = {
  operativo: 'Operativo', listo: 'Listo', disenado: 'Diseñado',
  futuro: 'Futuro', error: 'Error', procesando: 'Procesando',
};

const areaLabels: Record<string, string> = {
  all: 'Todas', academica: 'Académica', administrativa: 'Administrativa',
  acreditacion: 'Acreditación', comunicaciones: 'Comunicaciones',
};

function timeAgo(iso?: string) {
  if (!iso) return '—';
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return '<1h';
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function healthScore(agent: any): 'good' | 'warn' | 'bad' {
  if (agent.status === 'error') return 'bad';
  if (agent.error_rate > 10) return 'bad';
  if (!agent.last_run) return 'warn';
  const hoursAgo = (Date.now() - new Date(agent.last_run).getTime()) / 3600000;
  if (hoursAgo > 48) return 'warn';
  if (agent.error_rate > 3) return 'warn';
  return 'good';
}

const healthColors = { good: 'bg-green-500', warn: 'bg-yellow-500', bad: 'bg-red-500' };

export default function AgentsList() {
  const navigate = useNavigate();
  const { agents } = useSupabaseAgents();
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [forcing, setForcing] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return agents.filter((a: any) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (areaFilter !== 'all' && a.area !== areaFilter) return false;
      return true;
    });
  }, [agents, statusFilter, areaFilter]);

  const areas = useMemo(() => {
    const set = new Set(agents.map((a: any) => a.area));
    return ['all', ...Array.from(set)];
  }, [agents]);

  const forceExecution = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setForcing(agentId);
    try {
      const { error } = await supabase.functions.invoke('orchestrator-api', {
        body: { action: 'add_execution', agent_id: agentId, status: 'running', items_processed: 0 },
      });
      if (error) throw error;
      toast.success('Ejecución registrada');
    } catch {
      toast.error('Error al forzar ejecución');
    }
    setForcing(null);
  };

  const healthCounts = useMemo(() => {
    const c = { good: 0, warn: 0, bad: 0 };
    agents.forEach((a: any) => { c[healthScore(a)]++; });
    return c;
  }, [agents]);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Agentes' }]} />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold text-foreground">Agentes</h1>
        <div className="flex items-center gap-2">
          {/* Health summary */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] text-muted-foreground">{healthCounts.good}</span>
            <span className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-[10px] text-muted-foreground">{healthCounts.warn}</span>
            <span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] text-muted-foreground">{healthCounts.bad}</span>
          </div>
          <ExportButton data={filtered} filename="agentes" />
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-1.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            {viewMode === 'grid' ? <List size={14} /> : <LayoutGrid size={14} />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <div className="flex gap-1 flex-wrap">
            {['all', ...Object.keys(statusLabels)].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s as AgentStatus | 'all')}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {s === 'all' ? 'Todos' : statusLabels[s as AgentStatus]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Área:</span>
          <div className="flex gap-1 flex-wrap">
            {areas.map((a) => (
              <button key={a} onClick={() => setAreaFilter(a)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${areaFilter === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {areaLabels[a] || a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((agent: any) => {
            const health = healthScore(agent);
            return (
              <div key={agent.id} onClick={() => navigate(`/agent/${agent.id}`)}
                className="rounded-md border border-border bg-card p-4 cursor-pointer transition-all duration-200 hover:border-primary hover:scale-[1.01]"
                style={{ borderLeftWidth: 4, borderLeftColor: agent.color }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${healthColors[health]}`} />
                    <span className="font-mono text-sm font-bold" style={{ color: agent.color }}>{agent.code}</span>
                    <StatusDot status={agent.status} size={6} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{agent.platform}</span>
                    {agent.status === 'operativo' && (
                      <button onClick={(e) => forceExecution(agent.id, e)} disabled={forcing === agent.id}
                        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-primary disabled:opacity-40" title="Forzar ejecución">
                        <Play size={10} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-foreground truncate">{agent.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span>hace {timeAgo(agent.last_run)}</span>
                  <span className="font-mono">{agent.items_processed_24h} items/24h</span>
                  {agent.error_rate > 0 && (
                    <span className="flex items-center gap-0.5 text-destructive">
                      <AlertCircle size={9} />{agent.error_rate}%
                    </span>
                  )}
                </div>
                {(agent.criteria_cna || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(agent.criteria_cna || []).slice(0, 4).map((c: string) => (
                      <span key={c} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{c}</span>
                    ))}
                    {(agent.criteria_cna || []).length > 4 && (
                      <span className="text-[9px] text-muted-foreground">+{agent.criteria_cna.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-3">Salud</th>
                <th className="text-left py-2 px-3">Código</th>
                <th className="text-left py-2 px-3">Nombre</th>
                <th className="text-left py-2 px-3">Estado</th>
                <th className="text-left py-2 px-3">Plataforma</th>
                <th className="text-left py-2 px-3">Último Run</th>
                <th className="text-left py-2 px-3">Items/24h</th>
                <th className="text-left py-2 px-3">Error %</th>
                <th className="text-left py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent: any) => {
                const health = healthScore(agent);
                return (
                  <tr key={agent.id} onClick={() => navigate(`/agent/${agent.id}`)} className="border-b border-border cursor-pointer hover:bg-accent/30">
                    <td className="py-2 px-3"><span className={`w-2 h-2 rounded-full inline-block ${healthColors[health]}`} /></td>
                    <td className="py-2 px-3 font-mono font-bold" style={{ color: agent.color }}>{agent.code}</td>
                    <td className="py-2 px-3 text-foreground">{agent.name}</td>
                    <td className="py-2 px-3"><StatusDot status={agent.status} size={6} /> <span className="ml-1">{statusLabels[agent.status as AgentStatus] || agent.status}</span></td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">{agent.platform}</td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">{timeAgo(agent.last_run)}</td>
                    <td className="py-2 px-3 font-mono">{agent.items_processed_24h}</td>
                    <td className="py-2 px-3 font-mono">{agent.error_rate}%</td>
                    <td className="py-2 px-3">
                      {agent.status === 'operativo' && (
                        <button onClick={(e) => forceExecution(agent.id, e)} disabled={forcing === agent.id}
                          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-primary disabled:opacity-40">
                          <Play size={10} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
