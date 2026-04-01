import { useAuth } from '@/contexts/AuthContext';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MetricTile } from '@/components/shared/MetricTile';
import { useInstitutionalMetrics } from '@/hooks/useInstitutionalMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Lock, Send, Bot, Shield, Loader2, Sparkles, Cpu } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const AI_MODELS = [
  { id: 'google/gemini-3-flash-preview', label: 'Gemini Flash', desc: 'Rápido y eficiente' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini Pro', desc: 'Razonamiento profundo' },
  { id: 'openai/gpt-5', label: 'GPT-5', desc: 'Máxima precisión' },
  { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini', desc: 'Balance costo/calidad' },
];

const SUGGESTIONS = [
  '¿Cuál es nuestra estructura de costos actual?',
  'Proyección de flujo de caja a 6 meses',
  '¿Cómo optimizar el margen operativo?',
  'Análisis de rentabilidad por programa OTEC',
  'Riesgos tributarios actuales',
  'Estrategia para diversificar ingresos',
];

function FinancialChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'analista' | 'auditor'>('analista');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('fin_model') || 'google/gemini-3-flash-preview');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: recordCount = 0 } = useQuery({
    queryKey: ['financial_count'],
    queryFn: async () => {
      const { count } = await supabase.from('financial_records').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: allMessages, mode, model: selectedModel }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Error desconocido' }));
        if (resp.status === 429) toast.error('Límite de requests. Espera un momento.');
        else if (resp.status === 402) toast.error('Créditos de IA agotados.');
        else if (resp.status === 403) toast.error('Acceso restringido.');
        else toast.error(err.error || 'Error del asesor');
        setIsLoading(false);
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

        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de conexión con el asesor');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, mode]);

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['analista', 'auditor'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === m
                    ? m === 'analista'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-destructive/20 text-destructive border border-destructive/30'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {m === 'analista' ? <Bot size={12} /> : <Shield size={12} />}
                {m === 'analista' ? 'Analista' : 'Auditor'}
              </button>
            ))}
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
          {recordCount} registros financieros
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Sparkles size={32} className="text-primary/40" />
            <div>
              <p className="text-sm text-foreground font-medium">Asesor Financiero IA</p>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === 'analista'
                  ? 'Estrategias de optimización, proyecciones y análisis financiero'
                  : 'Auditoría rigurosa, detección de riesgos e inconsistencias'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-lg px-3 py-2">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder={mode === 'analista' ? 'Consulta financiera...' : 'Pregunta de auditoría...'}
          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Finanzas() {
  const { isDirectorOrDG, role } = useAuth();
  const { ingresosMensual, gastosMensual, balance, matriculasTotal } = useInstitutionalMetrics();

  const { data: records = [] } = useQuery({
    queryKey: ['financial_records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: isDirectorOrDG,
  });

  if (!isDirectorOrDG) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Lock size={48} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Acceso Restringido</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          El módulo financiero está disponible solo para el Director y la Directora General.
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Tu rol actual: <span className="text-primary">{role.toUpperCase()}</span>
        </p>
      </div>
    );
  }

  const balanceNum = Number(balance);
  const ingresosNum = Number(ingresosMensual);
  const gastosNum = Number(gastosMensual);
  const margen = ingresosNum > 0 ? ((balanceNum / ingresosNum) * 100).toFixed(1) : '0';
  const ingresoPorAlumno = matriculasTotal > 0 ? Math.round(ingresosNum / Number(matriculasTotal)) : 0;

  const ingresos = records.filter(r => r.record_type === 'ingreso');
  const gastos = records.filter(r => r.record_type === 'gasto');

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Finanzas' }]} />

      <div className="flex items-center gap-3">
        <DollarSign size={20} className="text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Centro Financiero</h1>
        <span className="text-[9px] font-mono bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
          CONFIDENCIAL
        </span>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
          <TabsTrigger value="asesor" className="text-xs">Consultar Asesor</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <MetricTile
              label="Ingresos mensual"
              value={`$${(ingresosNum / 1000000).toFixed(1)}M`}
              trend="up"
              suffix="CLP"
              color="hsl(var(--primary))"
              sparkline={[12, 14, 13, 15, 14, 16, ingresosNum / 1000000]}
            />
            <MetricTile
              label="Gastos mensual"
              value={`$${(gastosNum / 1000000).toFixed(1)}M`}
              trend="down"
              suffix="CLP"
              color="hsl(var(--destructive))"
              sparkline={[10, 11, 12, 11, 13, 12, gastosNum / 1000000]}
            />
            <MetricTile
              label="Balance"
              value={`$${(balanceNum / 1000000).toFixed(1)}M`}
              trend={balanceNum > 0 ? 'up' : 'down'}
              suffix={`Margen: ${margen}%`}
              color={balanceNum > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
              sparkline={[2, 3, 1, 4, 1, 4, balanceNum / 1000000]}
            />
            <MetricTile
              label="Ingreso por alumno"
              value={`$${(ingresoPorAlumno / 1000).toFixed(0)}K`}
              trend="stable"
              suffix="CLP mensual"
              color="hsl(var(--accent-foreground))"
              sparkline={[20, 22, 21, 23, 22, 24, ingresoPorAlumno / 1000]}
            />
          </div>

          {balanceNum < 0 && (
            <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 mb-4">
              <AlertTriangle size={16} className="text-destructive" />
              <p className="text-xs text-destructive">
                Balance negativo. Revisar estructura de costos y proyección de ingresos.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-primary" />
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Ingresos ({ingresos.length})
                </h3>
              </div>
              {ingresos.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ingresos.map(r => (
                    <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs text-foreground">{r.concept}</p>
                        <p className="text-[10px] text-muted-foreground">{r.category} · {r.period}</p>
                      </div>
                      <span className="text-xs font-mono text-primary">
                        +${(r.amount / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sin registros. Carga datos financieros vía n8n o API Bridge.</p>
              )}
            </div>

            <div className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={14} className="text-destructive" />
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Gastos ({gastos.length})
                </h3>
              </div>
              {gastos.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gastos.map(r => (
                    <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs text-foreground">{r.concept}</p>
                        <p className="text-[10px] text-muted-foreground">{r.category} · {r.period}</p>
                      </div>
                      <span className="text-xs font-mono text-destructive">
                        -${(r.amount / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sin registros. Carga datos financieros vía n8n o API Bridge.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="asesor">
          <FinancialChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}
