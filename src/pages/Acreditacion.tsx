import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { supabase } from '@/integrations/supabase/client';
import cnaCriteriaStatic from '@/data/cna-criteria.json';

function levelColor(level: string) {
  if (level === 'N3') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (level === 'N2') return 'bg-amber-500/15 text-amber-200 border-amber-500/30';
  return 'bg-rose-500/15 text-rose-200 border-rose-500/30';
}

export default function Acreditacion() {
  const liveCriteriaQuery = useQuery({
    queryKey: ['orquesta-cna-live-grid'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cna_criteria').select('id,current_level,responsible_agent,evidence_count');
      if (error) return null;
      return data ?? [];
    },
    staleTime: 120_000,
    refetchInterval: 180_000,
  });

  const mergedCriteria = useMemo(() => {
    const map = new Map<string, any>();
    (liveCriteriaQuery.data || []).forEach((item: any) => map.set(item.id, item));

    return cnaCriteriaStatic.map((criterion) => {
      const live = map.get(criterion.id);
      return {
        ...criterion,
        nivel: live?.current_level || criterion.nivel,
        responsable: live?.responsible_agent || criterion.responsable,
        evidence_count: live?.evidence_count ?? null,
      };
    });
  }, [liveCriteriaQuery.data]);

  const stats = useMemo(() => {
    const n3 = mergedCriteria.filter((c) => c.nivel === 'N3').length;
    const n2 = mergedCriteria.filter((c) => c.nivel === 'N2').length;
    const n1 = mergedCriteria.filter((c) => c.nivel === 'N1').length;
    const total = mergedCriteria.length;
    const pct = Math.round((n3 / total) * 100);
    return { n3, n2, n1, total, pct };
  }, [mergedCriteria]);

  const targetDate = new Date('2027-12-31T23:59:59-03:00');
  const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Acreditacion CNA 2027' }]} />

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tracker ejecutivo</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">CNA 2027 - Radar institucional</h1>
            <p className="mt-2 text-sm text-muted-foreground">Semaforo de 16 criterios con foco en cierre de brechas y trazabilidad de evidencia.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <Clock3 size={12} /> {daysLeft} dias para meta 2027
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nivel superior</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-400">{stats.n3}/{stats.total}</p>
          <p className="mt-2 text-xs text-muted-foreground">Progreso N3: {stats.pct}%</p>
          <div className="mt-3 h-2 rounded-full bg-secondary">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(8, stats.pct)}%` }} />
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">N2 en progreso</p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">{stats.n2}</p>
          <p className="mt-2 text-xs text-muted-foreground">Requieren cierre de evidencia y gobernanza</p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">N1 en riesgo</p>
          <p className="mt-2 text-3xl font-semibold text-rose-300">{stats.n1}</p>
          <p className="mt-2 text-xs text-muted-foreground">Prioridad de mejora inmediata</p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Estado live</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {liveCriteriaQuery.isLoading && 'Sincronizando criterios…'}
            {liveCriteriaQuery.isError && 'No se pudo cargar cna_criteria (modo estático)'}
            {!liveCriteriaQuery.isLoading && !liveCriteriaQuery.isError && liveCriteriaQuery.data && liveCriteriaQuery.data.length > 0 && 'Conectado a cna_criteria'}
            {!liveCriteriaQuery.isLoading && !liveCriteriaQuery.isError && (!liveCriteriaQuery.data || liveCriteriaQuery.data.length === 0) && 'Usando base estática'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Actualización cada 3 minutos</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Matriz de criterios C1-C16</h2>
          <span className="text-xs text-muted-foreground">N3 verde, N2 amarillo, N1 rojo</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {mergedCriteria.map((criterion) => (
            <article key={criterion.id} className="rounded-xl border border-border bg-background/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{criterion.id}</p>
                  <p className="text-xs text-muted-foreground">{criterion.area}</p>
                </div>
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${levelColor(criterion.nivel)}`}>
                  {criterion.nivel}
                </span>
              </div>
              <p className="mt-2 text-xs text-foreground line-clamp-2">{criterion.nombre}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">Resp: {criterion.responsable}</p>

              <div className="mt-3 flex items-center gap-2 text-[11px]">
                {criterion.nivel === 'N3' ? <CheckCircle2 size={12} className="text-emerald-300" /> : <ShieldAlert size={12} className="text-amber-300" />}
                <span className="text-muted-foreground">
                  {criterion.evidence_count !== null ? `${criterion.evidence_count} evidencias` : 'Evidencia por validar'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
