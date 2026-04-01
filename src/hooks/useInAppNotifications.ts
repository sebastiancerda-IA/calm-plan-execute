import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function useInAppNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['in-app-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      return (data || []) as any[];
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ['in-app-notifications'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, qc]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications' as any).update({ read: true }).eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['in-app-notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from('notifications' as any).update({ read: true }).eq('user_id', user.id).eq('read', false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['in-app-notifications'] }),
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return { notifications, unreadCount, markRead: markRead.mutate, markAllRead: markAllRead.mutate };
}
