import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Consolidated: uses the same queryKey as useSupabaseRAG so no duplicate request
export function useRAGCount() {
  const { data: count = 0 } = useQuery({
    queryKey: ['rag_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rag_documents')
        .select('id, fuente, agent_id, chunk_count, titulo, categoria, criterios_cna, fecha, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
    select: (data) => data.length,
  });
  return count;
}
