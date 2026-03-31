import { ClassifiedEmail } from '@/types';
import { mockEmails } from '@/data/mockEmails';

// TODO: Conectar via Google Sheets API
// VCM Log: 1RQqDIdvGRiCQQMAq_5WyZIkIEndu0yXWkzHAtJmHrX0
// OTEC Log: 10tUOdcfA_4k8GHDL0yaVXIxG6sGx2j9S8iB4AHYSHUE

interface SheetsService {
  getRecentEmails(agente: string, limit: number): Promise<ClassifiedEmail[]>;
  getMetrics(): Promise<Record<string, number>>;
}

export const sheetsService: SheetsService = {
  async getRecentEmails(agente: string, limit: number) {
    return mockEmails.filter((e) => e.agente === agente).slice(0, limit);
  },
  async getMetrics() {
    return {
      totalEmails: mockEmails.length,
      accionRequerida: mockEmails.filter((e) => e.accion_requerida).length,
      criticas: mockEmails.filter((e) => e.prioridad === 'critica').length,
    };
  },
};
