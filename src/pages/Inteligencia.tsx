import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Database, Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { supabase } from '@/integrations/supabase/client';
import { useOrquestaLiveOverlay } from '@/hooks/useOrquestaLiveOverlay';
import cnaCriteria from '@/data/cna-criteria.json';
import erasmusProjects from '@/data/erasmus-projects.json';
import otecCatalog from '@/data/otec-catalog.json';

function toCorpus() {
  return [
    ...cnaCriteria.map((c) => ({ source: 'CNA', title: `${c.id} ${c.nombre}`, body: `${c.descripcion} ${c.area} ${c.responsable}` })),
    ...erasmusProjects.map((p) => ({ source: 'Erasmus', title: p.name, body: `${p.type} ${p.focus} ${p.coordinator}` })),
    ...otecCatalog.diplomados.map((d) => ({ source: 'OTEC', title: d.name, body: `${d.area} ${d.hours} horas ${d.price}` })),
    ...otecCatalog.cursos.map((c) => ({ source: 'OTEC', title: c.name, body: `${c.hours} horas ${c.price}` })),
  ];
}

export default function Inteligencia() {
  const { live } = useOrquestaLiveOverlay();
  const [query, setQuery] = useState('');

  const logsQuery = useQuery({
    queryKey: ['orquesta-intelligence-email-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('id,asunto,categoria,prioridad,created_at,de,agent_id')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) return [];
      return data || [];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const ragQuery = useQuery({
    queryKey: ['orquesta-intelligence-rag-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rag_documents')
        .select('id,titulo,categoria,fecha')
        .order('fecha', { ascending: false })
        .limit(20);
      if (error) return [];
      return data || [];
    },
    staleTime: 120_000,
    refetchInterval: 180_000,
  });

  const corpus = useMemo(() => toCorpus(), []);
  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return corpus
      .filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(term))
      .slice(0, 10);
  }, [corpus, query]);

  const logs = logsQuery.data || [];
  const ragDocs = ragQuery.data || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Inteligencia' }]} />

      <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">IA Activity Center</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Operacion visible de agentes + RAG</h1>
        <p className="mt-2 text-sm text-muted-foreground">Monitoreo de actividad, volumen operativo y exploracion semantica de conocimiento institucional.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Emails procesados (24h)</p>
          <p className="mt-2 text-3xl font-semibold text-foreground font-mono">{live.emails24h || 0}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Urgentes (24h)</p>
          <p className="mt-2 text-3xl font-semibold text-amber-300 font-mono">{live.urgent24h || 0}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Agentes activos</p>
          <p className="mt-2 text-3xl font-semibold text-foreground font-mono">{live.activeAgents || 0}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">RAG docs</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300 font-mono">{live.ragDocs || 0}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Bot size={15} className="text-primary" />
            <h2 className="text-sm font-medium text-foreground">Feed reciente de actividad</h2>
          </div>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1 text-xs">
            {logs.map((log: any) => (
              <div key={log.id} className="rounded-md border border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground line-clamp-1">{log.asunto || 'Sin asunto'}</p>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">{log.prioridad || 'normal'}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{log.categoria || 'sin categoria'} · {log.agent_id || 'sin agente'}</p>
              </div>
            ))}
            {logs.length === 0 && <p className="text-muted-foreground">Sin actividad reciente en email_logs.</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Search size={15} className="text-cyan-300" />
            <h2 className="text-sm font-medium text-foreground">RAG search rapido (demo)</h2>
          </div>
          <label className="relative mt-3 block">
            <Search size={13} className="absolute left-2 top-2.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: C14, Erasmus, fotovoltaico"
              className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-xs text-foreground"
            />
          </label>

          <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1 text-xs">
            {searchResults.map((item, idx) => (
              <div key={`${item.title}-${idx}`} className="rounded-md border border-border px-3 py-2">
                <p className="text-foreground">{item.title}</p>
                <p className="mt-1 text-muted-foreground">{item.source} · {item.body}</p>
              </div>
            ))}
            {query && searchResults.length === 0 && <p className="text-muted-foreground">Sin resultados en el corpus demo.</p>}
            {!query && <p className="text-muted-foreground">Ingresa una consulta para explorar el conocimiento consolidado.</p>}
          </div>

          <div className="mt-4 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground inline-flex items-center gap-1">
            <Database size={12} /> Ultimos documentos RAG live: <span className="font-mono text-foreground">{ragDocs.length}</span>
          </div>
        </article>
      </section>
    </div>
  );
}
