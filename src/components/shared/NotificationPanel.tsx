import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Info, AlertTriangle, Zap, FileText } from 'lucide-react';
import { useInAppNotifications } from '@/hooks/useInAppNotifications';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG: Record<string, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-primary' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500' },
  error: { icon: AlertTriangle, color: 'text-destructive' },
  success: { icon: Zap, color: 'text-idma-green' },
  document: { icon: FileText, color: 'text-idma-blue' },
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useInAppNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClick = (n: any) => {
    if (!n.read) markRead(n.id);
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-idma-green text-white text-[9px] font-bold flex items-center justify-center px-0.5 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Notificaciones {unreadCount > 0 && `(${unreadCount})`}
            </span>
            {unreadCount > 0 && (
              <button onClick={() => markAllRead()} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                <CheckCheck size={10} /> Marcar todas leídas
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-xs text-muted-foreground text-center">Sin notificaciones</p>
            ) : (
              notifications.map((n: any) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = config.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-3 py-2.5 border-b border-border last:border-0 hover:bg-accent/50 transition-colors ${
                      !n.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon size={12} className={`${config.color} mt-0.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[11px] font-medium truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                        </div>
                        {n.message && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                      </div>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-idma-green mt-1 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
