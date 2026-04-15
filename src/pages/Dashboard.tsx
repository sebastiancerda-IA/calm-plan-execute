import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Bot, BriefcaseBusiness, Building2, CircleDollarSign, ShieldCheck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { KpiTile, PanelHeader, TerminalBadge } from '@/components/orquesta';
import { useOrquestaLiveOverlay } from '@/hooks/useOrquestaLiveOverlay';
import finanzasData from '@/data/finanzas-data.json';
import cnaCriteria from '@/data/cna-criteria.json';
import otecCatalog from '@/data/otec-catalog.json';
import commandAlerts from '@/data/command-center-alerts.json';

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
  const liquidezPositiva = saldoAcumulado >= 0;

  const n3Static = cnaCriteria.filter((c) => c.nivel === 'N3').length;
  const nTotal = cnaCriteria.length;
  const otecPotencial = finanzasData.ingresos_breakdown.otec_potencial;
  const linksPendientesStatic = 170;
  const linksPendientesLive =
    live.conveniosCount && live.conveniosConLink !== null
      ? Math.max(live.conveniosCount - (live.conveniosConLink || 0), 0)
      : null;

  const chartData = finanzasData.months.map((month, i) => ({
    month,
    margen: Math.round(finanzasData.margen[i] / 1_000_000),
    margenCrudo: finanzasData.margen[i],
  }));

  const cnaN3 = live.cnaTotal ? live.cnaN3 : n3Static;
  const cnaTotal = live.cnaTotal || nTotal;
  const cnaPct = Math.round((cnaN3 / cnaTotal) * 100);

  const overlayBadge = overlayLoading ? (
    <TerminalBadge variant="sync">Sincronizando overlay…</TerminalBadge>
  ) : hasAnyLiveData ? (
    <TerminalBadge variant="live">Live overlay</TerminalBadge>
  ) : (
    <TerminalBadge variant="static">Base estática</TerminalBadge>
  );

  return (
    <div className="space-y-4 md:space-y-5">
      <Breadcrumbs items={[{ label: 'IDMA Command Center' }]} />

      <section className="orquesta-panel rounded-2xl border border-border/90 bg-card p-4 md:p-5">
        <PanelHeader
          kicker="Orquesta v2 · Bloomberg-style"
          title="IDMA Command Center"
          description="Abres y en segundos ves liquidez, CNA, alertas y motor OTEC. Datos JSON desde minuto 1; Supabase enriquece cuando hay sesión."
          right={
            <div className="flex flex-wrap items-center gap-2">
              {overlayBadge}
              <TerminalBadge variant="neutral">Datos listos sin red</TerminalBadge>
            </div>
          }
        />

        <div
          className={`mt-4 flex flex-col gap-2 rounded-lg border px-4 py-3 md:flex-row md:items-center md:justify-between ${
            liquidezPositiva ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/35 bg-rose-500/10'
          }`}
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Estado · cierre Feb-27</span>
            <span className={`font-mono text-lg font-semibold ${liquidezPositiva ? 'text-emerald-400' : 'text-rose-400'}`}>
              {liquidezPositiva ? 'Liquidez proyectada positiva' : 'Liquidez proyectada en tensión'}
            </span>
          </div>
          <p className="text-right font-mono text-sm text-muted-foreground">
            Saldo acumulado: <span className="text-foreground">{clp(saldoAcumulado)}</span>
          </p>
        </div>
      </section>

      {/* Bento: KPIs + chart + OTEC */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-3">
        <KpiTile
          className="lg:col-span-3"
          label="Salud financiera"
          value={clp(saldoAcumulado)}
          valueClassName={saldoAcumulado >= 0 ? '!text-emerald-400' : '!text-rose-400'}
          sub="Saldo acumulado proyectado (serie JSON). Nov–Feb: tramo crítico."
          icon={<CircleDollarSign className="text-orange-400" size={20} />}
        />
        <KpiTile
          className="lg:col-span-3"
          label="CNA 2027 · N3"
          value={`${cnaN3}/${cnaTotal}`}
          sub={`Progreso ejecutivo ${cnaPct}%`}
          icon={<ShieldCheck className="text-emerald-400" size={20} />}
        />
        <KpiTile
          className="lg:col-span-3"
          label="Alertas / focos"
          value={String(linksPendientesLive ?? linksPendientesStatic)}
          sub="Links convenio pendientes (live o base)"
          icon={<AlertTriangle className="text-amber-400" size={20} />}
        />
        <KpiTile
          className="lg:col-span-3"
          label="OTEC potencial"
          value={clp(otecPotencial)}
          sub={`${otecCatalog.diplomados.length} diplomados · ${otecCatalog.cursos.length} cursos`}
          icon={<BriefcaseBusiness className="text-emerald-400" size={20} />}
        />

        <article className="orquesta-panel flex flex-col p-4 lg:col-span-7 lg:min-h-[280px]">
          <div className="flex items-center justify-between gap-2">
            <p className="orquesta-section-kicker">Flujo · margen mensual</p>
            <span className="text-[10px] text-muted-foreground">MM CLP</span>
          </div>
          <div className="mt-2 min-h-[220px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Tooltip formatter={(value: number) => [`${value} MM`, 'Margen']} />
                <Bar dataKey="margen" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.margenCrudo < 0 ? 'rgba(239,68,68,0.75)' : 'hsl(var(--primary))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Link to="/finanzas" className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            Panel financiero <ArrowUpRight size={11} />
          </Link>
        </article>

        <article className="orquesta-panel flex flex-col justify-between p-4 lg:col-span-5">
          <div>
            <p className="orquesta-section-kicker">Motor OTEC</p>
            <p className="orquesta-kpi-value mt-1 !text-xl md:!text-2xl">{clp(otecPotencial)}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">Potencial anual sin activar (breakdown JSON).</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-md border border-border px-2 py-1.5 text-muted-foreground">
              Diplomados <span className="ml-1 font-mono text-foreground">{otecCatalog.diplomados.length}</span>
            </div>
            <div className="rounded-md border border-border px-2 py-1.5 text-muted-foreground">
              Cursos <span className="ml-1 font-mono text-foreground">{otecCatalog.cursos.length}</span>
            </div>
          </div>
          <Link to="/otec" className="mt-4 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            Pipeline + Kanban <ArrowUpRight size={11} />
          </Link>
        </article>

        <article className="orquesta-panel p-4 lg:col-span-6">
          <p className="orquesta-section-kicker">Alertas ejecutivas</p>
          <ul className="mt-3 space-y-2 text-[11px]">
            {commandAlerts.items.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className="flex items-start justify-between gap-2 rounded-md border border-border/80 bg-background/40 px-2.5 py-2 transition-colors hover:border-primary/40"
                >
                  <span className="text-muted-foreground">
                    <span
                      className={`mr-2 inline-block rounded px-1 py-0.5 font-mono text-[9px] uppercase ${
                        item.prioridad === 'alta'
                          ? 'bg-rose-500/20 text-rose-200'
                          : item.prioridad === 'media'
                            ? 'bg-amber-500/20 text-amber-200'
                            : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {item.prioridad}
                    </span>
                    {item.titulo}
                  </span>
                  <ArrowUpRight size={12} className="shrink-0 text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="orquesta-panel p-4 lg:col-span-6">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-cyan-400" />
            <p className="orquesta-section-kicker">Live overlay · IA</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-md border border-border px-2 py-2 text-[11px] text-muted-foreground">
              Urgentes 24h
              <span className="mt-1 block font-mono text-foreground">{live.urgent24h || 0}</span>
            </div>
            <div className="rounded-md border border-border px-2 py-2 text-[11px] text-muted-foreground">
              Emails 24h
              <span className="mt-1 block font-mono text-foreground">{compact(live.emails24h || 0)}</span>
            </div>
            <div className="rounded-md border border-border px-2 py-2 text-[11px] text-muted-foreground">
              Agentes activos
              <span className="mt-1 block font-mono text-foreground">{live.activeAgents || 0}</span>
            </div>
            <div className="rounded-md border border-border px-2 py-2 text-[11px] text-muted-foreground">
              Docs RAG
              <span className="mt-1 block font-mono text-foreground">{compact(live.ragDocs || 0)}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/vcm"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Building2 size={12} /> VCM
            </Link>
            <Link
              to="/inteligencia"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Bot size={12} /> Inteligencia
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
