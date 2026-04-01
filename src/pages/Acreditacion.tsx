import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCNA } from '@/hooks/useSupabaseCNA';
import { useSupabaseRAG } from '@/hooks/useSupabaseRAG';
import {
  Upload, FileText, Check, Loader2, Send, Bot, Shield,
  Database, Clock, AlertTriangle, ChevronDown, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

const BUCKET = 'acreditation-docs';
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acreditation-advisor`;

type Msg = { role: 'user' | 'assistant'; content: string; sources?: string[] };

// ─── Semáforo de acreditación ───────────────────────────────
function AccreditationSemaphore({ criteria }: { criteria: any[] }) {
  const noEvidence = criteria.filter((c: any) => (c.evidence_count || 0) === 0).length;
  const dim4Issues = criteria
    .filter((c: any) => ['C13', 'C14', 'C15', 'C16'].includes(c.id))
    .filter((c: any) => (c.current_level || 'N1') < (c.target_level || 'N2')).length;

  let status: 'red' | 'yellow' | 'green';
  let label: string;
  if (noEvidence > 4) {
    status = 'red';
    label = `En construcción — ${noEvidence} criterios sin evidencia`;
  } else if (dim4Issues > 0 || noEvidence > 0) {
    status = 'yellow';
    label = dim4Issues > 0
      ? `En progreso — Dimensión IV requiere atención (${dim4Issues} criterios con brecha)`
      : `En progreso — ${noEvidence} criterios sin evidencia`;
  } else {
    status = 'green';
    label = 'Listo para visita';
  }

  const colors = {
    red: 'border-destructive/50 bg-destructive/10',
    yellow: 'border-yellow-500/50 bg-yellow-500/10',
    green: 'border-green-500/50 bg-green-500/10',
  };
  const dots = { red: 'bg-destructive', yellow: 'bg-yellow-500', green: 'bg-green-500' };

  return (
    <div className={`rounded-lg border-2 ${colors[status]} p-4 flex items-center gap-3`}>
      <div className={`w-4 h-4 rounded-full ${dots[status]} ${status === 'red' ? 'animate-pulse' : ''}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

// ─── Tab 1: Estado Actual ──────────────────────────────────
function TabEstadoActual() {
  const { dimensions, criteria } = useSupabaseCNA();

  const dimConfig = [
    { ids: ['C1', 'C2', 'C3', 'C4', 'C5'], label: 'I — Docencia', obligatoria: false },
    { ids: ['C6', 'C7', 'C8', 'C9'], label: 'II — Gestión', obligatoria: false },
    { ids: ['C10', 'C11', 'C12'], label: 'III — Calidad', obligatoria: false },
    { ids: ['C13', 'C14', 'C15', 'C16'], label: 'IV — VCM', obligatoria: true },
  ];

  const levelNum = (l: string) => l === 'N3' ? 3 : l === 'N2' ? 2 : 1;
  const levelColor = (avg: number) => avg >= 2.5 ? 'bg-green-500' : avg >= 1.5 ? 'bg-yellow-500' : 'bg-destructive';

  return (
    <div className="space-y-5">
      <AccreditationSemaphore criteria={criteria} />

      {/* Barras de progreso por dimensión */}
      <div className="space-y-3">
        {dimConfig.map((dim) => {
          const dimCriteria = criteria.filter((c: any) => dim.ids.includes(c.id));
          const withEvidence = dimCriteria.filter((c: any) => (c.evidence_count || 0) > 0).length;
          const pct = dimCriteria.length > 0 ? Math.round((withEvidence / dimCriteria.length) * 100) : 0;
          const avgLevel = dimCriteria.length > 0
            ? dimCriteria.reduce((s: number, c: any) => s + levelNum(c.current_level || 'N1'), 0) / dimCriteria.length
            : 1;

          return (
            <a
              key={dim.label}
              href={`/cna?expand=${dim.ids[0]}`}
              className={`block rounded-md border bg-card p-3 hover:bg-accent/50 transition-colors ${
                dim.obligatoria ? 'border-destructive/50 ring-1 ring-destructive/30' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{dim.label}</span>
                  {dim.obligatoria && (
                    <span className="text-[9px] font-bold bg-destructive/20 text-destructive px-1.5 py-0.5 rounded animate-pulse">
                      OBLIGATORIA
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {withEvidence}/{dimCriteria.length} con evidencia — {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${levelColor(avgLevel)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </a>
          );
        })}
      </div>

      {/* Grid 4x4 de criterios */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
          16 Criterios CNA
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {criteria.map((c: any) => {
            const hasEvidence = (c.evidence_count || 0) > 0;
            const levelBg = c.current_level === 'N3' ? 'bg-green-500/20 text-green-400'
              : c.current_level === 'N2' ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-destructive/20 text-destructive';

            return (
              <a
                key={c.id}
                href={`/cna?expand=${c.id}`}
                className="rounded-md border border-border bg-card p-2.5 hover:bg-accent/50 transition-colors group relative"
                title={c.gap_description || c.name}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold text-foreground">{c.id}</span>
                  <span className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded ${levelBg}`}>
                    {c.current_level || 'N1'}
                  </span>
                </div>
                {hasEvidence ? (
                  <span className="text-[9px] text-green-400 font-mono">{c.evidence_count} docs</span>
                ) : (
                  <span className="text-[9px] text-destructive/70 font-mono">SIN EVIDENCIA</span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Documentos RAG ─────────────────────────────────
function TabDocumentosRAG() {
  const queryClient = useQueryClient();
  const { documents, stats, isLoading } = useSupabaseRAG();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('rag_docs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rag_documents' }, (payload) => {
        toast.success(`📄 Nuevo documento indexado: ${(payload.new as any).titulo}`);
        queryClient.invalidateQueries({ queryKey: ['rag_documents'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const totalChunks = documents.reduce((s: number, d: any) => s + (d.chunk_count || 1), 0);
  const acredDocs = documents.filter((d: any) =>
    d.fuente === 'drive' || d.categoria === 'acreditacion'
  ).length;

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total docs en RAG', value: documents.length, icon: Database },
          { label: 'Docs acreditación', value: acredDocs, icon: FileText },
          { label: 'Total chunks', value: totalChunks, icon: Sparkles },
          { label: 'Última actualización', value: stats.lastIndexed ? new Date(stats.lastIndexed).toLocaleDateString('es-CL') : '—', icon: Clock },
        ].map((m) => (
          <div key={m.label} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <m.icon size={12} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
            <span className="text-lg font-bold text-foreground font-mono">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Table or empty state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-card p-8 text-center space-y-3">
          <Database size={32} className="mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Base de conocimiento vacía — Los documentos de acreditación se cargarán hoy vía A3-Drive-RAG.
            Una vez indexados aparecerán aquí automáticamente.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <Loader2 size={12} className="animate-spin" />
            Esperando indexación...
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Documento</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Fuente</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Categoría</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Criterios CNA</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground">Chunks</th>
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc: any) => (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="p-2.5 text-foreground max-w-[200px] truncate">{doc.titulo}</td>
                    <td className="p-2.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        doc.fuente === 'gmail' ? 'bg-blue-500/20 text-blue-400'
                          : doc.fuente === 'drive' ? 'bg-green-500/20 text-green-400'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {doc.fuente || 'manual'}
                      </span>
                    </td>
                    <td className="p-2.5 text-muted-foreground">{doc.categoria || '—'}</td>
                    <td className="p-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(doc.criterios_cna || []).map((cr: string) => (
                          <span key={cr} className="text-[9px] font-mono bg-primary/20 text-primary px-1 py-0.5 rounded">
                            {cr}
                          </span>
                        ))}
                        {(!doc.criterios_cna || doc.criterios_cna.length === 0) && (
                          <span className="text-[9px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-mono text-muted-foreground">{doc.chunk_count || 1}</td>
                    <td className="p-2.5 text-muted-foreground">
                      {doc.fecha ? new Date(doc.fecha).toLocaleDateString('es-CL') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Consultar Agente Dios ──────────────────────────
function TabAgenteDios() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<'asesor' | 'evaluador'>('asesor');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { documents } = useSupabaseRAG();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const suggestedQueries = [
    '¿Cuál es nuestro estado real en Dimensión IV?',
    '¿Qué evidencias nos faltan para C13 y C14?',
    '¿Qué observaciones hizo CNA en la visita anterior?',
    'Prioriza las 5 acciones más urgentes para acreditación',
    '¿Cómo van las otras dimensiones?',
  ];

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming) return;

    const userMsg: Msg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg], mode }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Error de conexión' }));
        toast.error(err.error || `Error ${resp.status}`);
        setIsStreaming(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch { /* partial */ }
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al conectar con IA');
    }
    setIsStreaming(false);
  };

  const ragCount = documents.length;

  return (
    <div className="rounded-md border border-border bg-card flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          <h3 className="text-xs font-medium text-foreground">Consultar Agente Dios</h3>
          <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
            ragCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {ragCount > 0 ? `${ragCount} docs en RAG` : 'Sin documentos — respuestas genéricas'}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('asesor')}
            className={`text-[9px] px-2 py-1 rounded flex items-center gap-1 transition-colors ${
              mode === 'asesor' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <Bot size={10} /> Asesor
          </button>
          <button
            onClick={() => setMode('evaluador')}
            className={`text-[9px] px-2 py-1 rounded flex items-center gap-1 transition-colors ${
              mode === 'evaluador' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <Shield size={10} /> Evaluador Duro
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-4">
            <Bot size={28} className="mx-auto text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {mode === 'asesor'
                ? 'Soy el Agente Dios — tu asesor estratégico de acreditación. Pregúntame sobre brechas, evidencias, o benchmarks.'
                : 'Modo Evaluador Duro activo. Evaluaré como un par CNA real: exigente, crítico y riguroso.'}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-lg mx-auto">
              {suggestedQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-2.5 py-1.5 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-lg px-3 py-2">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={mode === 'asesor' ? '¿Cómo mejorar Dimensión IV?' : 'Evalúa críticamente nuestro estado...'}
          className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isStreaming}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isStreaming || !input.trim()}
          className="bg-primary text-primary-foreground rounded px-3 py-2 text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function Acreditacion() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Acreditación CNA 2027' }]} />
      <div>
        <h1 className="text-lg font-semibold text-foreground">Acreditación CNA 2027</h1>
        <p className="text-xs text-muted-foreground">Estado, documentos RAG y asesoría estratégica</p>
      </div>

      <Tabs defaultValue="estado" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="estado" className="text-xs">Estado Actual</TabsTrigger>
          <TabsTrigger value="rag" className="text-xs">Documentos RAG</TabsTrigger>
          <TabsTrigger value="agente" className="text-xs">Consultar Agente Dios</TabsTrigger>
        </TabsList>

        <TabsContent value="estado">
          <TabEstadoActual />
        </TabsContent>

        <TabsContent value="rag">
          <TabDocumentosRAG />
        </TabsContent>

        <TabsContent value="agente">
          <TabAgenteDios />
        </TabsContent>
      </Tabs>
    </div>
  );
}
