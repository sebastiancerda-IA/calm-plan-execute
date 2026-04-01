import { useSupabaseCNA } from '@/hooks/useSupabaseCNA';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, FileText, TrendingUp } from 'lucide-react';

const TARGET_DATE = new Date('2027-03-01');

function daysUntil(target: Date) {
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000));
}

const levelNum: Record<string, number> = { N1: 1, N2: 2, N3: 3 };

export function AccreditationGuide() {
  const { dimensions, criteria, overall } = useSupabaseCNA();
  const { agents } = useSupabaseAgents();

  const daysLeft = daysUntil(TARGET_DATE);

  // Critical gaps: current < target
  const gaps = criteria
    .filter((c: any) => (levelNum[c.current_level] || 1) < (levelNum[c.target_level] || 2))
    .sort((a: any, b: any) => {
      const gapA = (levelNum[b.target_level] || 2) - (levelNum[b.current_level] || 1);
      const gapB = (levelNum[a.target_level] || 2) - (levelNum[a.current_level] || 1);
      return gapA - gapB;
    });

  const criticalGaps = gaps.filter((c: any) => c.is_priority || c.is_mandatory);

  const getAgentName = (id: string) => {
    const agent = agents.find((a: any) => a.id === id);
    return agent ? agent.code : id;
  };

  return (
    <div className="rounded-md border border-border bg-card p-4">
      {/* Header with countdown */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Guía Acreditación CNA 2027
        </h3>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-muted-foreground" />
          <span className="text-xs font-mono font-bold text-foreground">
            {daysLeft} días restantes
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Criterios en meta</span>
          <span className="font-mono font-bold text-foreground">{overall}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overall}%`,
              backgroundColor: overall >= 70 ? '#22C55E' : overall >= 40 ? '#EAB308' : '#EF4444',
            }}
          />
        </div>
      </div>

      {/* Critical gaps */}
      {criticalGaps.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-destructive" />
            <span className="text-[10px] text-destructive font-medium uppercase tracking-wider">
              Brechas prioritarias ({criticalGaps.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {criticalGaps.slice(0, 5).map((c: any) => (
              <Link
                key={c.id}
                to={`/cna?expand=${c.id}`}
                className="flex items-start gap-2 p-2 rounded bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 transition-colors"
              >
                <span className="text-[10px] font-mono font-bold text-destructive mt-0.5 w-6 shrink-0">
                  {c.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-foreground truncate">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {c.gap_description} · {c.current_level}→{c.target_level} · {getAgentName(c.responsible_agent)}
                  </div>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                  {c.evidence_count} ev.
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Dimension summary */}
      <div className="space-y-1">
        {dimensions.map((dim) => (
          <div key={dim.id} className="flex items-center gap-2 text-[10px]">
            <div className="flex-1 truncate text-muted-foreground">
              {dim.name.replace(/^[IVX]+ /, '')}
            </div>
            <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${dim.percentage}%`,
                  backgroundColor: dim.percentage >= 80 ? '#22C55E' : dim.percentage >= 50 ? '#EAB308' : '#EF4444',
                }}
              />
            </div>
            <span className="font-mono text-foreground w-8 text-right">{dim.percentage}%</span>
          </div>
        ))}
      </div>

      {/* Actions row */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
        <Link
          to="/cna"
          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          <TrendingUp size={10} />
          Ver matriz completa
        </Link>
        <Link
          to="/acreditacion"
          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          <FileText size={10} />
          Cargar documentos
        </Link>
      </div>
    </div>
  );
}
