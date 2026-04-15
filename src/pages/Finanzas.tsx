import { ArrowDownRight, ArrowUpRight, CircleDollarSign, TrendingUp } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PanelHeader, TerminalBadge } from '@/components/orquesta';
import { useOrquestaLiveOverlay } from '@/hooks/useOrquestaLiveOverlay';
import finanzasData from '@/data/finanzas-data.json';

function clp(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function fmtMillion(value: number) {
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export default function Finanzas() {
  const { live, hasAnyLiveData, loading: overlayLoading } = useOrquestaLiveOverlay();

  const chartData = finanzasData.months.map((month, i) => ({
    month,
    ingresos: finanzasData.ingresos[i],
    egresos: finanzasData.egresos[i],
    saldo: finanzasData.saldo_acumulado[i],
  }));

  const mesesCriticos = chartData.filter((m) => m.saldo < 0).map((m) => m.month);
  const ingresosTotal = finanzasData.ingresos.reduce((a, b) => a + b, 0);
  const egresosTotal = finanzasData.egresos.reduce((a, b) => a + b, 0);
  const balanceTotal = ingresosTotal - egresosTotal;

  const { historica_2025: moroHist, recuperacion_2026: moroRec } = finanzasData.morosidad;
  const moroTotal = moroHist + moroRec;
  const pctHist = moroTotal > 0 ? Math.round((moroHist / moroTotal) * 100) : 0;
  const pctRec = moroTotal > 0 ? Math.round((moroRec / moroTotal) * 100) : 0;

  const overlayBadge = overlayLoading ? (
    <TerminalBadge variant="sync">Sincronizando overlay…</TerminalBadge>
  ) : hasAnyLiveData ? (
    <TerminalBadge variant="live">Overlay live</TerminalBadge>
  ) : (
    <TerminalBadge variant="static">Base estándar</TerminalBadge>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Finanzas' }]} />

      <section className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <PanelHeader
          kicker="Panel financiero"
          title="Flujo de caja y sostenibilidad"
          description="Ingresos vs egresos por mes; meses con saldo acumulado negativo resaltados. Morosidad como tracker comparativo."
          right={overlayBadge}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowUpRight size={14} /> Ingresos anuales proyectados</div>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{clp(ingresosTotal)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Promedio mensual: {clp(Math.round(ingresosTotal / 12))}</p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowDownRight size={14} /> Egresos anuales proyectados</div>
          <p className="mt-3 text-3xl font-semibold text-rose-400">{clp(egresosTotal)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Promedio mensual: {clp(Math.round(egresosTotal / 12))}</p>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><CircleDollarSign size={14} /> Balance anual proyectado</div>
          <p className={`mt-3 text-3xl font-semibold ${balanceTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{clp(balanceTotal)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Live balance mensual: <span className="font-mono text-foreground">{live.balanceMensual !== null ? clp(live.balanceMensual || 0) : 'sin datos'}</span>
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Ingresos vs egresos por mes</h2>
          <span className="text-xs text-muted-foreground">Valores en MM CLP</span>
        </div>
        <div className="mt-4 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis yAxisId="left" tickFormatter={(v) => `${Math.round(v / 1_000_000)}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${Math.round(v / 1_000_000)}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, key: string) => [fmtMillion(value), key === 'ingresos' ? 'Ingresos' : key === 'egresos' ? 'Egresos' : 'Saldo acumulado']}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="ingresos" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={`in-${i}`}
                    fill={entry.saldo < 0 ? 'rgba(59,130,246,0.35)' : 'hsl(var(--primary))'}
                  />
                ))}
              </Bar>
              <Bar yAxisId="left" dataKey="egresos" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={`eg-${i}`}
                    fill={entry.saldo < 0 ? 'rgba(239,68,68,0.55)' : '#f97316'}
                  />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="saldo" stroke="#22c55e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <h3 className="text-sm font-medium text-foreground">Breakdown ingresos</h3>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            {Object.entries(finanzasData.ingresos_breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span className="text-muted-foreground">{key.split('_').join(' ')}</span>
                <span className="font-mono text-foreground">{clp(value as number)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground">Riesgo y morosidad</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">Tracker: peso histórico vs meta de recuperación (mismos montos JSON).</p>
          <div className="mt-4 space-y-4 text-xs">
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                <span>Histórico 2025</span>
                <span className="font-mono text-foreground">{clp(moroHist)} · {pctHist}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-rose-500/90" style={{ width: `${pctHist}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                <span>Recuperación 2026 (meta)</span>
                <span className="font-mono text-foreground">{clp(moroRec)} · {pctRec}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-emerald-500/90" style={{ width: `${pctRec}%` }} />
              </div>
            </div>
            <div className="rounded-md border border-border px-3 py-2 text-muted-foreground">
              Default activo: <span className="font-mono text-foreground">{finanzasData.morosidad.default_porcentaje}%</span>
            </div>
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-200">
              Meses críticos (saldo acum. negativo):{' '}
              <span className="font-mono">{mesesCriticos.join(', ') || 'sin déficit en serie'}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
