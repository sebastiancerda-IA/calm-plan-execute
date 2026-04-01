import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useAlerts } from '@/hooks/useAlerts';
import { mockEmails } from '@/data/mockEmails';
import { ragStats } from '@/data/mockRAG';
import { MetricTile } from '@/components/shared/MetricTile';

export function GlobalMetrics() {
  const { operativos, total } = useAgentStatus();
  const { counts } = useAlerts();
  const emails24h = mockEmails.filter((e) => {
    const diff = Date.now() - new Date(e.fecha).getTime();
    return diff < 24 * 3600000;
  }).length;

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
        value={emails24h}
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
        value={`${ragStats.totalDocuments} docs`}
        trend="up"
        suffix={`${((ragStats.jinaTokensUsed / ragStats.jinaTokensLimit) * 100).toFixed(2)}% Jina`}
        color="#3B82F6"
        sparkline={[30, 35, 38, 42, 45, 48, 51]}
        href="/rag"
      />
    </div>
  );
}
