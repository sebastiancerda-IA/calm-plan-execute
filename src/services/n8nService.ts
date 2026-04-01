import { Agent } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Real data from Supabase — agents table populated via n8n-webhook

interface N8NService {
  getWorkflows(): Promise<any[]>;
  getExecutions(workflowId: string, limit: number): Promise<any[]>;
  triggerWorkflow(workflowId: string): Promise<void>;
}

export const n8nService: N8NService = {
  async getWorkflows() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('platform', 'n8n');
    if (error) {
      console.error('n8nService.getWorkflows error:', error);
      return [];
    }
    return data || [];
  },
  async getExecutions(agentId: string, limit: number) {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('n8nService.getExecutions error:', error);
      return [];
    }
    return data || [];
  },
  async triggerWorkflow(_workflowId: string) {
    // Will be implemented via orchestrator-api or n8n MCP
    console.log('Trigger workflow — use orchestrator-api');
  },
};
