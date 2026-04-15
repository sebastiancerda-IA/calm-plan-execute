import { useMemo, useState } from 'react';
import { BadgeDollarSign, Building2, Calculator, Rocket } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import otecCatalog from '@/data/otec-catalog.json';

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

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'OTEC Pipeline' }]} />

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Unidad comercial</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">OTEC-AMA · Pipeline de ingresos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Catalogo formativo + simulador de revenue + pipeline empresarial para activar caja nueva.</p>
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
              <p className="text-[11px] text-emerald-300">Estimacion anual</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{clp(calc.total)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Diplomados: {clp(calc.ingresoDipl)} · Cursos: {clp(calc.ingresoCursos)}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <BadgeDollarSign size={16} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-foreground">Catalogo formativo</h2>
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
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
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

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Rocket size={16} className="text-cyan-400" />
          <h2 className="text-sm font-medium text-foreground">Pipeline empresas ({otecCatalog.pipeline.target_companies} objetivo)</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {otecCatalog.pipeline.stages.map((stage) => (
            <article key={stage.name} className="rounded-xl border border-border bg-background/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">{stage.name}</p>
                <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">{stage.items.length}</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {stage.items.map((company) => (
                  <li key={company} className="inline-flex items-center gap-1">
                    <Building2 size={11} /> {company}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
