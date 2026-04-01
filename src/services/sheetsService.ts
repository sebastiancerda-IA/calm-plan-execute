import { supabase } from '@/integrations/supabase/client';

// Datos reales desde Supabase — n8n sincroniza Sheets → email_logs y otec_programs

interface SheetsService {
  getRecentEmails(agente: string, limit: number): Promise<any[]>;
  getMetrics(): Promise<Record<string, number>>;
}

export const sheetsService: SheetsService = {
  async getRecentEmails(agente: string, limit: number) {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('agent_id', agente)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('sheetsService.getRecentEmails error:', error);
      return [];
    }
    return data || [];
  },
  async getMetrics() {
    const { count: totalEmails } = await supabase
      .from('email_logs')
      .select('id', { count: 'exact', head: true });

    const { count: accionRequerida } = await supabase
      .from('email_logs')
      .select('id', { count: 'exact', head: true })
      .eq('accion_requerida', true);

    const { count: criticas } = await supabase
      .from('email_logs')
      .select('id', { count: 'exact', head: true })
      .eq('prioridad', 'critica');

    return {
      totalEmails: totalEmails || 0,
      accionRequerida: accionRequerida || 0,
      criticas: criticas || 0,
    };
  },
};
