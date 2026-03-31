import { useMemo } from 'react';
import { mockCriteria, cnaDimensions } from '@/data/mockCNA';

export function useCNAProgress() {
  const progress = useMemo(() => {
    return cnaDimensions.map((dim) => {
      const criteria = mockCriteria.filter((c) => dim.criteria.includes(c.id));
      const atTarget = criteria.filter((c) => c.currentLevel >= c.targetLevel).length;
      const total = criteria.length;
      return {
        ...dim,
        criteria,
        atTarget,
        total,
        percentage: Math.round((atTarget / total) * 100),
      };
    });
  }, []);

  const overall = useMemo(() => {
    const atTarget = mockCriteria.filter((c) => c.currentLevel >= c.targetLevel).length;
    return Math.round((atTarget / mockCriteria.length) * 100);
  }, []);

  return { dimensions: progress, overall, criteria: mockCriteria };
}
