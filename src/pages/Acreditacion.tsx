import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCNA } from '@/hooks/useSupabaseCNA';
import { Upload, FileText, Check, Loader2, Send, Bot, Shield } from 'lucide-react';
import { toast } from 'sonner';

const BUCKET = 'acreditation-docs';
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/acreditation-advisor`;

type Msg = { role: 'user' | 'assistant'; content: string };

function AdvisorChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<'asesor' | 'evaluador'>('asesor');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Msg = { role: 'user', content: text };
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

  return (
    <div className="rounded-md border border-border bg-card flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          <h3 className="text-xs font-medium text-foreground">Asesor IA CNA</h3>
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
            <Shield size={10} /> Evaluador
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
            <Bot size={24} className="mx-auto opacity-50" />
            <p>
              {mode === 'asesor'
                ? 'Pregúntame sobre estrategia de acreditación, brechas, evidencias o benchmarks de instituciones comparables.'
                : 'Estoy aquí para evaluar críticamente tu estado de acreditación como lo haría un par evaluador CNA.'}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              }`}
            >
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

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={mode === 'asesor' ? '¿Cómo mejorar el criterio 1.1?' : 'Evalúa nuestro estado en gestión docente...'}
          className="flex-1 bg-secondary border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isStreaming}
        />
        <button
          onClick={sendMessage}
          disabled={isStreaming || !input.trim()}
          className="bg-primary text-primary-foreground rounded px-3 py-2 text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Acreditacion() {
  const [uploading, setUploading] = useState(false);
  const [selectedCriterio, setSelectedCriterio] = useState('');
  const [selectedType, setSelectedType] = useState('evidencia');
  const { criteria } = useSupabaseCNA();

  const { data: documents = [], refetch } = useQuery({
    queryKey: ['acreditation_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acreditation_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${selectedType}/${selectedCriterio || 'general'}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: inserted, error: insertError } = await supabase
        .from('acreditation_documents')
        .insert({
          title: file.name.replace(/\.[^.]+$/, ''),
          document_type: selectedType,
          criterio_cna: selectedCriterio || null,
          file_path: filePath,
          processed: false,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      // Trigger document processing
      if (inserted) {
        supabase.functions.invoke('process-document', {
          body: { document_id: inserted.id },
        }).then(({ error }) => {
          if (error) console.error('process-document error:', error);
          else refetch();
        });
      }

      toast.success('Documento subido — procesando con IA...');
      refetch();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const byType = {
    informe_anterior: documents.filter((d: any) => d.document_type === 'informe_anterior'),
    avance_actual: documents.filter((d: any) => d.document_type === 'avance_actual'),
    evidencia: documents.filter((d: any) => d.document_type === 'evidencia'),
  };

  const evidenceByCriterio: Record<string, number> = {};
  documents.forEach((d: any) => {
    if (d.criterio_cna) {
      evidenceByCriterio[d.criterio_cna] = (evidenceByCriterio[d.criterio_cna] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Acreditación CNA 2027</h1>
        <p className="text-xs text-muted-foreground">Documentos, evidencias y asesoría estratégica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Upload + Documents */}
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
              Cargar documento
            </h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Tipo</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-secondary border border-border rounded px-2 py-1.5 text-xs text-foreground"
                >
                  <option value="evidencia">Evidencia</option>
                  <option value="informe_anterior">Informe anterior</option>
                  <option value="avance_actual">Avance actual</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Criterio CNA</label>
                <select
                  value={selectedCriterio}
                  onChange={(e) => setSelectedCriterio(e.target.value)}
                  className="bg-secondary border border-border rounded px-2 py-1.5 text-xs text-foreground"
                >
                  <option value="">General</option>
                  {criteria.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs cursor-pointer hover:bg-primary/90 transition-colors">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.doc,.docx,.xlsx,.pptx" />
              </label>
            </div>
          </div>

          {/* Evidence matrix */}
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
              Evidencias por criterio
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {criteria.map((c: any) => {
                const count = evidenceByCriterio[c.id] || 0;
                return (
                  <div key={c.id} className="flex flex-col items-center p-2 rounded border border-border bg-secondary/50">
                    <span className="text-[10px] font-mono font-bold text-foreground">{c.id}</span>
                    <span className={`text-lg font-bold ${count > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{count}</span>
                    <span className="text-[8px] text-muted-foreground">docs</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document lists */}
          {(['informe_anterior', 'avance_actual', 'evidencia'] as const).map((type) => {
            const docs = byType[type];
            const labels: Record<string, string> = {
              informe_anterior: 'Informe anterior',
              avance_actual: 'Avance actual',
              evidencia: 'Evidencias',
            };
            if (docs.length === 0) return null;
            return (
              <div key={type} className="rounded-md border border-border bg-card p-4">
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                  {labels[type]} ({docs.length})
                </h3>
                <div className="space-y-1">
                  {docs.map((doc: any) => (
                    <div key={doc.id} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                      <FileText size={14} className="text-muted-foreground shrink-0" />
                      <span className="text-xs text-foreground flex-1 truncate">{doc.title}</span>
                      {doc.criterio_cna && (
                        <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                          {doc.criterio_cna}
                        </span>
                      )}
                      {doc.processed && <Check size={12} className="text-green-500" />}
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(doc.uploaded_at).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {documents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No hay documentos cargados aún.
            </div>
          )}
        </div>

        {/* Right: AI Advisor Chat */}
        <div>
          <AdvisorChat />
        </div>
      </div>
    </div>
  );
}
