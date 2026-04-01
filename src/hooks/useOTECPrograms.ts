import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    refetchInterval: 300000,
  });

  const activos = data.filter((p: any) => p.status === 'activo');
  const cursos = activos.filter((p: any) => p.type === 'curso').length;
  const diplomados = activos.filter((p: any) => p.type === 'diplomado').length;
  const totalStudents = activos.reduce((sum: number, p: any) => sum + (p.students_enrolled || 0), 0);
  const totalRevenue = activos.reduce((sum: number, p: any) => sum + Number(p.revenue || 0), 0);

  return {
    programs: data,
    activos,
    cursos,
    diplomados,
    totalStudents,
    totalRevenue,
    isLoading,
  };
}
