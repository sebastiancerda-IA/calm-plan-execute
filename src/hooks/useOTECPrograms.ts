import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export function useOTECPrograms() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['otec_programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('otec_programs')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
    refetchInterval: 300000,
  });

  const computed = useMemo(() => {
    const activos = data.filter((p: any) => p.status === 'activo');
    return {
      activos,
      cursos: activos.filter((p: any) => p.type === 'curso').length,
      diplomados: activos.filter((p: any) => p.type === 'diplomado').length,
      totalStudents: activos.reduce((sum: number, p: any) => sum + (p.students_enrolled || 0), 0),
      totalRevenue: activos.reduce((sum: number, p: any) => sum + Number(p.revenue || 0), 0),
    };
  }, [data]);

  return { programs: data, ...computed, isLoading };
}
