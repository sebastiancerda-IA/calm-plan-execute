import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function dayAgoIso() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

export function useOrquestaLiveOverlay() {
  const conveniosQuery = useQuery({
    queryKey: ['orquesta-live-convenios-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('convenios').select('id', { count: 'exact', head: true });
      if (error) return null;
      return count ?? 0;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const conveniosConLinkQuery = useQuery({
    queryKey: ['orquesta-live-convenios-links'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('convenios')
        .select('id', { count: 'exact', head: true })
        .not('archivo_drive_url', 'is', null);
      if (error) return null;
      return count ?? 0;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const cnaQuery = useQuery({
    queryKey: ['orquesta-live-cna-levels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cna_criteria').select('id,current_level');
      if (error) return null;
      return data ?? [];
    },
    staleTime: 120_000,
    refetchInterval: 180_000,
  });

  const email24hQuery = useQuery({
    queryKey: ['orquesta-live-email-24h'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('id,prioridad,categoria,created_at,fecha')
        .gte('created_at', dayAgoIso())
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) return null;
      return data ?? [];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const agentsQuery = useQuery({
    queryKey: ['orquesta-live-agents-activity'],
    queryFn: async () => {
      const { data, error } = await supabase.from('agents').select('code,items_processed_24h,status');
      if (error) return null;
      return data ?? [];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const ragDocsQuery = useQuery({
    queryKey: ['orquesta-live-rag-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('rag_documents').select('id', { count: 'exact', head: true });
      if (error) return null;
      return count ?? 0;
    },
    staleTime: 120_000,
    refetchInterval: 180_000,
  });

  const institutionalMetricsQuery = useQuery({
    queryKey: ['orquesta-live-institutional-balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutional_metrics')
        .select('metric_key,metric_value')
        .in('metric_key', ['ingresos_mensual', 'gastos_mensual', 'balance']);
      if (error) return null;
      return data ?? [];
    },
    staleTime: 120_000,
    refetchInterval: 180_000,
  });

  const live = useMemo(() => {
    const cnaLevels = cnaQuery.data ?? [];
    const n3 = cnaLevels.filter((c: any) => c.current_level === 'N3').length;
    const n2 = cnaLevels.filter((c: any) => c.current_level === 'N2').length;
    const n1 = cnaLevels.filter((c: any) => c.current_level === 'N1').length;

    const email = email24hQuery.data ?? [];
    const urgent24h = email.filter((e: any) => ['alta', 'critica'].includes((e.prioridad || '').toLowerCase())).length;

    const agents = agentsQuery.data ?? [];
    const agentsProcessed24h = agents.reduce((sum: number, a: any) => sum + (a.items_processed_24h || 0), 0);
    const activeAgents = agents.filter((a: any) => (a.status || '').toLowerCase() === 'active').length;

    const institutional = institutionalMetricsQuery.data ?? [];
    const map = new Map<string, number>();
    institutional.forEach((m: any) => map.set(m.metric_key, Number(m.metric_value || 0)));

    return {
      conveniosCount: conveniosQuery.data,
      conveniosConLink: conveniosConLinkQuery.data,
      cnaN3: n3,
      cnaN2: n2,
      cnaN1: n1,
      cnaTotal: cnaLevels.length,
      emails24h: email.length,
      urgent24h,
      agentsProcessed24h,
      activeAgents,
      ragDocs: ragDocsQuery.data,
      ingresosMensual: map.get('ingresos_mensual') ?? null,
      gastosMensual: map.get('gastos_mensual') ?? null,
      balanceMensual: map.get('balance') ?? null,
    };
  }, [cnaQuery.data, email24hQuery.data, agentsQuery.data, ragDocsQuery.data, conveniosQuery.data, conveniosConLinkQuery.data, institutionalMetricsQuery.data]);

  const hasAnyLiveData = [
    live.conveniosCount,
    live.cnaTotal,
    live.emails24h,
    live.ragDocs,
    live.balanceMensual,
  ].some((v) => v !== null && v !== undefined && v !== 0);

  return {
    live,
    hasAnyLiveData,
    loading:
      conveniosQuery.isLoading ||
      conveniosConLinkQuery.isLoading ||
      cnaQuery.isLoading ||
      email24hQuery.isLoading ||
      agentsQuery.isLoading ||
      ragDocsQuery.isLoading ||
      institutionalMetricsQuery.isLoading,
  };
}
