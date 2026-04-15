import { useMemo, useState } from 'react';
import { BadgeDollarSign, Building2, Calculator, Kanban } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PanelHeader } from '@/components/orquesta';
import otecCatalog from '@/data/otec-catalog.json';
import otecPipelineEmpresas from '@/data/otec-pipeline-empresas.json';

const ETAPA_LABEL: Record<string, string> = {
  prospecto: 'Prospecto',
  negociacion: 'Negociación',
  propuesta_enviada: 'Propuesta enviada',
  cerrado: 'Cerrado',
};

function clp(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

export default function OTEC() {
  const [cohortesDiplomado, setCohortesDiplomado] = useState(2);
  const [alumnosDiplomado, setAlumnosDiplomado] = useState(15);
  const [cohortesCurso, setCohortesCurso] = useState(2);
  const [alumnosCurso, setAlumnosCurso] = useState(10);

  const calc = useMemo(() => {
    const avgCurso = Math.round(otecCatalog.cursos.reduce((sum, c) => sum + c.price, 0) / otecCatalog.cursos.length);
    const ingresoDipl = otecCatalog.diplomados.length * cohortesDiplomado * alumnosDiplomado * 550000;
    const ingresoCursos = otecCatalog.cursos.length * cohortesCurso * alumnosCurso * avgCurso;
    return {
      avgCurso,
      ingresoDipl,
      ingresoCursos,
      total: ingresoDipl + ingresoCursos,
    };
  }, [cohortesDiplomado, alumnosDiplomado, cohortesCurso, alumnosCurso]);

  const pipelineByEtapa = useMemo(() => {
    const order = otecPipelineEmpresas.meta.etapas as string[];
    const map = new Map<string, typeof otecPipelineEmpresas.empresas>();
    order.forEach((e) => map.set(e, []));
    otecPipelineEmpresas.empresas.forEach((emp) => {
      const list = map.get(emp.etapa);
      if (list) list.push(emp);
    });
    return { order, map };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'OTEC Pipeline' }]} />

      <section className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <PanelHeader
          kicker="Unidad comercial · OTEC-AMA"
          title="Pipeline de ingresos"
          description="Catálogo formativo, calculadora de revenue y Kanban de empresas (JSON). Sustituir datos de ejemplo por pipeline real."
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-primary" />
            <h2 className="text-sm font-medium text-foreground">Calculadora comercial</h2>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-muted-foreground">
                Cohortes diplomado
                <input type="number" min={1} value={cohortesDiplomado} onChange={(e) => setCohortesDiplomado(Number(e.target.value || 1))} className="h-8 w-full rounded-md border border-border bg-background px-2 text-foreground" />
              </label>
              <label className="space-y-1 text-muted-foreground">
                Alumnos por cohorte
                <input type="number" min={1} value={alumnosDiplomado} onChange={(e) => setAlumnosDiplomado(Number(e.target.value || 1))} className="h-8 w-full rounded-md border border-border bg-background px-2 text-foreground" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-muted-foreground">
                Cohortes cursos
                <input type="number" min={1} value={cohortesCurso} onChange={(e) => setCohortesCurso(Number(e.target.value || 1))} className="h-8 w-full rounded-md border border-border bg-background px-2 text-foreground" />
              </label>
              <label className="space-y-1 text-muted-foreground">
                Alumnos por cohorte
                <input type="number" min={1} value={alumnosCurso} onChange={(e) => setAlumnosCurso(Number(e.target.value || 1))} className="h-8 w-full rounded-md border border-border bg-background px-2 text-foreground" />
              </label>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-[11px] text-emerald-300">Estimación anual</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{clp(calc.total)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Diplomados: {clp(calc.ingresoDipl)} · Cursos: {clp(calc.ingresoCursos)}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <BadgeDollarSign size={16} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-foreground">Catálogo formativo</h2>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Diplomados</p>
              <div className="space-y-2">
                {otecCatalog.diplomados.map((item) => (
                  <div key={item.name} className="rounded-md border border-border px-3 py-2">
                    <p className="text-foreground">{item.name}</p>
                    <p className="text-muted-foreground">{item.hours}h · {clp(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Cursos</p>
              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {otecCatalog.cursos.map((item) => (
                  <div key={item.name} className="rounded-md border border-border px-3 py-2">
                    <p className="text-foreground">{item.name}</p>
                    <p className="text-muted-foreground">{item.hours}h · {clp(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Kanban size={16} className="text-cyan-400" />
            <h2 className="text-sm font-medium text-foreground">Kanban empresas ({otecPipelineEmpresas.empresas.length})</h2>
          </div>
          <p className="text-[10px] text-muted-foreground">{otecPipelineEmpresas.meta.fuente}</p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
          {pipelineByEtapa.order.map((etapa) => {
            const list = pipelineByEtapa.map.get(etapa) ?? [];
            return (
              <article
                key={etapa}
                className="flex max-h-[min(70vh,520px)] flex-col rounded-xl border border-border bg-background/50"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                  <p className="text-xs font-semibold text-foreground">{ETAPA_LABEL[etapa] ?? etapa}</p>
                  <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {list.length}
                  </span>
                </div>
                <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2 text-[11px]">
                  {list.map((emp) => (
                    <li key={emp.id} className="rounded-lg border border-border/80 bg-card/80 px-2.5 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-foreground">{emp.nombre}</span>
                        <Building2 size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                      </div>
                      <p className="mt-1 font-mono text-emerald-300/90">{clp(emp.monto_estimado_clp)}</p>
                      {emp.contacto ? (
                        <p className="mt-1 truncate text-[10px] text-muted-foreground">{emp.contacto}</p>
                      ) : null}
                      {emp.nota ? <p className="mt-1 text-[10px] text-muted-foreground">{emp.nota}</p> : null}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
