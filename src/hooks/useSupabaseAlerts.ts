import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

export function useSupabaseAlerts() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<{ priority?: string; resolved?: boolean }>({});

  const { data: allAlerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await alertsService.getAll();
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000,
  });

  const alerts = useMemo(() => {
    let result = [...allAlerts];
    if (filter.priority) result = result.filter((a: any) => a.priority === filter.priority);
    if (filter.resolved !== undefined) result = result.filter((a: any) => a.resolved === filter.resolved);
    return result;
  }, [allAlerts, filter]);

  const counts = useMemo(() => ({
    critica: allAlerts.filter((a: any) => a.priority === 'critica' && !a.resolved).length,
    alta: allAlerts.filter((a: any) => a.priority === 'alta' && !a.resolved).length,
    media: allAlerts.filter((a: any) => a.priority === 'media' && !a.resolved).length,
    info: allAlerts.filter((a: any) => a.priority === 'info' && !a.resolved).length,
    total: allAlerts.filter((a: any) => !a.resolved).length,
  }), [allAlerts]);

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await alertsService.resolve(id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      const previous = queryClient.getQueryData(['alerts']);
      queryClient.setQueryData(['alerts'], (old: any[]) =>
        old?.map((a) => a.id === id ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['alerts'], context?.previous);
      toast.error('Error al resolver alerta');
    },
    onSuccess: () => {
      toast.success('Alerta resuelta');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts,
    counts,
    filter,
    setFilter,
    resolveAlert: (id: string) => resolveMutation.mutate(id),
    isLoading,
  };
}
