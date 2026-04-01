import { memo, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database, AlertTriangle, Play } from 'lucide-react';
import { toast } from 'sonner';

function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return 'hace <1h';
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

interface FeedEvent {
  id: string;
  timestamp: string;
  agentCode: string;
  agentColor: string;
  action: string;
  result: string;
  type: 'execution' | 'alert' | 'rag_indexed';
}

function FeedItem({ ev }: { ev: FeedEvent }) {
  const icon = ev.type === 'rag_indexed'
    ? <Database size={10} className="text-blue-400" />
    : ev.type === 'alert'
    ? <AlertTriangle size={10} className="text-destructive" />
    : <Play size={10} className="text-muted-foreground" />;

  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <div className="mt-1.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold" style={{ color: ev.agentColor }}>
            {ev.agentCode}
          </span>
          <span className="text-xs text-foreground truncate">{ev.action}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{timeAgo(ev.timestamp)}</span>
      </div>
      <span className={`text-[9px] font-mono shrink-0 ${
        ev.result === 'Error' || ev.result === 'Crítico' ? 'text-destructive'
          : ev.result === 'Indexado' ? 'text-blue-400'
          : 'text-muted-foreground'
      }`}>
        {ev.result}
      </span>
    </div>
  );
}

const MemoFeedItem = memo(FeedItem);

export function ActivityFeedLive() {
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ['activity_feed'],
    queryFn: async () => {
      const [{ data: executions }, { data: alerts }, { data: ragDocs }, { data: agents }] = await Promise.all([
        supabase.from('executions').select('id, status, started_at, items_processed, agent_id').order('started_at', { ascending: false }).limit(8),
        supabase.from('alerts').select('id, title, priority, created_at, agent_id, resolved').order('created_at', { ascending: false }).limit(5),
        supabase.from('rag_documents').select('id, titulo, created_at, agent_id').order('created_at', { ascending: false }).limit(5),
        supabase.from('agents').select('id, code, color'),
      ]);

      const agentMap: Record<string, { code: string; color: string }> = {};
      (agents || []).forEach((a: any) => { agentMap[a.id] = { code: a.code, color: a.color }; });

      const feedEvents: FeedEvent[] = [];

      (executions || []).forEach((e: any) => {
        const agent = agentMap[e.agent_id] || { code: '??', color: '#6B7280' };
        feedEvents.push({
          id: `exec-${e.id}`,
          timestamp: e.started_at,
          agentCode: agent.code,
          agentColor: agent.color,
          action: e.status === 'success' ? `Procesó ${e.items_processed || 0} items` : 'Error en ejecución',
          result: e.status === 'success' ? 'Éxito' : 'Error',
          type: 'execution',
        });
      });

      (alerts || []).forEach((a: any) => {
        const agent = agentMap[a.agent_id] || { code: '??', color: '#EF4444' };
        feedEvents.push({
          id: `alert-${a.id}`,
          timestamp: a.created_at,
          agentCode: agent.code,
          agentColor: a.priority === 'critica' ? '#EF4444' : agent.color,
          action: `Alerta: ${a.title}`,
          result: a.resolved ? 'Resuelta' : a.priority === 'critica' ? 'Crítico' : 'Pendiente',
          type: 'alert',
        });
      });

      (ragDocs || []).forEach((d: any) => {
        const agent = agentMap[d.agent_id] || { code: 'RAG', color: '#3B82F6' };
        feedEvents.push({
          id: `rag-${d.id}`,
          timestamp: d.created_at,
          agentCode: agent.code,
          agentColor: '#3B82F6',
          action: `Documento indexado: ${d.titulo}`,
          result: 'Indexado',
          type: 'rag_indexed',
        });
      });

      return feedEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 12);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('feed_rag_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rag_documents' }, (payload) => {
        toast.info(`📄 Documento indexado en RAG: ${(payload.new as any).titulo}`);
        queryClient.invalidateQueries({ queryKey: ['activity_feed'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return (
    <div className="rounded-md border border-border bg-card p-4 h-full">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
        Actividad Reciente
      </h3>
      <div className="space-y-0">
        {events.map((ev) => <MemoFeedItem key={ev.id} ev={ev} />)}
        {events.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">Sin actividad reciente</div>
        )}
      </div>
    </div>
  );
}
