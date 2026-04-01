import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { useSupabaseAlerts } from '@/hooks/useSupabaseAlerts';
import { useSupabaseRAG } from '@/hooks/useSupabaseRAG';
import { emailLogsService } from '@/services/supabaseService';
import { MetricTile } from '@/components/shared/MetricTile';
import { useQuery } from '@tanstack/react-query';

export function GlobalMetrics() {
  const { operativos, total } = useSupabaseAgents();
  const { counts } = useSupabaseAlerts();
  const { stats } = useSupabaseRAG();

  const { data: emailCount = 0 } = useQuery({
    queryKey: ['emails_24h'],
    queryFn: async () => {
      const { count, error } = await emailLogsService.getCount24h();
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 300000,
  });

  const jinaPercent = stats.jinaTokensLimit > 0
    ? ((Number(stats.jinaTokensUsed) / stats.jinaTokensLimit) * 100).toFixed(2)
    : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricTile
        label="Agentes operativos"
        value={`${operativos}/${total}`}
        trend="stable"
        color="#22C55E"
        sparkline={[2, 3, 3, 4, 4, 4, 4]}
        href="/agents"
      />
      <MetricTile
        label="Emails procesados 24h"
        value={emailCount}
        trend="up"
        color="#E8734A"
        sparkline={[5, 8, 6, 10, 9, 11, 13]}
        href="/agent/a1-vcm"
      />
      <MetricTile
        label="Alertas activas"
        value={counts.total}
        trend="up"
        suffix={counts.critica > 0 ? `(${counts.critica} críticas)` : undefined}
        color="#EF4444"
        sparkline={[3, 4, 3, 5, 4, 5, 5]}
        href="/alerts"
      />
      <MetricTile
        label="Base de conocimiento"
        value={`${stats.totalDocuments} docs`}
        trend="up"
        suffix={`${jinaPercent}% Jina`}
        color="#3B82F6"
        sparkline={[30, 35, 38, 42, 45, 48, 51]}
        href="/rag"
      />
    </div>
  );
}
