import { useState, useMemo, useCallback } from 'react';
import { mockAlerts } from '@/data/mockAlerts';
import { Priority } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'idma-resolved-alerts';

function getResolvedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useAlerts() {
  const [resolvedIds, setResolvedIds] = useState<string[]>(getResolvedIds);
  const [filter, setFilter] = useState<{ priority?: Priority; resolved?: boolean; source?: string }>({});

  const alertsWithState = useMemo(
    () => mockAlerts.map((a) => ({
      ...a,
      resolved: a.resolved || resolvedIds.includes(a.id),
    })),
    [resolvedIds]
  );

  const alerts = useMemo(() => {
    let result = [...alertsWithState];
    if (filter.priority) result = result.filter((a) => a.priority === filter.priority);
    if (filter.resolved !== undefined) result = result.filter((a) => a.resolved === filter.resolved);
    if (filter.source) result = result.filter((a) => a.source === filter.source);
    return result;
  }, [filter, alertsWithState]);

  const counts = useMemo(() => ({
    critica: alertsWithState.filter((a) => a.priority === 'critica' && !a.resolved).length,
    alta: alertsWithState.filter((a) => a.priority === 'alta' && !a.resolved).length,
    media: alertsWithState.filter((a) => a.priority === 'media' && !a.resolved).length,
    info: alertsWithState.filter((a) => a.priority === 'info' && !a.resolved).length,
    total: alertsWithState.filter((a) => !a.resolved).length,
  }), [alertsWithState]);

  const resolveAlert = useCallback((id: string) => {
    const newIds = [...resolvedIds, id];
    setResolvedIds(newIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    toast.success('Alerta resuelta', { description: 'La alerta ha sido marcada como resuelta.' });
  }, [resolvedIds]);

  return { alerts, counts, filter, setFilter, resolveAlert };
}
