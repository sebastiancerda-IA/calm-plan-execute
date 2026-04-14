import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface RagDocument {
  id: string;
  titulo: string;
  fuente: string;
  categoria: string;
  criterios_cna: string[];
  chunk_count: number;
  fecha: string;
}

export function useSupabaseRAG() {
  const { session } = useAuth();

  const { data: rawDocs = [], isLoading } = useQuery({
    queryKey: ['rag_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rag_documents')
        .select('id, titulo, fuente, categoria, criterios_cna, chunk_count, fecha')
        .order('fecha', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as RagDocument[];
    },
    staleTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!session,
  });

  const documents = rawDocs;

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
    const driveDocs = documents.filter((d) => d.fuente === 'drive').length;
    const gmailDocs = documents.filter((d) => d.fuente === 'gmail').length;

    const byCategoria: Record<string, number> = {};
    documents.forEach((d) => {
      const k = d.categoria || 'general';
      byCategoria[k] = (byCategoria[k] || 0) + 1;
    });

    return {
      totalDocuments: totalDocs,
      totalPoints: totalChunks,
      sources: { gmail: gmailDocs, drive: driveDocs, manual: totalDocs - driveDocs - gmailDocs },
      jinaTokensUsed: totalChunks * 150,
      jinaTokensLimit: 1000000,
      agentDistribution: byCategoria,
      lastIndexed: documents[0]?.fecha || '',
    };
  }, [documents]);

  return { documents, stats, isLoading };
}
