import { Agent } from '@/types';
import { mockAgents } from '@/data/mockAgents';

// TODO: Reemplazar con fetch a https://sebastiancerda-ia.app.n8n.cloud/api/v1/
// Requiere header: X-N8N-API-KEY desde variable de entorno

interface N8NService {
  getWorkflows(): Promise<Agent[]>;
  getExecutions(workflowId: string, limit: number): Promise<any[]>;
  triggerWorkflow(workflowId: string): Promise<void>;
}

export const n8nService: N8NService = {
  async getWorkflows() {
    return mockAgents.filter((a) => a.platform === 'n8n');
  },
  async getExecutions(_workflowId: string, limit: number) {
    return Array.from({ length: limit }, (_, i) => ({
      id: `exec-${i}`,
      finished: true,
      startedAt: new Date(Date.now() - i * 6 * 3600000).toISOString(),
      stoppedAt: new Date(Date.now() - i * 6 * 3600000 + 3000).toISOString(),
      status: 'success',
      itemsProcessed: Math.floor(Math.random() * 10) + 1,
    }));
  },
  async triggerWorkflow(_workflowId: string) {
    console.log('Mock: workflow triggered');
  },
};
