import { useSupabaseCNA } from '@/hooks/useSupabaseCNA';
import { Link } from 'react-router-dom';

const levelColors: Record<string, { bg: string; text: string }> = {
  N1: { bg: '#991B1B', text: '#FCA5A5' },
  N2: { bg: '#854D0E', text: '#FDE68A' },
  N3: { bg: '#166534', text: '#86EFAC' },
};

export function CNASnapshot() {
  const { dimensions, overall } = useSupabaseCNA();

  return (
    <div className="rounded-md border border-border bg-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          CNA Snapshot
        </h3>
        <Link to="/cna" className="text-[10px] text-primary hover:underline">
          Ver matriz completa →
        </Link>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progreso global</span>
          <span className="font-mono font-bold text-foreground">{overall}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${overall}%`, backgroundColor: overall >= 80 ? '#22C55E' : '#EAB308' }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {dimensions.map((dim) => (
          <div key={dim.id} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground flex-1 truncate">{dim.name.replace(/^[IVX]+ /, '')}</span>
            <div className="flex gap-0.5">
              {dim.criteria.map((c: any) => {
                const colors = levelColors[c.currentLevel] || levelColors.N1;
                return (
                  <Link
                    key={c.id}
                    to={`/cna?expand=${c.id}`}
                    className="w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-mono font-bold hover:ring-1 hover:ring-primary transition-all"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                    title={`${c.id}: ${c.name} (${c.currentLevel})`}
                  >
                    {c.id.replace('C', '')}
                  </Link>
                );
              })}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
              {dim.atTarget}/{dim.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
