import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCNAProgress } from '@/hooks/useCNAProgress';
import { AgentBadge } from '@/components/shared/AgentBadge';
import { mockAgents } from '@/data/mockAgents';
import { ChevronDown, ChevronRight, AlertTriangle, Download } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

function exportCSV(dimensions: any[]) {
  const rows = [['ID', 'Nombre', 'Dimensión', 'Nivel Actual', 'Nivel Meta', 'Brecha', 'Evidencias', 'Acciones']];
  dimensions.forEach((dim) => {
    dim.criteria.forEach((c: any) => {
      rows.push([c.id, c.name, dim.name, c.currentLevel, c.targetLevel, c.gap || '', String(c.evidenceCount), c.actions.join('; ')]);
    });
  });
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cna_matrix_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function CNAMatrix() {
  const { dimensions, overall } = useCNAProgress();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const expandId = searchParams.get('expand');
    if (expandId) setExpanded(expandId);
  }, [searchParams]);

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);
  const getAgent = (code: string) => mockAgents.find((a) => a.code === code);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'CNA Matrix' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">CNA Matrix</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportCSV(dimensions)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2.5 py-1.5"
          >
            <Download size={12} />
            Exportar CSV
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progreso global:</span>
            <span className="font-mono text-sm font-bold text-foreground">{overall}%</span>
          </div>
        </div>
      </div>

      {/* Dimension overview with donuts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {dimensions.map((dim) => {
          const data = [
            { name: 'En meta', value: dim.atTarget },
            { name: 'Brecha', value: dim.total - dim.atTarget },
          ];
          return (
            <div key={dim.id} className="rounded-md border border-border bg-card p-3 flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="value" innerRadius={14} outerRadius={22} strokeWidth={0}>
                      <Cell fill="#22C55E" />
                      <Cell fill="#991B1B" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-foreground font-medium truncate">{dim.name.replace(/^[IVX]+ /, '')}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{dim.atTarget}/{dim.total} en meta</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dimensions detail */}
      {dimensions.map((dim) => (
        <div key={dim.id} className="rounded-md border border-border bg-card overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-foreground">{dim.name}</h2>
              {(dim as any).obligatoria && (
                <span className="text-[10px] font-bold bg-[#7F1D1D] text-[#EF4444] px-2 py-0.5 rounded">
                  OBLIGATORIA
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground">
                {dim.atTarget}/{dim.total} en meta
              </span>
              <div className="w-24 h-1.5 bg-secondary rounded-full">
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

          <div className="border-t border-border">
            {dim.criteria.map((c) => {
              const isExpanded = expanded === c.id;
              const agent = getAgent(c.responsibleAgent);
              const hasBreach = c.currentLevel < c.targetLevel;

              return (
                <div key={c.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => toggleExpand(c.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-muted-foreground" />
                      ) : (
                        <ChevronRight size={14} className="text-muted-foreground" />
                      )}
                      <span className="font-mono text-xs font-bold text-foreground">{c.id}</span>
                      <span className="text-sm text-foreground">{c.name}</span>
                      {hasBreach && <AlertTriangle size={12} className="text-[#EF4444]" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: levelColors[c.currentLevel].bg, color: levelColors[c.currentLevel].text }}
                      >
                        {c.currentLevel}
                      </span>
                      <span className="text-[10px] text-muted-foreground">→</span>
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: levelColors[c.targetLevel].bg, color: levelColors[c.targetLevel].text }}
                      >
                        {c.targetLevel}
                      </span>
                      {agent && <AgentBadge code={agent.code} color={agent.color} agentId={agent.id} />}
                      <span className="text-[10px] font-mono text-muted-foreground">{c.evidenceCount} evidencias</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-10 pb-4 space-y-3">
                      {c.gap && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Brecha</span>
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
                          <span className="text-[10px] text-muted-foreground uppercase">Acciones pendientes</span>
                          <ul className="mt-1 space-y-1">
                            {c.actions.map((a, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
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
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
          Ruta a la Acreditación
        </h3>
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute top-2 left-0 right-0 h-0.5 bg-secondary" />
          <div className="absolute top-2 left-0 h-0.5 bg-primary" style={{ width: '25%' }} />

          <div className="flex items-start justify-between relative">
            {milestones.map((m, i) => (
              <div key={m.label} className="text-center flex-1">
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-2 relative z-10 ${
                    i === 0 ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
                <p className="text-xs font-semibold text-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{m.date}</p>
                {m.pct > 0 && (
                  <p className="text-[10px] text-primary font-mono mt-1">{m.pct}%</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
