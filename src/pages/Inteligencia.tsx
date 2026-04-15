import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Database, Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PanelHeader, TerminalBadge } from '@/components/orquesta';
import { supabase } from '@/integrations/supabase/client';
import { useOrquestaLiveOverlay } from '@/hooks/useOrquestaLiveOverlay';
import cnaCriteria from '@/data/cna-criteria.json';
import erasmusProjects from '@/data/erasmus-projects.json';
import otecCatalog from '@/data/otec-catalog.json';
import inteligenciaVault from '@/data/inteligencia-vault.json';

function toCorpus() {
  return [
    ...cnaCriteria.map((c) => ({ source: 'CNA', title: `${c.id} ${c.nombre}`, body: `${c.descripcion} ${c.area} ${c.responsable}` })),
    ...erasmusProjects.map((p) => ({ source: 'Erasmus', title: p.name, body: `${p.type} ${p.focus} ${p.coordinator}` })),
    ...otecCatalog.diplomados.map((d) => ({ source: 'OTEC', title: d.name, body: `${d.area} ${d.hours} horas ${d.price}` })),
    ...otecCatalog.cursos.map((c) => ({ source: 'OTEC', title: c.name, body: `${c.hours} horas ${c.price}` })),
  ];
}

/** Etiquetas A1 (alta/crítica) y C1 (calidad/CNA) según prioridad/categoría. */
function activityTags(log: { prioridad?: string | null; categoria?: string | null }) {
  const p = (log.prioridad || '').toLowerCase();
  const c = (log.categoria || '').toLowerCase();
  const tags: string[] = [];
  if (p === 'alta' || p === 'critica' || p === 'crítica') tags.push('A1');
  if (c.includes('cna') || c.includes('calidad')) tags.push('C1');
  return tags;
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

      <section className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <PanelHeader
          kicker="IA Activity Center"
          title="Operación visible · agentes + RAG"
          description="Feed de correo con etiquetas A1/C1 cuando aplica; búsqueda demo sobre corpus JSON; vault con metas de referencia."
        />
      </section>

      <section className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
        <p className="orquesta-section-kicker">Vault de conocimiento (referencia)</p>
        <p className="mt-2 text-sm text-muted-foreground">{inteligenciaVault.vault.nota_operativa}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border px-3 py-2 text-xs">
            <p className="text-muted-foreground">Documentos objetivo (meta)</p>
            <p className="mt-1 font-mono text-2xl text-foreground">{inteligenciaVault.vault.documentos_objetivo}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2 text-xs">
            <p className="text-muted-foreground">Docs RAG (live)</p>
            <p className="mt-1 font-mono text-2xl text-cyan-300">{live.ragDocs ?? '—'}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {inteligenciaVault.vault.categorias_activas.map((cat) => (
            <TerminalBadge key={cat} variant="neutral">
              {cat}
            </TerminalBadge>
          ))}
        </div>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
          <div>
            <dt className="font-mono text-primary">A1</dt>
            <dd>{inteligenciaVault.agentes_referencia.A1}</dd>
          </div>
          <div>
            <dt className="font-mono text-primary">C1</dt>
            <dd>{inteligenciaVault.agentes_referencia.C1}</dd>
          </div>
        </dl>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <article className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
          <p className="text-xs text-muted-foreground">Emails procesados (24h)</p>
          <p className="orquesta-kpi-value mt-2">{live.emails24h || 0}</p>
        </article>
        <article className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
          <p className="text-xs text-muted-foreground">Urgentes (24h)</p>
          <p className="orquesta-kpi-value mt-2 !text-amber-300">{live.urgent24h || 0}</p>
        </article>
        <article className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
          <p className="text-xs text-muted-foreground">Agentes activos</p>
          <p className="orquesta-kpi-value mt-2">{live.activeAgents || 0}</p>
        </article>
        <article className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
          <p className="text-xs text-muted-foreground">RAG docs (live)</p>
          <p className="orquesta-kpi-value mt-2 !text-cyan-300">{live.ragDocs || 0}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
          <div className="flex items-center gap-2">
            <Bot size={15} className="text-primary" />
            <h2 className="text-sm font-medium text-foreground">Feed reciente (A1 / C1 cuando aplica)</h2>
          </div>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1 text-xs">
            {logsQuery.isLoading && <p className="text-muted-foreground">Cargando actividad…</p>}
            {logsQuery.isError && <p className="text-destructive">No se pudo cargar email_logs.</p>}
            {!logsQuery.isLoading &&
              logs.map((log: { id: string; asunto?: string; categoria?: string; prioridad?: string; agent_id?: string }) => {
                const tags = activityTags(log);
                return (
                  <div key={log.id} className="rounded-md border border-border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-foreground">{log.asunto || 'Sin asunto'}</p>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                        {tags.map((t) => (
                          <span key={t} className="rounded border border-primary/40 bg-primary/10 px-1 py-0.5 font-mono text-[9px] text-primary">
                            {t}
                          </span>
                        ))}
                        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">{log.prioridad || 'normal'}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {log.categoria || 'sin categoría'} · {log.agent_id || 'sin agente'}
                    </p>
                  </div>
                );
              })}
            {!logsQuery.isLoading && !logsQuery.isError && logs.length === 0 && (
              <p className="text-muted-foreground">Sin actividad reciente en email_logs.</p>
            )}
          </div>
        </article>

        <article className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5">
          <div className="flex items-center gap-2">
            <Search size={15} className="text-cyan-300" />
            <h2 className="text-sm font-medium text-foreground">RAG search rápido (demo)</h2>
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
                <p className="mt-1 text-muted-foreground">
                  {item.source} · {item.body}
                </p>
              </div>
            ))}
            {query && searchResults.length === 0 && <p className="text-muted-foreground">Sin resultados en el corpus demo.</p>}
            {!query && <p className="text-muted-foreground">Ingresa una consulta para explorar el conocimiento consolidado.</p>}
          </div>

          <div className="mt-4 inline-flex flex-wrap items-center gap-1 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
            <Database size={12} /> Últimos documentos RAG live:{' '}
            {ragQuery.isLoading && <span>cargando…</span>}
            {ragQuery.isError && <span className="text-destructive">error al cargar</span>}
            {!ragQuery.isLoading && !ragQuery.isError && <span className="font-mono text-foreground">{ragDocs.length}</span>}
          </div>
        </article>
      </section>
    </div>
  );
}
