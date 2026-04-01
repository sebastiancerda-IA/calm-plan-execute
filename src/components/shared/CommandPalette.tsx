import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAgents } from '@/hooks/useSupabaseAgents';
import { useSupabaseAlerts } from '@/hooks/useSupabaseAlerts';
import { useSupabaseCNA } from '@/hooks/useSupabaseCNA';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { LayoutDashboard, Users, Shield, AlertTriangle, Database, Settings } from 'lucide-react';

const pages = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Agentes', path: '/agents', icon: Users },
  { label: 'CNA Matrix', path: '/cna', icon: Shield },
  { label: 'Alertas', path: '/alerts', icon: AlertTriangle },
  { label: 'RAG Explorer', path: '/rag', icon: Database },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { agents } = useSupabaseAgents();
  const { alerts } = useSupabaseAlerts();
  const { criteria } = useSupabaseCNA();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const activeAlerts = alerts.filter((a: any) => !a.resolved).slice(0, 5);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar agentes, criterios, alertas..." />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Páginas">
          {pages.map((p) => (
            <CommandItem key={p.path} onSelect={() => go(p.path)}>
              <p.icon className="mr-2 h-4 w-4" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Agentes">
          {agents.map((a: any) => (
            <CommandItem key={a.id} onSelect={() => go(`/agent/${a.id}`)}>
              <span className="font-mono text-xs mr-2" style={{ color: a.color }}>{a.code}</span>
              {a.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Criterios CNA">
          {criteria.map((c: any) => (
            <CommandItem key={c.id} onSelect={() => go(`/cna?expand=${c.id}`)}>
              <span className="font-mono text-xs mr-2">{c.id}</span>
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        {activeAlerts.length > 0 && (
          <CommandGroup heading="Alertas">
            {activeAlerts.map((a: any) => (
              <CommandItem key={a.id} onSelect={() => go('/alerts')}>
                <AlertTriangle className="mr-2 h-3 w-3" style={{ color: a.priority === 'critica' ? '#EF4444' : '#F97316' }} />
                {a.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
