import { useQuery } from '@tanstack/react-query';
import { ragService, systemMetricsService } from '@/services/supabaseService';
import { useMemo } from 'react';

export function useSupabaseRAG() {
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['rag_documents'],
    queryFn: async () => {
      const { data, error } = await ragService.getDocuments(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['system_metrics'],
    queryFn: async () => {
      const { data, error } = await systemMetricsService.getAll();
      if (error) throw error;
      return data || [];
    },
  });

  const stats = useMemo(() => {
    const getMetric = (name: string) => metrics.find((m: any) => m.metric_name === name);
    const totalDocs = documents.length;
    const gmailDocs = documents.filter((d: any) => d.fuente === 'gmail').length;
    const driveDocs = documents.filter((d: any) => d.fuente === 'drive').length;

    // Agent distribution
    const agentDist: Record<string, number> = {};
    documents.forEach((d: any) => {
      const key = d.agent_id || 'unknown';
      agentDist[key] = (agentDist[key] || 0) + 1;
    });

    return {
      totalDocuments: totalDocs,
      totalPoints: getMetric('qdrant_total_points')?.metric_value || totalDocs,
      sources: { gmail: gmailDocs, drive: driveDocs, manual: 0 },
      jinaTokensUsed: getMetric('jina_tokens_used')?.metric_value || 3700,
      jinaTokensLimit: 1000000,
      agentDistribution: agentDist,
      lastIndexed: documents[0]?.created_at || '',
    };
  }, [documents, metrics]);

  return { documents, stats, isLoading: docsLoading };
}
