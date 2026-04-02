import { useQuery } from '@tanstack/react-query';
import { qdrantService } from '@/services/qdrantService';
import { useMemo } from 'react';

// Lee documentos directamente de Qdrant — sin pasar por tabla rag_documents de Supabase
export function useSupabaseRAG() {
  const { data: qdrantData, isLoading } = useQuery({
    queryKey: ['qdrant_documents'],
    queryFn: () => qdrantService.listDocuments(500),
    staleTime: 60000,
    retry: 2,
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
      jinaTokensUsed: totalChunks * 150, // estimado
      jinaTokensLimit: 1000000,
      agentDistribution: byCategoria,
      lastIndexed: documents[0]?.fecha || '',
    };
  }, [documents, qdrantData]);

  return { documents, stats, isLoading };
}
