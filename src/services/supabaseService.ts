import { supabase } from '@/integrations/supabase/client';

export const agentsService = {
  getAll: () => supabase.from('agents').select('*').order('code'),
  getById: (id: string) => supabase.from('agents').select('*').eq('id', id).single(),
  updateStatus: (id: string, status: string) =>
    supabase.from('agents').update({ status, updated_at: new Date().toISOString() }).eq('id', id),
};

export const emailLogsService = {
  getRecent: (agentId?: string, limit = 20) => {
    let q = supabase.from('email_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (agentId) q = q.eq('agent_id', agentId);
    return q;
  },
  getCount24h: () =>
    supabase
      .from('email_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
};

export const alertsService = {
  getAll: () =>
    supabase.from('alerts').select('*').order('created_at', { ascending: false }),
  getActive: () =>
    supabase.from('alerts').select('*').eq('resolved', false).order('created_at', { ascending: false }),
  resolve: (id: string) =>
    supabase.from('alerts').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id),
};

export const executionsService = {
  getByAgent: (agentId: string, limit = 10) =>
    supabase.from('executions').select('*').eq('agent_id', agentId).order('created_at', { ascending: false }).limit(limit),
};

export const cnaService = {
  getAll: () => supabase.from('cna_criteria').select('*').order('id'),
  updateLevel: (id: string, level: string) =>
    supabase.from('cna_criteria').update({ current_level: level, updated_at: new Date().toISOString() }).eq('id', id),
};

export const ragService = {
  getDocuments: (limit = 50) =>
    supabase.from('rag_documents').select('*').order('created_at', { ascending: false }).limit(limit),
  getStats: () =>
    supabase.from('rag_documents').select('fuente, agent_id, chunk_count'),
};

export const systemMetricsService = {
  getAll: () => supabase.from('system_metrics').select('*'),
};
