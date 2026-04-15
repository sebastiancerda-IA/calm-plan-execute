import { Link } from 'react-router-dom';
import { Building2, CalendarDays, CircleDollarSign, Filter, Target } from 'lucide-react';
import type { CentroData } from '@/data/centros';

type Props = {
  centro: CentroData;
};

function clp(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function occupancyBadge(ocupacionPct: number) {
  if (ocupacionPct >= 70) {
    return { label: 'Verde', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  }
  if (ocupacionPct >= 40) {
    return { label: 'Amarillo', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
  }
  return { label: 'Rojo', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
}

export function CentroOperativo({ centro }: Props) {
  const badge = occupancyBadge(centro.ocupacionPct);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Centros de aprendizaje</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">{centro.nombre} · Panel Operativo</h1>
        <p className="mt-2 text-sm text-muted-foreground">{centro.foco}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground border-border">
          Modo base activo (static-first)
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ingresos mensual</p>
          <p className="mt-2 text-2xl font-semibold text-foreground font-mono">{clp(centro.ingresosMensual)}</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ocupacion</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-semibold text-foreground font-mono">{centro.ocupacionPct}%</p>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] ${badge.cls}`}>{badge.label}</span>
          </div>
        </article>
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Leads abiertos</p>
          <p className="mt-2 text-2xl font-semibold text-foreground font-mono">{centro.leadsAbiertos}</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Actividades proximas</p>
          <p className="mt-2 text-2xl font-semibold text-foreground font-mono">{centro.actividadesProximas}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <h2 className="text-sm font-medium text-foreground inline-flex items-center gap-2">
            <Filter size={14} /> Embudo comercial
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {centro.pipeline.map((stage) => (
              <div key={stage.name} className="rounded-md border border-border bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{stage.name}</p>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {stage.items.length}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {stage.items.map((item) => (
                    <li key={item} className="inline-flex items-center gap-1">
                      <Target size={10} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground inline-flex items-center gap-2">
            <CalendarDays size={14} /> Agenda
          </h2>
          <ul className="mt-3 space-y-2 text-xs">
            {centro.agenda.map((event) => (
              <li key={`${event.fecha}-${event.titulo}`} className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">
                <p className="text-foreground">{event.titulo}</p>
                <p className="mt-1 font-mono">{event.fecha}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Link to="/vcm" className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <Building2 size={12} /> Ver convenios vinculados ({centro.conveniosVinculados})
          </Link>
          <Link to="/finanzas" className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <CircleDollarSign size={12} /> Ir a Finanzas
          </Link>
          <Link to="/inteligencia" className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <Target size={12} /> Ver Inteligencia IA
          </Link>
          <button className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground text-left hover:text-foreground">
            Registrar lead
          </button>
          <button className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground text-left hover:text-foreground">
            Programar actividad
          </button>
        </div>
      </section>
    </div>
  );
}
