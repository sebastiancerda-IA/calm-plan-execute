import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useNotifications() {
  const queryClient = useQueryClient();
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const sendNative = useCallback((title: string, body: string) => {
    if (permissionRef.current === 'granted' && document.hidden) {
      new Notification(title, { body, icon: '/pwa-192x192.svg', badge: '/pwa-192x192.svg' });
    }
  }, []);

  // Realtime subscription for alerts
  useEffect(() => {
    const channel = supabase
      .channel('alert-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const alert = payload.new as any;
        const priorityEmoji = alert.priority === 'critica' ? '🔴' : alert.priority === 'alta' ? '🟠' : '🟡';
        toast.warning(`${priorityEmoji} ${alert.title}`, { description: alert.description?.slice(0, 80) });
        sendNative(`Alerta ${alert.priority}`, alert.title);
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rag_documents' }, (payload) => {
        const doc = payload.new as any;
        toast.info(`📄 Nuevo documento RAG: ${doc.titulo}`, { duration: 5000 });
        queryClient.invalidateQueries({ queryKey: ['rag_documents'] });
        queryClient.invalidateQueries({ queryKey: ['rag_count'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, sendNative]);

  return { requestPermission, sendNative };
}
