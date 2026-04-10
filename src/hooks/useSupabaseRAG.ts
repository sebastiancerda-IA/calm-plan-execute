import { useQuery } from '@tanstack/react-query';
import { qdrantService } from '@/services/qdrantService';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Lee documentos directamente de Qdrant — sin pasar por tabla rag_documents de Supabase
export function useSupabaseRAG() {
  const { session } = useAuth();

  const { data: qdrantData, isLoading } = useQuery({
    queryKey: ['qdrant_documents'],
    queryFn: () => qdrantService.listDocuments(200),
    staleTime: 300000,
    retry: 0,
    refetchOnWindowFocus: false,
    enabled: !!session,
  });

  const documents = qdrantData?.documents || [];

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalChunks = qdrantData?.total_chunks || 0;
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
  }, [documents, qdrantData]);

  return { documents, stats, isLoading };
}

