import { supabase } from '@/integrations/supabase/client';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabaseRuntime';

// Qdrant service — lee de Qdrant vía orchestrator-api (proxy edge function)
// El browser no puede llamar Qdrant directamente por CORS, la edge function actúa de proxy.

async function callOrchestrator(action: string, params: Record<string, any> = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error('No active session');
  }

  const orchestratorUrl = `${getSupabaseUrl()}/functions/v1/orchestrator-api`;

  const res = await fetch(orchestratorUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: getSupabasePublishableKey(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action, ...params }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Orchestrator error: ${res.status}${message ? ` - ${message}` : ''}`);
  }

  return res.json();
}

export interface RagDocument {
  id: string;
  titulo: string;
  fuente: string;
  categoria: string;
  criterios_cna: string[];
  chunk_count: number;
  fecha: string;
}

export const qdrantService = {
  async listDocuments(limit = 500, categoria?: string): Promise<{ documents: RagDocument[]; total_chunks: number; total_docs: number }> {
    return callOrchestrator('list_qdrant_docs', { limit, ...(categoria ? { categoria } : {}) });
  },

  async getCollectionInfo(): Promise<{ points: number; docs: number }> {
    const data = await callOrchestrator('list_qdrant_docs', { limit: 500 });
    return { points: data.total_chunks || 0, docs: data.total_docs || 0 };
  },
};
