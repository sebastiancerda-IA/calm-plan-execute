import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { StatusDot } from '@/components/shared/StatusDot';
import { Crown } from 'lucide-react';

function timeAgo(iso?: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return '<1h';
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const LAYER_LABELS = ['DIRECTOR', 'OPERATIVOS', 'TRANSVERSALES', 'INFRAESTRUCTURA'] as const;
const LAYER_COLORS = [
  'hsl(var(--idma-green))',
  'hsl(var(--idma-blue))',
  'hsl(var(--idma-teal))',
  'hsl(var(--muted-foreground))',
];

interface AgentNodeProps {
  agent: any;
  allAgents: any[];
  hovered: string | null;
  onHover: (id: string | null) => void;
  nodeRef: (el: HTMLDivElement | null) => void;
  isDios?: boolean;
  index: number;
}

function AgentNode({ agent, allAgents, hovered, onHover, nodeRef, isDios, index }: AgentNodeProps) {
  const navigate = useNavigate();
  const deps = agent.dependencies || [];
  const isHighlighted =
    !hovered ||
    hovered === agent.id ||
    deps.includes(hovered) ||
    allAgents.find((a: any) => a.id === hovered)?.dependencies?.includes(agent.id);

  return (
    <motion.div
      ref={nodeRef}
      data-agent-id={agent.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`rounded-lg border bg-card cursor-pointer transition-all duration-200 hover:scale-[1.03] ${
        isDios ? 'p-4 border-2' : 'p-3 border'
      }`}
      style={{
        borderColor: isDios ? agent.color : hovered === agent.id ? agent.color : 'hsl(var(--border))',
        opacity: hovered && !isHighlighted ? 0.25 : 1,
        boxShadow: hovered === agent.id
          ? `0 0 20px ${agent.color}25, 0 0 40px ${agent.color}10`
          : isDios
          ? `0 0 12px ${agent.color}15`
          : 'none',
      }}
      onMouseEnter={() => onHover(agent.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {isDios && <Crown size={12} className="text-amber-400" />}
          <span className="font-mono text-xs font-bold" style={{ color: agent.color }}>
            {agent.code}
          </span>
        </div>
        <StatusDot status={agent.status} size={isDios ? 8 : 6} />
      </div>
      <div className={`text-foreground font-medium truncate mb-1 ${isDios ? 'text-sm' : 'text-xs'}`}>
        {agent.name}
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{timeAgo(agent.last_run)}</span>
        <span className="font-mono">{agent.items_processed_24h ?? 0}</span>
      </div>
    </motion.div>
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

  const layers = useMemo(() => [dios, operatives, transversals, infra], [dios, operatives, transversals, infra]);

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
    const timer = setTimeout(calcLines, 150);
    const ro = new ResizeObserver(calcLines);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', calcLines);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', calcLines);
    };
  }, [calcLines]);

  const setNodeRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) nodeRefs.current.set(id, el);
      else nodeRefs.current.delete(id);
    },
    []
  );

  if (agents.length === 0) return null;

  let globalIndex = 0;

  return (
    <div ref={containerRef} className="rounded-lg border border-border bg-card/50 p-4 md:p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-idma-green/5 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-idma-green" />
        Mapa de Agentes
      </h3>

      {/* SVG Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--idma-green))" opacity="0.5" />
          </marker>
          <marker id="arrowhead-active" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--idma-blue))" opacity="0.9" />
          </marker>
        </defs>
        {lines.map((line, i) => {
          const isActive = hovered && (hovered === line.fromId || hovered === line.toId);
          const midY = (line.y1 + line.y2) / 2;
          return (
            <path
              key={i}
              d={`M ${line.x1} ${line.y1} C ${line.x1} ${midY} ${line.x2} ${midY} ${line.x2} ${line.y2}`}
              fill="none"
              stroke={isActive ? 'hsl(var(--idma-blue))' : 'hsl(var(--border))'}
              strokeWidth={isActive ? 2 : 1}
              opacity={hovered && !isActive ? 0.1 : isActive ? 0.8 : 0.3}
              markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              className="transition-all duration-300"
              strokeDasharray={isActive ? 'none' : '4 4'}
            />
          );
        })}
      </svg>

      {/* Layered Grid */}
      <div className="space-y-5 relative z-10">
        {layers.map((layerAgents, layerIdx) => {
          if (layerAgents.length === 0) return null;
          const isDiosLayer = layerIdx === 0;
          return (
            <div key={layerIdx}>
              {/* Layer label */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[9px] font-mono font-bold tracking-widest uppercase"
                  style={{ color: LAYER_COLORS[layerIdx] }}
                >
                  {LAYER_LABELS[layerIdx]}
                </span>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${LAYER_COLORS[layerIdx]}30, transparent)` }} />
              </div>

              {isDiosLayer ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-xs">
                    {layerAgents.map((a: any) => {
                      const idx = globalIndex++;
                      return (
                        <AgentNode
                          key={a.id}
                          agent={a}
                          allAgents={agents}
                          hovered={hovered}
                          onHover={setHovered}
                          nodeRef={setNodeRef(a.id)}
                          isDios
                          index={idx}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className={`grid gap-2 ${
                  layerAgents.length <= 2
                    ? 'grid-cols-2 max-w-sm mx-auto'
                    : layerAgents.length <= 3
                    ? 'grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}>
                  {layerAgents.map((a: any) => {
                    const idx = globalIndex++;
                    return (
                      <AgentNode
                        key={a.id}
                        agent={a}
                        allAgents={agents}
                        hovered={hovered}
                        onHover={setHovered}
                        nodeRef={setNodeRef(a.id)}
                        index={idx}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
