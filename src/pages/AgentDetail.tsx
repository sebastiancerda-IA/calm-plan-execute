import { useParams, Link } from 'react-router-dom';
import { mockAgents, getAgentById } from '@/data/mockAgents';
import { mockEmails } from '@/data/mockEmails';
import { StatusDot } from '@/components/shared/StatusDot';
import { MetricTile } from '@/components/shared/MetricTile';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { AgentBadge } from '@/components/shared/AgentBadge';
import { ArrowLeft } from 'lucide-react';

function timeAgo(iso?: string) {
  if (!iso) return '—';
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const agent = getAgentById(id || '');

  if (!agent) {
    return (
      <div className="text-center py-20 text-[#6B7280]">
        <p>Agente no encontrado</p>
        <Link to="/" className="text-[#3B82F6] text-sm mt-2 inline-block">Volver al dashboard</Link>
      </div>
    );
  }

  const emails = mockEmails.filter((e) => e.agente === agent.code);
  const deps = mockAgents.filter((a) => agent.dependencies.includes(a.id));
  const dependents = mockAgents.filter((a) => a.dependencies.includes(agent.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-[#6B7280] hover:text-[#F1F5F9]">
          <ArrowLeft size={20} />
        </Link>
        <div
          className="w-1 h-12 rounded"
          style={{ backgroundColor: agent.color }}
        />
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold" style={{ color: agent.color }}>
              {agent.code}
            </span>
            <h1 className="text-xl font-semibold text-[#F1F5F9]">{agent.name}</h1>
            <StatusDot status={agent.status} />
            <span className="text-xs text-[#6B7280] bg-[#1E293B] px-2 py-0.5 rounded font-mono">
              {agent.platform}
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">{agent.description}</p>
        </div>
      </div>

      {/* Metrics */}
      {agent.metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agent.metrics.map((m) => (
            <MetricTile
              key={m.label}
              label={m.label}
              value={m.value}
              trend={m.trend}
              sparkline={m.sparkline}
              color={agent.color}
            />
          ))}
        </div>
      )}

      {/* Info row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-3">
          <span className="text-[10px] text-[#6B7280] uppercase">Trigger</span>
          <p className="text-sm text-[#F1F5F9] font-mono mt-1">{agent.trigger}</p>
        </div>
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-3">
          <span className="text-[10px] text-[#6B7280] uppercase">Última ejecución</span>
          <p className="text-sm text-[#F1F5F9] font-mono mt-1">{timeAgo(agent.lastRun)}</p>
        </div>
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-3">
          <span className="text-[10px] text-[#6B7280] uppercase">Error Rate</span>
          <p className="text-sm text-[#F1F5F9] font-mono mt-1">{(agent.errorRate * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-3">
          <span className="text-[10px] text-[#6B7280] uppercase">Items 24h</span>
          <p className="text-sm text-[#F1F5F9] font-mono mt-1">{agent.itemsProcessed24h}</p>
        </div>
      </div>

      {/* Emails (only for A1 and C1) */}
      {emails.length > 0 && (
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
            Emails Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#6B7280]">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Asunto</th>
                  <th className="text-left py-2 px-2">De</th>
                  <th className="text-left py-2 px-2">Categoría</th>
                  <th className="text-left py-2 px-2">Prioridad</th>
                  <th className="text-left py-2 px-2">Deadline</th>
                  <th className="text-left py-2 px-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr
                    key={email.id}
                    className={`border-b border-[#1E293B] ${
                      email.accion_requerida ? 'bg-[#422006]/20' : ''
                    }`}
                  >
                    <td className="py-2 px-2 text-[#9CA3AF] font-mono whitespace-nowrap">
                      {new Date(email.fecha).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-2 px-2 text-[#F1F5F9] max-w-xs truncate">{email.asunto}</td>
                    <td className="py-2 px-2 text-[#9CA3AF] truncate">{email.de}</td>
                    <td className="py-2 px-2">
                      <span className="font-mono text-[10px] text-[#06B6D4]">{email.categoria}</span>
                    </td>
                    <td className="py-2 px-2">
                      <PriorityBadge priority={email.prioridad} />
                    </td>
                    <td className="py-2 px-2 text-[#9CA3AF] font-mono whitespace-nowrap">
                      {email.deadline || '—'}
                    </td>
                    <td className="py-2 px-2 text-[#9CA3AF] max-w-xs truncate">
                      {email.accion_requerida ? email.accion_resumen : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CNA Criteria */}
      <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
          Criterios CNA Asociados
        </h3>
        <div className="flex flex-wrap gap-2">
          {agent.criteriaCNA.map((c) => (
            <span
              key={c}
              className="text-xs font-mono px-2 py-1 rounded bg-[#1E293B] text-[#F1F5F9]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Dependencies */}
      {(deps.length > 0 || dependents.length > 0) && (
        <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-3">
            Dependencias
          </h3>
          {deps.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] text-[#6B7280] uppercase">Depende de:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {deps.map((d) => (
                  <AgentBadge key={d.id} code={d.code} color={d.color} agentId={d.id} />
                ))}
              </div>
            </div>
          )}
          {dependents.length > 0 && (
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase">Dependen de este:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {dependents.map((d) => (
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
