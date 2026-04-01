import { useQuery } from '@tanstack/react-query';
import { agentsService } from '@/services/supabaseService';

export function useSupabaseAgents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await agentsService.getAll();
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 300000,
  });

  const agents = data || [];
  const operativos = agents.filter((a: any) => a.status === 'operativo').length;

  return { agents, operativos, total: agents.length, isLoading, error };
}
