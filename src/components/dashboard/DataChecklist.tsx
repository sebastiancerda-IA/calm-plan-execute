import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checkFn: (docs: any[], metrics: any[], otec: any[]) => boolean;
  link: string;
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: 'informe_anterior',
    label: 'Informe acreditación anterior',
    description: 'PDF del informe de la acreditación pasada',
    checkFn: (docs) => docs.some((d) => d.document_type === 'informe_anterior'),
    link: '/acreditacion',
  },
  {
    id: 'avance_actual',
    label: 'Avance actual con asesores',
    description: 'Carpeta de trabajo actualizada con asesores',
    checkFn: (docs) => docs.some((d) => d.document_type === 'avance_actual'),
    link: '/acreditacion',
  },
  {
    id: 'matriculas',
    label: 'Datos de matrículas actualizados',
    description: 'Matrículas nuevas y antiguas 2025',
    checkFn: (_, metrics) => metrics.some((m) => m.metric_key === 'matriculas_total'),
    link: '/settings',
  },
  {
    id: 'balance',
    label: 'Balance financiero Q1 2025',
    description: 'Ingresos y gastos del primer trimestre',
    checkFn: (_, metrics) => metrics.some((m) => m.metric_key === 'balance'),
    link: '/settings',
  },
  {
    id: 'otec',
    label: 'Cursos OTEC activos cargados',
    description: 'Listado de cursos y diplomados SENCE',
    checkFn: (_, __, otec) => otec.length >= 3,
    link: '/settings',
  },
];

export function DataChecklist() {
  // Single combined query instead of 3 separate ones
  const { data } = useQuery({
    queryKey: ['checklist_combined'],
    queryFn: async () => {
      const [docsRes, metricsRes, otecRes] = await Promise.all([
        supabase.from('acreditation_documents').select('document_type'),
        supabase.from('institutional_metrics').select('metric_key'),
        supabase.from('otec_programs').select('id').eq('status', 'activo'),
      ]);
      return {
        docs: docsRes.data || [],
        metrics: metricsRes.data || [],
        otec: otecRes.data || [],
      };
    },
    staleTime: 120000,
  });

  const { docs = [], metrics = [], otec = [] } = data || {};

  const completed = useMemo(
    () => CHECKLIST.filter((item) => item.checkFn(docs, metrics, otec)).length,
    [docs, metrics, otec]
  );

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Checklist de Carga
        </h3>
        <span className="text-xs font-mono text-primary">{completed}/{CHECKLIST.length}</span>
      </div>
      <div className="space-y-2">
        {CHECKLIST.map((item) => {
          const done = item.checkFn(docs, metrics, otec);
          return (
            <Link
              key={item.id}
              to={item.link}
              className={`flex items-center gap-2 p-2 rounded border border-border transition-colors ${
                done ? 'bg-secondary/30 opacity-60' : 'hover:bg-secondary/50'
              }`}
            >
              {done ? (
                <Check size={14} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={14} className="text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
              </div>
              {!done && <ArrowRight size={12} className="text-muted-foreground shrink-0" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
