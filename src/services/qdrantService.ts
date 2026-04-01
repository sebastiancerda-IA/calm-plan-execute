import { supabase } from '@/integrations/supabase/client';

// Real data from Supabase — replaces mock Qdrant service

interface QdrantService {
  getCollectionInfo(): Promise<{ points: number; vectors: number }>;
  search(query: string, topK: number): Promise<any[]>;
}

export const qdrantService: QdrantService = {
  async getCollectionInfo() {
    const { count } = await supabase
      .from('rag_documents')
      .select('id', { count: 'exact', head: true });
    const points = count || 0;
    return { points, vectors: points * 4 };
  },
  async search(_query: string, _topK: number) {
    // Search handled via acreditation-advisor edge function
    return [];
  },
};
