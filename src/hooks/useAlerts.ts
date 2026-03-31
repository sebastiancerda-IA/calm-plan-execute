import { useState, useMemo } from 'react';
import { mockAlerts } from '@/data/mockAlerts';
import { Priority } from '@/types';

export function useAlerts() {
  const [filter, setFilter] = useState<{ priority?: Priority; resolved?: boolean; source?: string }>({});

  const alerts = useMemo(() => {
    let result = [...mockAlerts];
    if (filter.priority) result = result.filter((a) => a.priority === filter.priority);
    if (filter.resolved !== undefined) result = result.filter((a) => a.resolved === filter.resolved);
    if (filter.source) result = result.filter((a) => a.source === filter.source);
    return result;
  }, [filter]);

  const counts = useMemo(() => ({
    critica: mockAlerts.filter((a) => a.priority === 'critica' && !a.resolved).length,
    alta: mockAlerts.filter((a) => a.priority === 'alta' && !a.resolved).length,
    media: mockAlerts.filter((a) => a.priority === 'media' && !a.resolved).length,
    info: mockAlerts.filter((a) => a.priority === 'info' && !a.resolved).length,
    total: mockAlerts.filter((a) => !a.resolved).length,
  }), []);

  return { alerts, counts, filter, setFilter };
}
