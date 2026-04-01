import { StatusDot } from '@/components/shared/StatusDot';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useTheme } from '@/hooks/useTheme';
import { useUserPreferences, Density } from '@/hooks/useUserPreferences';
import { useState } from 'react';
import { Copy, Check, Eye, EyeOff, Wifi, WifiOff, Play, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_EXAMPLES = [
  { label: 'Estado completo', payload: '{ "action": "get_status" }' },
  { label: 'Lista de agentes', payload: '{ "action": "get_agents" }' },
  { label: 'Criterios CNA', payload: '{ "action": "get_criteria" }' },
  { label: 'Alertas activas', payload: '{ "action": "get_alerts" }' },
  { label: 'Resumen financiero', payload: '{ "action": "get_financial_summary" }' },
  { label: 'Salud del sistema', payload: '{ "action": "get_system_health" }' },
  { label: 'Crear alerta', payload: '{ "action": "create_alert", "title": "Test", "priority": "media", "description": "Prueba" }' },
  { label: 'Registrar ejecución', payload: '{ "action": "add_execution", "agent_id": "a1-vcm", "status": "success", "items_processed": 5 }' },
];

const N8N_SYNC_EXAMPLES = [
  {
    label: 'Sync financiero',
    payload: `{
  "event_type": "financial_sync",
  "records": [
    { "period": "2025-06", "category": "matriculas", "concept": "Matrículas Junio", "amount": 15000000, "record_type": "ingreso" }
  ]
}`,
  },
  {
    label: 'Sync OTEC',
    payload: `{
  "event_type": "otec_sync",
  "records": [
    { "id": "uuid-here", "name": "Curso SENCE Energías Renovables", "type": "curso", "status": "activo", "students_enrolled": 25, "revenue": 3750000 }
  ]
}`,
  },
];

const WIDGET_LABELS: Record<string, string> = {
  globalMetrics: 'Métricas Globales',
  institutionalMetrics: 'Métricas Institucionales',
  agentMap: 'Mapa de Agentes',
  pulse: 'Pulse Widget',
  activityFeed: 'Activity Feed',
  accreditationGuide: 'Guía Acreditación',
  actionCenter: 'Centro de Acciones',
  dataChecklist: 'Data Checklist',
  infraFooter: 'Infraestructura Footer',
};

const DENSITY_OPTIONS: { value: Density; label: string; desc: string }[] = [
  { value: 'compact', label: 'Compacto', desc: 'Máxima densidad' },
  { value: 'normal', label: 'Normal', desc: 'Balance estándar' },
  { value: 'expanded', label: 'Expandido', desc: 'Más espacio' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function N8NPanel() {
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-webhook`;

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-workflows'],
    queryFn: async () => {
      const { data } = await supabase.from('agents').select('id, code, name, workflow_id, last_run, status').order('code');
      return data || [];
    },
  });

  const workflowAgents = agents.filter((a: any) => a.workflow_id);
  const operativeAgents = agents.filter((a: any) => a.status === 'operativo' || a.status === 'warning');

  const testConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('orchestrator-api', {
        body: { action: 'get_agents' },
      });
      setConnected(!error && data?.agents);
      toast.success('Conexión verificada — orchestrator-api respondió correctamente');
    } catch {
      setConnected(false);
      toast.error('Error de conexión');
    } finally {
      setTesting(false);
    }
  };

  const simulateExecution = async () => {
    if (!selectedAgent) return;
    setSimulating(true);
    try {
      const { error } = await supabase.functions.invoke('orchestrator-api', {
        body: {
          action: 'add_execution',
          agent_id: selectedAgent,
          status: 'success',
          items_processed: Math.floor(Math.random() * 10) + 1,
          duration_ms: 1500,
        },
      });
      if (error) throw error;
      toast.success(`Ejecución simulada para ${selectedAgent}`);
    } catch {
      toast.error('Error al simular ejecución');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="rounded-lg border border-idma-green/20 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-idma-green uppercase tracking-wider font-medium">
          Conexión n8n
        </h3>
        <div className="flex items-center gap-2">
          {connected === true && <Wifi size={14} className="text-idma-green" />}
          {connected === false && <WifiOff size={14} className="text-destructive" />}
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            connected === null ? 'bg-muted text-muted-foreground' :
            connected ? 'bg-idma-green/20 text-idma-green' : 'bg-destructive/20 text-destructive'
          }`}>
            {connected === null ? 'Sin verificar' : connected ? 'Conectado' : 'Error'}
          </span>
          <button
            onClick={testConnection}
            disabled={testing}
            className="text-xs px-3 py-1 rounded bg-idma-green/10 text-idma-green hover:bg-idma-green/20 transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 size={12} className="animate-spin" /> : 'Test conexión'}
          </button>
        </div>
      </div>

      {/* Webhook URL */}
      <div>
        <span className="text-[10px] text-muted-foreground block mb-1">Webhook URL para n8n</span>
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
          <code className="text-xs text-foreground font-mono flex-1 truncate">{webhookUrl}</code>
          <CopyButton text={webhookUrl} />
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">Pegar esta URL en el nodo HTTP Request al final de cada workflow de n8n</p>
      </div>

      {/* Registered workflows */}
      <div>
        <span className="text-[10px] text-muted-foreground block mb-2">Workflows registrados ({workflowAgents.length})</span>
        {workflowAgents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-1.5 px-2">Agente</th>
                  <th className="text-left py-1.5 px-2">Workflow ID</th>
                  <th className="text-left py-1.5 px-2">Último ping</th>
                  <th className="text-left py-1.5 px-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {workflowAgents.map((a: any) => (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-1.5 px-2 font-mono text-foreground">{a.code}</td>
                    <td className="py-1.5 px-2 font-mono text-muted-foreground">{a.workflow_id}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">
                      {a.last_run ? new Date(a.last_run).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-1.5 px-2"><StatusDot status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Ningún agente tiene workflow_id asignado aún</p>
        )}
      </div>

      {/* Test manual */}
      <div className="border-t border-border pt-3">
        <span className="text-[10px] text-muted-foreground block mb-2">Test Manual — Simular ejecución</span>
        <div className="flex items-center gap-2">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="flex-1 text-xs bg-secondary border border-border rounded px-2 py-1.5 text-foreground"
          >
            <option value="">Seleccionar agente...</option>
            {operativeAgents.map((a: any) => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
          <button
            onClick={simulateExecution}
            disabled={!selectedAgent || simulating}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-idma-green text-white hover:bg-idma-green/90 transition-colors disabled:opacity-50"
          >
            {simulating ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Simular
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">El resultado aparecerá en tiempo real en el Dashboard</p>
      </div>
      {/* n8n Sync payloads */}
      <div className="border-t border-border pt-3">
        <span className="text-[10px] text-muted-foreground block mb-2">Payloads de sincronización n8n (enviar al webhook URL)</span>
        <div className="grid grid-cols-1 gap-2">
          {N8N_SYNC_EXAMPLES.map((ex) => (
            <div key={ex.label} className="bg-secondary rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-muted-foreground font-medium">{ex.label}</span>
                <CopyButton text={ex.payload} />
              </div>
              <code className="text-[10px] text-foreground font-mono block whitespace-pre-wrap break-all">{ex.payload}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupabaseStatusPanel() {
  const { data: tableCounts, isLoading } = useQuery({
    queryKey: ['supabase-table-counts'],
    queryFn: async () => {
      const tables = ['agents', 'alerts', 'cna_criteria', 'rag_documents', 'executions', 'otec_programs', 'financial_records', 'agent_tasks', 'convenios'] as const;
      const results: Record<string, number> = {};
      await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
          results[t] = count || 0;
        })
      );
      return results;
    },
    staleTime: 30000,
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Estado Base de Datos
        </h3>
        <StatusDot status="operativo" />
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Cargando...</p>
      ) : tableCounts ? (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(tableCounts).map(([table, count]) => (
            <div key={table} className="bg-secondary/50 rounded p-2">
              <p className="text-[10px] text-muted-foreground font-mono">{table}</p>
              <p className="text-sm font-semibold text-foreground">{count}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { prefs, setPrefs, setWidgetVisible } = useUserPreferences();
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orchestrator-api`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Settings' }]} />
      <h1 className="text-xl font-semibold text-gradient-idma">Settings</h1>

      {/* n8n Connection */}
      <N8NPanel />

      {/* Personalización */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
          Personalización
        </h3>
        <div className="mb-4">
          <span className="text-[10px] text-muted-foreground block mb-2">Densidad de datos</span>
          <div className="flex gap-2">
            {DENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPrefs({ density: opt.value })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  prefs.density === opt.value
                    ? 'bg-idma-green/20 text-idma-green-light border border-idma-green/30'
                    : 'bg-secondary text-muted-foreground border border-transparent hover:border-border'
                }`}
              >
                <div>{opt.label}</div>
                <div className="text-[9px] mt-0.5 opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 p-2 rounded bg-secondary/50">
          <span className="text-xs text-foreground">Animaciones</span>
          <button
            onClick={() => setPrefs({ animationsEnabled: !prefs.animationsEnabled })}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              prefs.animationsEnabled ? 'bg-idma-green' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
              prefs.animationsEnabled ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground block mb-2">Widgets del Dashboard</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(WIDGET_LABELS).map(([key, label]) => {
              const visible = prefs.visibleWidgets[key as keyof typeof prefs.visibleWidgets];
              return (
                <button
                  key={key}
                  onClick={() => setWidgetVisible(key as any, !visible)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all ${
                    visible ? 'bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  {visible ? <Eye size={12} className="text-idma-green" /> : <EyeOff size={12} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Tema</h3>
        <div className="flex items-center gap-3">
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === t ? 'bg-idma-green/20 text-idma-green-light border border-idma-green/30' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {t === 'dark' ? 'Oscuro' : 'Claro'}
            </button>
          ))}
        </div>
      </div>

      {/* Supabase Status */}
      <SupabaseStatusPanel />

      {/* API Bridge */}
      <div className="rounded-lg border border-idma-blue/20 bg-card p-4">
        <h3 className="text-xs text-idma-blue uppercase tracking-wider font-medium mb-3">
          API Bridge — Claude Code
        </h3>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">Endpoint URL</span>
            <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
              <code className="text-xs text-foreground font-mono flex-1 truncate">{apiUrl}</code>
              <CopyButton text={apiUrl} />
            </div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block mb-1">Autenticación</span>
            <p className="text-xs text-muted-foreground">
              Header: <code className="bg-secondary px-1 rounded">X-Api-Key: SUPABASE_SERVICE_ROLE_KEY</code>
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block mb-2">Payloads de ejemplo</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {API_EXAMPLES.map((ex) => (
                <div key={ex.label} className="bg-secondary rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-muted-foreground font-medium">{ex.label}</span>
                    <CopyButton text={ex.payload} />
                  </div>
                  <code className="text-[10px] text-foreground font-mono block whitespace-pre-wrap break-all">{ex.payload}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
