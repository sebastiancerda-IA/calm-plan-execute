// Qdrant service — lee de Qdrant vía orchestrator-api (proxy edge function)
// El browser no puede llamar Qdrant directamente por CORS, la edge function actúa de proxy.

const ORCHESTRATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orchestrator-api`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callOrchestrator(action: string, params: Record<string, any> = {}) {
  const res = await fetch(ORCHESTRATOR_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ action, ...params }),
  });
  if (!res.ok) throw new Error(`Orchestrator error: ${res.status}`);
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
    return callOrchestrator("list_qdrant_docs", { limit, ...(categoria ? { categoria } : {}) });
  },

  async getCollectionInfo(): Promise<{ points: number; docs: number }> {
    const data = await callOrchestrator("list_qdrant_docs", { limit: 500 });
    return { points: data.total_chunks || 0, docs: data.total_docs || 0 };
  },
};
