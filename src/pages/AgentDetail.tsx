import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { agentsService, executionsService, emailLogsService } from '@/services/supabaseService';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { StatusDot } from '@/components/shared/StatusDot';
import { MetricTile } from '@/components/shared/MetricTile';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { AgentBadge } from '@/components/shared/AgentBadge';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function timeAgo(iso?: string) {
  if (!iso) return '—';
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { agents } = useSupabaseAgents();

  const { data: agent } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const { data, error } = await agentsService.getById(id || '');
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['executions', id],
    queryFn: async () => {
      const { data, error } = await executionsService.getByAgent(id || '', 10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: emails = [] } = useQuery({
    queryKey: ['email_logs', id],
    queryFn: async () => {
      const { data, error } = await emailLogsService.getRecent(id, 20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  if (!agent) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Agente no encontrado</p>
        <Link to="/agents" className="text-primary text-sm mt-2 inline-block">Volver a agentes</Link>
      </div>
    );
  }

  const deps = agents.filter((a: any) => (agent.dependencies || []).includes(a.id));
  const dependents = agents.filter((a: any) => (a.dependencies || []).includes(agent.id));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Agentes', to: '/agents' }, { label: `${agent.code} ${agent.name}` }]} />

      <div className="flex items-center gap-4">
        <Link to="/agents" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-1 h-12 rounded" style={{ backgroundColor: agent.color }} />
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold" style={{ color: agent.color }}>{agent.code}</span>
            <h1 className="text-xl font-semibold text-foreground">{agent.name}</h1>
            <StatusDot status={agent.status as any} />
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono">{agent.platform}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-md border border-border bg-card p-3">
          <span className="text-[10px] text-muted-foreground uppercase">Trigger</span>
          <p className="text-sm text-foreground font-mono mt-1">{agent.trigger_type || '—'}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <span className="text-[10px] text-muted-foreground uppercase">Última ejecución</span>
          <p className="text-sm text-foreground font-mono mt-1">{timeAgo(agent.last_run)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <span className="text-[10px] text-muted-foreground uppercase">Error Rate</span>
          <p className="text-sm text-foreground font-mono mt-1">{(Number(agent.error_rate || 0) * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <span className="text-[10px] text-muted-foreground uppercase">Items 24h</span>
          <p className="text-sm text-foreground font-mono mt-1">{agent.items_processed_24h}</p>
        </div>
      </div>

      {/* Executions */}
      {executions.length > 0 && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
            Últimas Ejecuciones
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Duración</th>
                  <th className="text-left py-2 px-2">Items</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((exec: any) => (
                  <tr key={exec.id} className="border-b border-border">
                    <td className="py-2 px-2 text-muted-foreground font-mono whitespace-nowrap">
                      {new Date(exec.started_at || exec.created_at).toLocaleString('es-CL')}
                    </td>
                    <td className="py-2 px-2">
                      {exec.status === 'error' ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-[#EF4444] font-mono">error</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-secondary border-border max-w-xs">
                            <p className="text-xs text-foreground">{exec.error_message || 'Error desconocido'}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-[#22C55E] font-mono">{exec.status}</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-muted-foreground font-mono">
                      {exec.duration_ms ? `${(exec.duration_ms / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="py-2 px-2 text-foreground font-mono">{exec.items_processed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Emails */}
      {emails.length > 0 && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
            Emails Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Asunto</th>
                  <th className="text-left py-2 px-2">De</th>
                  <th className="text-left py-2 px-2">Categoría</th>
                  <th className="text-left py-2 px-2">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email: any) => (
                  <tr
                    key={email.id}
                    className={`border-b border-border ${email.accion_requerida ? 'bg-[#422006]/20' : ''}`}
                  >
                    <td className="py-2 px-2 text-muted-foreground font-mono whitespace-nowrap">
                      {new Date(email.fecha).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-2 px-2 text-foreground max-w-xs truncate">{email.asunto}</td>
                    <td className="py-2 px-2 text-muted-foreground truncate">{email.de}</td>
                    <td className="py-2 px-2">
                      <span className="font-mono text-[10px] text-[#06B6D4]">{email.categoria}</span>
                    </td>
                    <td className="py-2 px-2"><PriorityBadge priority={email.prioridad} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CNA Criteria */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Criterios CNA Asociados
        </h3>
        <div className="flex flex-wrap gap-2">
          {(agent.criteria_cna || []).map((c: string) => (
            <Link
              key={c}
              to={`/cna?expand=${c}`}
              className="text-xs font-mono px-2 py-1 rounded bg-secondary text-foreground hover:bg-accent transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* Dependencies */}
      {(deps.length > 0 || dependents.length > 0) && (
        <div className="rounded-md border border-border bg-card p-4">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
            Dependencias
          </h3>
          {deps.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] text-muted-foreground uppercase">Depende de:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {deps.map((d: any) => (
                  <AgentBadge key={d.id} code={d.code} color={d.color} agentId={d.id} />
                ))}
              </div>
            </div>
          )}
          {dependents.length > 0 && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Dependen de este:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {dependents.map((d: any) => (
                  <AgentBadge key={d.id} code={d.code} color={d.color} agentId={d.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
