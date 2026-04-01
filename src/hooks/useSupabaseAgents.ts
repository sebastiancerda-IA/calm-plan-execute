import { useQuery } from '@tanstack/react-query';
import { agentsService } from '@/services/supabaseService';
import { useMemo } from 'react';

export function useSupabaseAgents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await agentsService.getAll();
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
    refetchInterval: 300000,
  });

  const agents = data || [];

  const { operativos, total } = useMemo(() => ({
    operativos: agents.filter((a: any) => a.status === 'operativo').length,
    total: agents.length,
  }), [agents]);

  return { agents, operativos, total, isLoading, error };
}
