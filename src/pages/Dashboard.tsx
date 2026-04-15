import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Bot, BriefcaseBusiness, Building2, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useOrquestaLiveOverlay } from '@/hooks/useOrquestaLiveOverlay';
import finanzasData from '@/data/finanzas-data.json';
import cnaCriteria from '@/data/cna-criteria.json';
import otecCatalog from '@/data/otec-catalog.json';

function clp(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function compact(value: number) {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

export default function Dashboard() {
  const { live, hasAnyLiveData, loading: overlayLoading } = useOrquestaLiveOverlay();

  const saldoAcumulado = finanzasData.saldo_acumulado[finanzasData.saldo_acumulado.length - 1];
  const n3Static = cnaCriteria.filter((c) => c.nivel === 'N3').length;
  const nTotal = cnaCriteria.length;
  const cnaPctStatic = Math.round((n3Static / nTotal) * 100);
  const otecPotencial = finanzasData.ingresos_breakdown.otec_potencial;
  const linksPendientesStatic = 170;
  const linksPendientesLive = live.conveniosCount && live.conveniosConLink !== null
    ? Math.max(live.conveniosCount - (live.conveniosConLink || 0), 0)
    : null;

  const chartData = finanzasData.months.map((month, i) => ({
    month,
    margen: Math.round(finanzasData.margen[i] / 1_000_000),
  }));

  const cnaN3 = live.cnaTotal ? live.cnaN3 : n3Static;
  const cnaTotal = live.cnaTotal || nTotal;
  const cnaPct = Math.round((cnaN3 / cnaTotal) * 100);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'IDMA Command Center' }]} />

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Orquesta v2</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">IDMA Command Center</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
              Vista ejecutiva para decidir en minutos: flujo de caja, avance CNA, pipeline OTEC y actividad IA en una sola pantalla.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full border px-2.5 py-1 ${overlayLoading ? 'border-blue-500/40 text-blue-300 bg-blue-500/10' : hasAnyLiveData ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10'}`}>
              {overlayLoading ? 'Sincronizando overlay…' : hasAnyLiveData ? 'Live overlay conectado' : 'Modo base estático'}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">Datos listos desde minuto 1</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Salud financiera</p>
          <div className="mt-3 flex items-center gap-2">
            <CircleDollarSign className="text-orange-400" size={18} />
            <h2 className="text-sm font-medium text-foreground">Saldo acumulado proyectado</h2>
          </div>
          <p className={`mt-3 text-3xl font-semibold ${saldoAcumulado >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {clp(saldoAcumulado)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Cierre Feb-27. Nov-Feb aparecen como tramo critico.</p>
          {live.balanceMensual !== null && (
            <p className="mt-2 text-xs text-muted-foreground">
              Overlay live balance mensual: <span className="font-mono text-foreground">{clp(live.balanceMensual || 0)}</span>
            </p>
          )}
          <Link to="/finanzas" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Abrir panel financiero <ArrowUpRight size={12} />
          </Link>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">CNA 2027</p>
          <div className="mt-3 flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={18} />
            <h2 className="text-sm font-medium text-foreground">Criterios en nivel N3</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-foreground">{cnaN3}/{cnaTotal}</p>
          <div className="mt-3 h-2 rounded-full bg-secondary">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(8, cnaPct)}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Progreso ejecutivo: {cnaPct}% del objetivo superior.</p>
          <Link to="/acreditacion" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Ver matriz de criterios <ArrowUpRight size={12} />
          </Link>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Alertas accionables</p>
          <div className="mt-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={18} />
            <h2 className="text-sm font-medium text-foreground">Focos de atencion hoy</h2>
          </div>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">
              Links de convenios pendientes: <span className="font-mono text-foreground">{linksPendientesLive ?? linksPendientesStatic}</span>
            </li>
            <li className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">
              Emails urgentes 24h: <span className="font-mono text-foreground">{live.urgent24h || 0}</span>
            </li>
            <li className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">
              Agentes activos hoy: <span className="font-mono text-foreground">{live.activeAgents || 0}</span>
            </li>
          </ul>
          <Link to="/inteligencia" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Abrir actividad IA <ArrowUpRight size={12} />
          </Link>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Flujo de caja mensual</p>
            <span className="text-[11px] text-muted-foreground">Margen en MM CLP</span>
          </div>
          <div className="mt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${v}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`${value} MM`, 'Margen']} />
                <Bar dataKey="margen" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Motor comercial OTEC</p>
          <div className="mt-3 flex items-center gap-2">
            <BriefcaseBusiness className="text-emerald-400" size={18} />
            <h2 className="text-sm font-medium text-foreground">Potencial anual sin activar</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-foreground">{clp(otecPotencial)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">
              Diplomados: <span className="font-mono text-foreground">{otecCatalog.diplomados.length}</span>
            </div>
            <div className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">
              Cursos: <span className="font-mono text-foreground">{otecCatalog.cursos.length}</span>
            </div>
          </div>
          <Link to="/otec" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Abrir pipeline de ingresos <ArrowUpRight size={12} />
          </Link>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Inteligencia operacional</p>
              <div className="mt-2 flex items-center gap-2">
                <Bot size={18} className="text-cyan-400" />
                <h2 className="text-sm font-medium text-foreground">Actividad IA y base de conocimiento</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              <div className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">Emails 24h <span className="block font-mono text-foreground">{compact(live.emails24h || 0)}</span></div>
              <div className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">Items procesados <span className="block font-mono text-foreground">{compact(live.agentsProcessed24h || 0)}</span></div>
              <div className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">Docs RAG <span className="block font-mono text-foreground">{compact(live.ragDocs || 0)}</span></div>
              <div className="rounded-md border border-border px-2.5 py-2 text-muted-foreground">Convenios <span className="block font-mono text-foreground">{compact(live.conveniosCount || 196)}</span></div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link to="/vcm" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-muted-foreground hover:text-foreground">
              <Building2 size={12} /> Convenios y Erasmus
            </Link>
            <Link to="/inteligencia" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-muted-foreground hover:text-foreground">
              <Bot size={12} /> Ver feed IA
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
