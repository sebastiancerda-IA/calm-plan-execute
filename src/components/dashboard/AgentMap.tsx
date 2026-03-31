import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAgents } from '@/data/mockAgents';
import { StatusDot } from '@/components/shared/StatusDot';

function timeAgo(iso?: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

interface AgentNodeProps {
  agent: (typeof mockAgents)[0];
  hovered: string | null;
  onHover: (id: string | null) => void;
}

function AgentNode({ agent, hovered, onHover }: AgentNodeProps) {
  const navigate = useNavigate();
  const isHighlighted =
    !hovered ||
    hovered === agent.id ||
    agent.dependencies.includes(hovered) ||
    mockAgents.find((a) => a.id === hovered)?.dependencies.includes(agent.id);

  return (
    <div
      className="rounded-md border border-[#1E293B] bg-[#111827] p-3 cursor-pointer transition-all duration-200 hover:border-[#3B82F6]"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: agent.color,
        opacity: hovered && !isHighlighted ? 0.3 : 1,
      }}
      onMouseEnter={() => onHover(agent.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs font-bold" style={{ color: agent.color }}>
          {agent.code}
        </span>
        <StatusDot status={agent.status} size={6} />
      </div>
      <div className="text-xs text-[#F1F5F9] font-medium truncate mb-1">{agent.name}</div>
      <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
        <span>{timeAgo(agent.lastRun)}</span>
        <span className="font-mono">{agent.itemsProcessed24h} items</span>
      </div>
    </div>
  );
}

export function AgentMap() {
  const [hovered, setHovered] = useState<string | null>(null);

  const { dios, operatives, transversals, infra } = useMemo(() => {
    const dios = mockAgents.filter((a) => a.code === 'DIOS');
    const infra = mockAgents.filter((a) => ['A3', 'A3q'].includes(a.code));
    const transversals = mockAgents.filter((a) => ['A2', 'A1+', 'D3'].includes(a.code));
    const operatives = mockAgents.filter(
      (a) => !dios.includes(a) && !infra.includes(a) && !transversals.includes(a)
    );
    return { dios, operatives, transversals, infra };
  }, []);

  return (
    <div className="rounded-md border border-[#1E293B] bg-[#0D1321] p-4">
      <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-4">
        Mapa de Agentes
      </h3>

      <div className="space-y-4">
        {/* Nivel 0: Agente Dios */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            {dios.map((a) => (
              <AgentNode key={a.id} agent={a} hovered={hovered} onHover={setHovered} />
            ))}
          </div>
        </div>

        {/* Connector line */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-[#1E293B]" />
        </div>

        {/* Nivel 1: Operativos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {operatives.map((a) => (
            <AgentNode key={a.id} agent={a} hovered={hovered} onHover={setHovered} />
          ))}
        </div>

        {/* Connector line */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-[#1E293B]" />
        </div>

        {/* Nivel 2: Transversales + Infra */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {transversals.map((a) => (
            <AgentNode key={a.id} agent={a} hovered={hovered} onHover={setHovered} />
          ))}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {infra.map((a) => (
              <AgentNode key={a.id} agent={a} hovered={hovered} onHover={setHovered} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
