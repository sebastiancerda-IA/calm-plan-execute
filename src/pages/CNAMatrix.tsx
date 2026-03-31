import { useState } from 'react';
import { useCNAProgress } from '@/hooks/useCNAProgress';
import { AgentBadge } from '@/components/shared/AgentBadge';
import { mockAgents } from '@/data/mockAgents';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

const levelColors = {
  N1: { bg: '#991B1B', text: '#FCA5A5' },
  N2: { bg: '#854D0E', text: '#FDE68A' },
  N3: { bg: '#166534', text: '#86EFAC' },
};

const milestones = [
  { label: 'Hoy', date: 'Mar 2026', pct: 56 },
  { label: 'Evidencia completa', date: 'Sep 2026', pct: 0 },
  { label: 'Informe final', date: 'Dic 2026', pct: 0 },
  { label: 'Visita CNA', date: 'Mar 2027', pct: 0 },
];

export default function CNAMatrix() {
  const { dimensions, overall } = useCNAProgress();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  const getAgent = (code: string) => mockAgents.find((a) => a.code === code);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#F1F5F9]">CNA Matrix</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280]">Progreso global:</span>
          <span className="font-mono text-sm font-bold text-[#F1F5F9]">{overall}%</span>
        </div>
      </div>

      {/* Dimensions */}
      {dimensions.map((dim) => (
        <div key={dim.id} className="rounded-md border border-[#1E293B] bg-[#111827] overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-[#F1F5F9]">{dim.name}</h2>
              {(dim as any).obligatoria && (
                <span className="text-[10px] font-bold bg-[#7F1D1D] text-[#EF4444] px-2 py-0.5 rounded">
                  OBLIGATORIA
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#9CA3AF]">
                {dim.atTarget}/{dim.total} en meta
              </span>
              <div className="w-24 h-1.5 bg-[#1E293B] rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${dim.percentage}%`,
                    backgroundColor: dim.percentage === 100 ? '#22C55E' : '#EAB308',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#1E293B]">
            {dim.criteria.map((c) => {
              const isExpanded = expanded === c.id;
              const agent = getAgent(c.responsibleAgent);
              const hasBreach = c.currentLevel < c.targetLevel;

              return (
                <div key={c.id} className="border-b border-[#1E293B] last:border-0">
                  <button
                    onClick={() => toggleExpand(c.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-[#0D1321] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-[#6B7280]" />
                      ) : (
                        <ChevronRight size={14} className="text-[#6B7280]" />
                      )}
                      <span className="font-mono text-xs font-bold text-[#F1F5F9]">{c.id}</span>
                      <span className="text-sm text-[#F1F5F9]">{c.name}</span>
                      {hasBreach && (
                        <AlertTriangle size={12} className="text-[#EF4444]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: levelColors[c.currentLevel].bg,
                          color: levelColors[c.currentLevel].text,
                        }}
                      >
                        {c.currentLevel}
                      </span>
                      <span className="text-[10px] text-[#6B7280]">→</span>
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: levelColors[c.targetLevel].bg,
                          color: levelColors[c.targetLevel].text,
                        }}
                      >
                        {c.targetLevel}
                      </span>
                      {agent && (
                        <AgentBadge code={agent.code} color={agent.color} agentId={agent.id} />
                      )}
                      <span className="text-[10px] font-mono text-[#6B7280]">
                        {c.evidenceCount} evidencias
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-10 pb-4 space-y-3">
                      {c.gap && (
                        <div>
                          <span className="text-[10px] text-[#6B7280] uppercase">Brecha</span>
                          <p className="text-sm text-[#FCA5A5] mt-1">{c.gap}</p>
                          {hasBreach && (
                            <span className="inline-block mt-1 text-[10px] font-bold bg-[#7F1D1D] text-[#EF4444] px-2 py-0.5 rounded">
                              BRECHA CRÍTICA
                            </span>
                          )}
                        </div>
                      )}
                      {c.actions.length > 0 && (
                        <div>
                          <span className="text-[10px] text-[#6B7280] uppercase">Acciones pendientes</span>
                          <ul className="mt-1 space-y-1">
                            {c.actions.map((a, i) => (
                              <li key={i} className="text-xs text-[#9CA3AF] flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-[#6B7280]" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {!c.gap && c.actions.length === 0 && (
                        <p className="text-xs text-[#22C55E]">
                          {c.currentLevel === 'N3' ? 'Fortaleza institucional' : 'En meta — sin acciones pendientes'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Accreditation Timeline */}
      <div className="rounded-md border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="text-xs text-[#6B7280] uppercase tracking-wider font-medium mb-4">
          Ruta a la Acreditación
        </h3>
        <div className="flex items-center gap-0">
          {milestones.map((m, i) => (
            <div key={m.label} className="flex-1 flex items-center">
              <div className="text-center flex-1">
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                    i === 0 ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'
                  }`}
                />
                <p className="text-xs font-semibold text-[#F1F5F9]">{m.label}</p>
                <p className="text-[10px] text-[#6B7280] font-mono">{m.date}</p>
                {m.pct > 0 && (
                  <p className="text-[10px] text-[#3B82F6] font-mono mt-1">{m.pct}%</p>
                )}
              </div>
              {i < milestones.length - 1 && (
                <div className="h-px flex-1 bg-[#1E293B]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
