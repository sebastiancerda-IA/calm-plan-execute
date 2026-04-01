import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MetricTile } from '@/components/shared/MetricTile';
import { useInstitutionalMetrics } from '@/hooks/useInstitutionalMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Lock } from 'lucide-react';

export default function Finanzas() {
  const { isDirectorOrDG, role } = useAuth();
  const { ingresosMensual, gastosMensual, balance, matriculasTotal } = useInstitutionalMetrics();

  const { data: records = [] } = useQuery({
    queryKey: ['financial_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: isDirectorOrDG,
  });

  if (!isDirectorOrDG) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Lock size={48} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Acceso Restringido</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          El módulo financiero está disponible solo para el Director y la Directora General.
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Tu rol actual: <span className="text-primary">{role.toUpperCase()}</span>
        </p>
      </div>
    );
  }

  const balanceNum = Number(balance);
  const ingresosNum = Number(ingresosMensual);
  const gastosNum = Number(gastosMensual);
  const margen = ingresosNum > 0 ? ((balanceNum / ingresosNum) * 100).toFixed(1) : '0';
  const ingresoPorAlumno = matriculasTotal > 0 ? Math.round(ingresosNum / Number(matriculasTotal)) : 0;

  const ingresos = records.filter(r => r.record_type === 'ingreso');
  const gastos = records.filter(r => r.record_type === 'gasto');

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Finanzas' }]} />

      <div className="flex items-center gap-3">
        <DollarSign size={20} className="text-idma-green" />
        <h1 className="text-xl font-semibold text-foreground">Centro Financiero</h1>
        <span className="text-[9px] font-mono bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
          CONFIDENCIAL
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Ingresos mensual"
          value={`$${(ingresosNum / 1000000).toFixed(1)}M`}
          trend="up"
          suffix="CLP"
          color="#22C55E"
          sparkline={[12, 14, 13, 15, 14, 16, ingresosNum / 1000000]}
        />
        <MetricTile
          label="Gastos mensual"
          value={`$${(gastosNum / 1000000).toFixed(1)}M`}
          trend="down"
          suffix="CLP"
          color="#EF4444"
          sparkline={[10, 11, 12, 11, 13, 12, gastosNum / 1000000]}
        />
        <MetricTile
          label="Balance"
          value={`$${(balanceNum / 1000000).toFixed(1)}M`}
          trend={balanceNum > 0 ? 'up' : 'down'}
          suffix={`Margen: ${margen}%`}
          color={balanceNum > 0 ? '#22C55E' : '#EF4444'}
          sparkline={[2, 3, 1, 4, 1, 4, balanceNum / 1000000]}
        />
        <MetricTile
          label="Ingreso por alumno"
          value={`$${(ingresoPorAlumno / 1000).toFixed(0)}K`}
          trend="stable"
          suffix="CLP mensual"
          color="#3B82F6"
          sparkline={[20, 22, 21, 23, 22, 24, ingresoPorAlumno / 1000]}
        />
      </div>

      {/* Warning banner if balance negative */}
      {balanceNum < 0 && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3">
          <AlertTriangle size={16} className="text-destructive" />
          <p className="text-xs text-destructive">
            Balance negativo. Revisar estructura de costos y proyección de ingresos.
          </p>
        </div>
      )}

      {/* Financial records table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ingresos */}
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-green-500" />
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Ingresos ({ingresos.length})
            </h3>
          </div>
          {ingresos.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ingresos.map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs text-foreground">{r.concept}</p>
                    <p className="text-[10px] text-muted-foreground">{r.category} · {r.period}</p>
                  </div>
                  <span className="text-xs font-mono text-green-500">
                    +${(r.amount / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Sin registros. Carga datos financieros mañana vía n8n o API Bridge.
            </p>
          )}
        </div>

        {/* Gastos */}
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-red-500" />
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Gastos ({gastos.length})
            </h3>
          </div>
          {gastos.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {gastos.map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs text-foreground">{r.concept}</p>
                    <p className="text-[10px] text-muted-foreground">{r.category} · {r.period}</p>
                  </div>
                  <span className="text-xs font-mono text-red-500">
                    -${(r.amount / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Sin registros. Carga datos financieros mañana vía n8n o API Bridge.
            </p>
          )}
        </div>
      </div>

      {/* Data loading hint */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
          Preparación para mañana
        </h3>
        <p className="text-xs text-muted-foreground">
          Los datos financieros se cargarán mañana vía la API Bridge o directamente desde n8n.
          Usa el endpoint <code className="bg-secondary px-1 rounded">orchestrator-api</code> con la acción
          <code className="bg-secondary px-1 rounded ml-1">create_financial_record</code> o carga un CSV con la estructura:
          periodo, categoría, concepto, monto, tipo (ingreso/gasto).
        </p>
      </div>
    </div>
  );
}
