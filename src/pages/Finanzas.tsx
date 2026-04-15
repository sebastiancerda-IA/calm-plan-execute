import { ArrowDownRight, ArrowUpRight, CircleDollarSign, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useOrquestaLiveOverlay } from '@/hooks/useOrquestaLiveOverlay';
import finanzasData from '@/data/finanzas-data.json';

function clp(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function fmtMillion(value: number) {
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export default function Finanzas() {
  const { live, hasAnyLiveData } = useOrquestaLiveOverlay();

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

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Finanzas' }]} />

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Panel financiero</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">Flujo de caja y sostenibilidad</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
              Narrativa visual de ingresos, egresos y liquidez para detectar meses de riesgo antes de que impacten la operacion.
            </p>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-xs ${hasAnyLiveData ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10'}`}>
            {hasAnyLiveData ? 'Overlay live habilitado' : 'Base estandar cargada'}
          </span>
        </div>
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
              <Bar yAxisId="left" dataKey="ingresos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="left" dataKey="egresos" fill="#f97316" radius={[6, 6, 0, 0]} />
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
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-md border border-border px-3 py-2 text-muted-foreground">
              Morosidad historica 2025: <span className="font-mono text-foreground">{clp(finanzasData.morosidad.historica_2025)}</span>
            </div>
            <div className="rounded-md border border-border px-3 py-2 text-muted-foreground">
              Recuperacion 2026: <span className="font-mono text-foreground">{clp(finanzasData.morosidad.recuperacion_2026)}</span>
            </div>
            <div className="rounded-md border border-border px-3 py-2 text-muted-foreground">
              Default activo: <span className="font-mono text-foreground">{finanzasData.morosidad.default_porcentaje}%</span>
            </div>
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-300">
              Meses criticos: <span className="font-mono">{mesesCriticos.join(', ') || 'sin deficit'}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
