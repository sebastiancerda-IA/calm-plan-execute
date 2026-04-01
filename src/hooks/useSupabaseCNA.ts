import { useQuery } from '@tanstack/react-query';
import { cnaService } from '@/services/supabaseService';
import { useMemo } from 'react';

const dimensionDefs = [
  { id: 'dim1', name: 'I Docencia y resultados del proceso formativo', criteria: ['C1', 'C2', 'C3', 'C4', 'C5'] },
  { id: 'dim2', name: 'II Gestión estratégica y recursos', criteria: ['C6', 'C7', 'C8', 'C9'] },
  { id: 'dim3', name: 'III Aseguramiento interno de la calidad', criteria: ['C10', 'C11', 'C12'] },
  { id: 'dim4', name: 'IV Vinculación con el medio', criteria: ['C13', 'C14', 'C15', 'C16'], obligatoria: true },
];

export function useSupabaseCNA() {
  const { data: criteriaData = [], isLoading } = useQuery({
    queryKey: ['cna_criteria'],
    queryFn: async () => {
      const { data, error } = await cnaService.getAll();
      if (error) throw error;
      return data || [];
    },
  });

  const dimensions = useMemo(() => {
    return dimensionDefs.map((dim) => {
      const criteria = criteriaData
        .filter((c: any) => dim.criteria.includes(c.id))
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          dimension: c.dimension,
          currentLevel: c.current_level,
          targetLevel: c.target_level,
          responsibleAgent: c.responsible_agent,
          evidenceCount: c.evidence_count,
          gap: c.gap_description || '',
          actions: c.actions || [],
          isPriority: c.is_priority,
          isMandatory: c.is_mandatory,
        }));
      const atTarget = criteria.filter((c: any) => c.currentLevel >= c.targetLevel).length;
      const total = criteria.length;
      return {
        ...dim,
        criteria,
        atTarget,
        total,
        percentage: total > 0 ? Math.round((atTarget / total) * 100) : 0,
      };
    });
  }, [criteriaData]);

  const overall = useMemo(() => {
    if (criteriaData.length === 0) return 0;
    const atTarget = criteriaData.filter((c: any) => c.current_level >= c.target_level).length;
    return Math.round((atTarget / criteriaData.length) * 100);
  }, [criteriaData]);

  return { dimensions, overall, criteria: criteriaData, isLoading };
}
