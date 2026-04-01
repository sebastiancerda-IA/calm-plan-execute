import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAuditLog() {
  const { user } = useAuth();

  const log = useCallback(async (action: string, resource?: string, details?: Record<string, unknown>) => {
    if (!user) return;
    try {
      await supabase.from('audit_log' as any).insert({
        user_id: user.id,
        action,
        resource: resource || null,
        details: details || {},
      });
    } catch (e) {
      console.error('Audit log error:', e);
    }
  }, [user]);

  return { log };
}
