import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRAGCount() {
  const { data: count = 0 } = useQuery({
    queryKey: ['rag_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('rag_documents')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });
  return count;
}
