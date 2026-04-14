import { useState } from 'react';
import { Play, RefreshCw, FileText, Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ActionStatus = 'idle' | 'running' | 'success' | 'error';
type CnaCriteriaRow = Database['public']['Tables']['cna_criteria']['Row'];

interface Action {
  id: string;
  label: string;
  description: string;
  icon: typeof Play;
  color: string;
}

const actions: Action[] = [
  { id: 'classify-emails', label: 'Clasificar emails', description: 'Forzar clasificacion A1/C1', icon: Play, color: '#E8734A' },
  { id: 'reindex-rag', label: 'Re-indexar RAG', description: 'Ejecutar indexacion A3', icon: RefreshCw, color: '#3B82F6' },
  { id: 'generate-briefing', label: 'Generar briefing', description: 'Resumen diario con IA', icon: FileText, color: '#8B5CF6' },
  { id: 'export-cna', label: 'Exportar CNA', description: 'Descargar estado CSV', icon: Download, color: '#10B981' },
];

export function ActionCenter() {
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>({});

  const executeAction = async (actionId: string) => {
    setStatuses((s) => ({ ...s, [actionId]: 'running' }));

    try {
      if (actionId === 'export-cna') {
        const { data } = await supabase.from('cna_criteria').select('*').order('id');
        if (data) {
          const headers = ['ID', 'Nombre', 'Dimension', 'Nivel Actual', 'Nivel Meta', 'Evidencias', 'Brecha'];
          const rows = (data as CnaCriteriaRow[]).map((c) => [
            c.id,
            c.name,
            c.dimension,
            c.current_level,
            c.target_level,
            c.evidence_count,
            c.gap_description,
          ]);
          const csv = [headers, ...rows]
            .map((r) => r.map((v) => `"${v ?? ''}"`).join(','))
            .join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cna_estado_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          setStatuses((s) => ({ ...s, [actionId]: 'success' }));
          toast.success('CSV exportado');
        }
      } else {
        const { data, error } = await supabase.functions.invoke('orchestrator-api', {
          body: { action: 'run_operational_action', action_id: actionId },
        });
        if (error) throw error;

        const description = typeof data?.message === 'string' ? data.message : 'Listo';
        toast.success('Accion ejecutada', { description });
        setStatuses((s) => ({ ...s, [actionId]: 'success' }));
      }
    } catch {
      setStatuses((s) => ({ ...s, [actionId]: 'error' }));
      toast.error('Error al ejecutar accion');
    }

    setTimeout(() => setStatuses((s) => ({ ...s, [actionId]: 'idle' })), 3000);
  };

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
        Centro de Acciones
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const status = statuses[action.id] || 'idle';
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => executeAction(action.id)}
              disabled={status === 'running'}
              className="flex items-center gap-2 p-2.5 rounded border border-border bg-secondary/50 hover:bg-secondary transition-colors text-left disabled:opacity-50"
            >
              <div
                className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${action.color}20` }}
              >
                {status === 'running' ? (
                  <Loader2 size={14} className="animate-spin" style={{ color: action.color }} />
                ) : status === 'success' ? (
                  <CheckCircle2 size={14} className="text-green-500" />
                ) : status === 'error' ? (
                  <XCircle size={14} className="text-destructive" />
                ) : (
                  <Icon size={14} style={{ color: action.color }} />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-foreground truncate">{action.label}</div>
                <div className="text-[9px] text-muted-foreground truncate">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
