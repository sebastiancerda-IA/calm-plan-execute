import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
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
  agent: any;
  allAgents: any[];
  hovered: string | null;
  onHover: (id: string | null) => void;
  nodeRef: (el: HTMLDivElement | null) => void;
}

function AgentNode({ agent, allAgents, hovered, onHover, nodeRef }: AgentNodeProps) {
  const navigate = useNavigate();
  const deps = agent.dependencies || [];
  const isHighlighted =
    !hovered ||
    hovered === agent.id ||
    deps.includes(hovered) ||
    allAgents.find((a: any) => a.id === hovered)?.dependencies?.includes(agent.id);

  return (
    <div
      ref={nodeRef}
      data-agent-id={agent.id}
      className="rounded-md border border-border bg-card p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: agent.color,
        opacity: hovered && !isHighlighted ? 0.3 : 1,
        boxShadow: hovered === agent.id ? `0 0 16px ${agent.color}30` : 'none',
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
      <div className="text-xs text-foreground font-medium truncate mb-1">{agent.name}</div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{timeAgo(agent.last_run)}</span>
        <span className="font-mono">{agent.items_processed_24h} items</span>
      </div>
    </div>
  );
}

export function AgentMap() {
  const { agents } = useSupabaseAgents();
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; fromId: string; toId: string }[]>([]);

  const { dios, operatives, transversals, infra } = useMemo(() => {
    const dios = agents.filter((a: any) => a.code === 'AD');
    const infra = agents.filter((a: any) => ['A3', 'A3Q'].includes(a.code));
    const transversals = agents.filter((a: any) => ['A2', 'A1+', 'D3'].includes(a.code));
    const operatives = agents.filter(
      (a: any) => !dios.includes(a) && !infra.includes(a) && !transversals.includes(a)
    );
    return { dios, operatives, transversals, infra };
  }, [agents]);

  const calcLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const newLines: typeof lines = [];

    agents.forEach((agent: any) => {
      (agent.dependencies || []).forEach((depId: string) => {
        const fromEl = nodeRefs.current.get(agent.id);
        const toEl = nodeRefs.current.get(depId);
        if (!fromEl || !toEl) return;
        const fRect = fromEl.getBoundingClientRect();
        const tRect = toEl.getBoundingClientRect();
        newLines.push({
          x1: fRect.left + fRect.width / 2 - cRect.left,
          y1: fRect.top - cRect.top,
          x2: tRect.left + tRect.width / 2 - cRect.left,
          y2: tRect.top + tRect.height - cRect.top,
          fromId: agent.id,
          toId: depId,
        });
      });
    });
    setLines(newLines);
  }, [agents]);

  useEffect(() => {
    const timer = setTimeout(calcLines, 100);
    const ro = new ResizeObserver(calcLines);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', calcLines);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', calcLines);
    };
  }, [calcLines]);

  const setNodeRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  if (agents.length === 0) return null;

  return (
    <div ref={containerRef} className="rounded-md border border-border bg-[#0D1321] p-4 relative">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
        Mapa de Agentes
      </h3>

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
        {lines.map((line, i) => {
          const isActive = hovered && (hovered === line.fromId || hovered === line.toId);
          const midY = (line.y1 + line.y2) / 2;
          return (
            <path
              key={i}
              d={`M ${line.x1} ${line.y1} Q ${line.x1} ${midY} ${(line.x1 + line.x2) / 2} ${midY} Q ${line.x2} ${midY} ${line.x2} ${line.y2}`}
              fill="none"
              stroke={isActive ? '#3B82F6' : 'hsl(215 19% 17%)'}
              strokeWidth={isActive ? 2 : 1}
              opacity={hovered && !isActive ? 0.15 : isActive ? 0.8 : 0.4}
              className="transition-all duration-200"
            />
          );
        })}
      </svg>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            {dios.map((a: any) => (
              <AgentNode key={a.id} agent={a} allAgents={agents} hovered={hovered} onHover={setHovered} nodeRef={setNodeRef(a.id)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {operatives.map((a: any) => (
            <AgentNode key={a.id} agent={a} allAgents={agents} hovered={hovered} onHover={setHovered} nodeRef={setNodeRef(a.id)} />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {transversals.map((a: any) => (
            <AgentNode key={a.id} agent={a} allAgents={agents} hovered={hovered} onHover={setHovered} nodeRef={setNodeRef(a.id)} />
          ))}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {infra.map((a: any) => (
              <AgentNode key={a.id} agent={a} allAgents={agents} hovered={hovered} onHover={setHovered} nodeRef={setNodeRef(a.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
