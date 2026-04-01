import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { mockAgents } from '@/data/mockAgents';
import { mockCriteria } from '@/data/mockCNA';
import { mockAlerts } from '@/data/mockAlerts';
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
          {mockAgents.map((a) => (
            <CommandItem key={a.id} onSelect={() => go(`/agent/${a.id}`)}>
              <span className="font-mono text-xs mr-2" style={{ color: a.color }}>{a.code}</span>
              {a.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Criterios CNA">
          {mockCriteria.map((c) => (
            <CommandItem key={c.id} onSelect={() => go(`/cna?expand=${c.id}`)}>
              <span className="font-mono text-xs mr-2">{c.id}</span>
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Alertas">
          {mockAlerts.filter((a) => !a.resolved).slice(0, 5).map((a) => (
            <CommandItem key={a.id} onSelect={() => go('/alerts')}>
              <AlertTriangle className="mr-2 h-3 w-3" style={{ color: a.priority === 'critica' ? '#EF4444' : '#F97316' }} />
              {a.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
