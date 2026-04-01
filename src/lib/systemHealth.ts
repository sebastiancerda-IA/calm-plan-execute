import { supabase } from '@/integrations/supabase/client';

export interface SystemHealth {
  version: string;
  features: string[];
  tables: Record<string, 'populated' | 'empty' | 'unknown'>;
  edgeFunctions: string[];
  uiComponents: number;
  lastCheck: string;
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const tableNames = [
    'agents', 'alerts', 'executions', 'rag_documents', 'cna_criteria',
    'agent_tasks', 'convenios', 'financial_records', 'institutional_metrics',
    'otec_programs', 'acreditation_documents', 'email_logs', 'profiles',
    'notifications', 'audit_log', 'system_metrics',
  ] as const;

  const tables: Record<string, 'populated' | 'empty' | 'unknown'> = {};

  await Promise.all(
    tableNames.map(async (t) => {
      try {
        const { count } = await supabase.from(t).select('id', { count: 'exact', head: true });
        tables[t] = (count && count > 0) ? 'populated' : 'empty';
      } catch {
        tables[t] = 'unknown';
      }
    })
  );

  return {
    version: '2.4.0',
    features: [
      'pwa', 'dark-mode', 'light-mode', 'glass-morphism',
      'financial-advisor', 'cna-advisor', 'acreditation-advisor',
      'model-selector', 'csv-export', 'audit-log', 'in-app-notifications',
      'realtime-rag', 'convenios-templates', 'rbac', 'mobile-nav',
      'orchestrator-api', 'n8n-bridge', 'dashboard-analytics',
    ],
    tables,
    edgeFunctions: [
      'orchestrator-api', 'financial-advisor', 'cna-advisor',
      'acreditation-advisor', 'process-document', 'n8n-webhook',
    ],
    uiComponents: 45,
    lastCheck: new Date().toISOString(),
  };
}
