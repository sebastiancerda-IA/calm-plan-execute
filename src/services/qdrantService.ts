import { RAGDocument } from '@/types';
import { mockDocuments, ragStats } from '@/data/mockRAG';

// TODO: Conectar a https://qdrant-production-e4a5.up.railway.app
// Collection: idma_knowledge

interface QdrantService {
  getCollectionInfo(): Promise<{ points: number; vectors: number }>;
  search(query: string, topK: number): Promise<RAGDocument[]>;
}

export const qdrantService: QdrantService = {
  async getCollectionInfo() {
    return { points: ragStats.totalPoints, vectors: ragStats.totalPoints * 4 };
  },
  async search(query: string, topK: number) {
    const q = query.toLowerCase();
    return mockDocuments
      .map((doc) => ({
        ...doc,
        score: doc.titulo.toLowerCase().includes(q) ? 0.85 + Math.random() * 0.15 : 0.3 + Math.random() * 0.4,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, topK);
  },
};
