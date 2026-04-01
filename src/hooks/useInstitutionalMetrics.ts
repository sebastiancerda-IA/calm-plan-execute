import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export function useInstitutionalMetrics() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['institutional_metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutional_metrics')
        .select('*')
        .order('period', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
    refetchInterval: 300000,
  });

  const result = useMemo(() => {
    const latest = (key: string) => {
      const row = data.find((m: any) => m.metric_key === key);
      return row?.metric_value ?? 0;
    };
    return {
      matriculasNuevas: latest('matriculas_nuevas'),
      matriculasAntiguas: latest('matriculas_antiguas'),
      matriculasTotal: latest('matriculas_total'),
      tasaRetencion: latest('tasa_retencion'),
      tasaTitulacion: latest('tasa_titulacion'),
      tasaEmpleabilidad: latest('tasa_empleabilidad'),
      ingresosMensual: latest('ingresos_mensual'),
      gastosMensual: latest('gastos_mensual'),
      balance: latest('balance'),
    };
  }, [data]);

  return { ...result, isLoading, raw: data };
}
