import { useInstitutionalMetrics } from '@/hooks/useInstitutionalMetrics';
import { useOTECPrograms } from '@/hooks/useOTECPrograms';
import { useSupabaseCNA } from '@/hooks/useSupabaseCNA';
import { MetricTile } from '@/components/shared/MetricTile';

export function InstitutionalMetrics() {
  const { matriculasNuevas, matriculasAntiguas, matriculasTotal, balance } = useInstitutionalMetrics();
  const { cursos, diplomados } = useOTECPrograms();
  const { overall } = useSupabaseCNA();

  const balanceM = Number(balance) / 1000000;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricTile
        label="Matrículas activas"
        value={matriculasTotal}
        trend="up"
        suffix={`${matriculasNuevas} nuevas · ${matriculasAntiguas} antiguas`}
        color="#8B5CF6"
        sparkline={[580, 600, 610, 628, 640, 650, 657]}
      />
      <MetricTile
        label="Programas OTEC activos"
        value={cursos + diplomados}
        trend="stable"
        suffix={`${cursos} cursos · ${diplomados} diplomados`}
        color="#10B981"
        sparkline={[3, 4, 4, 5, 5, 4, cursos + diplomados]}
      />
      <MetricTile
        label="Progreso CNA global"
        value={`${overall}%`}
        trend={overall >= 50 ? 'up' : 'down'}
        suffix="Meta: acreditación 2027"
        color="#F59E0B"
        sparkline={[20, 25, 30, 35, 38, 42, overall]}
        href="/cna"
      />
      <MetricTile
        label="Balance mensual"
        value={`$${balanceM.toFixed(0)}M`}
        trend={Number(balance) > 0 ? 'up' : 'down'}
        suffix="CLP Mar 2025"
        color={Number(balance) > 0 ? '#22C55E' : '#EF4444'}
        sparkline={[8, 10, 12, 9, 11, 14, balanceM]}
      />
    </div>
  );
}
