import { StatusDot } from '@/components/shared/StatusDot';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useTheme } from '@/hooks/useTheme';
import { useUserPreferences, Density } from '@/hooks/useUserPreferences';
import { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

const infraServices = [
  { name: 'n8n Cloud', status: 'activo' as const, plan: 'Starter', cost: '$0', usage: '4 workflows activos', url: 'sebastiancerda-ia.app.n8n.cloud' },
  { name: 'Qdrant (Railway)', status: 'activo' as const, plan: 'Free tier', cost: '$0', usage: '51 puntos / 1M', url: 'qdrant-production-e4a5.up.railway.app' },
  { name: 'Jina AI', status: 'activo' as const, plan: 'Free tier', cost: '$0', usage: '3,700 / 1M tokens', url: 'api.jina.ai' },
  { name: 'Gemini 2.5 Flash', status: 'activo' as const, plan: 'Nivel 1', cost: '$0', usage: 'Clasificación emails', url: 'generativelanguage.googleapis.com' },
];

const credentials = [
  { name: 'N8N_API_KEY', type: 'API Key', status: 'Activa', lastUsed: 'Hoy' },
  { name: 'QDRANT_API_KEY', type: 'API Key', status: 'Activa', lastUsed: 'Hoy' },
  { name: 'JINA_API_KEY', type: 'API Key', status: 'Activa', lastUsed: 'Ayer' },
  { name: 'GEMINI_API_KEY', type: 'API Key', status: 'Activa', lastUsed: 'Hoy' },
  { name: 'GOOGLE_SHEETS_CREDENTIALS', type: 'OAuth2', status: 'Activa', lastUsed: 'Hoy' },
  { name: 'GMAIL_CREDENTIALS', type: 'OAuth2', status: 'Activa', lastUsed: 'Hoy' },
];

const API_EXAMPLES = [
  { label: 'Estado completo', payload: '{ "action": "get_status" }' },
  { label: 'Lista de agentes', payload: '{ "action": "get_agents" }' },
  { label: 'Criterios CNA', payload: '{ "action": "get_criteria" }' },
  { label: 'Alertas activas', payload: '{ "action": "get_alerts" }' },
  { label: 'Crear alerta', payload: '{ "action": "create_alert", "title": "Test", "priority": "media", "description": "Prueba" }' },
  { label: 'Registrar ejecución', payload: '{ "action": "add_execution", "agent_id": "a1-vcm", "status": "success", "items_processed": 5 }' },
  { label: 'Registrar doc RAG', payload: '{ "action": "add_rag_doc", "titulo": "Documento X", "fuente": "manual", "criterios_cna": ["1.1"] }' },
  { label: 'Tareas por agente', payload: '{ "action": "get_tasks", "agent_id": "a1-vcm" }' },
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
  { value: 'compact', label: 'Compacto', desc: 'Máxima densidad de datos' },
  { value: 'normal', label: 'Normal', desc: 'Balance estándar' },
  { value: 'expanded', label: 'Expandido', desc: 'Más espacio visual' },
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

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { prefs, setPrefs, setWidgetVisible } = useUserPreferences();
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orchestrator-api`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Settings' }]} />
      <h1 className="text-xl font-semibold text-gradient-idma">Settings</h1>

      {/* Personalización */}
      <div className="rounded-lg border border-idma-green/20 bg-card p-4">
        <h3 className="text-xs text-idma-green uppercase tracking-wider font-medium mb-4">
          Personalización
        </h3>

        {/* Density */}
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

        {/* Animations toggle */}
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

        {/* Widget visibility */}
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
                    visible
                      ? 'bg-secondary text-foreground'
                      : 'bg-secondary/30 text-muted-foreground'
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

      {/* Theme toggle */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Tema
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              theme === 'dark' ? 'bg-idma-green/20 text-idma-green-light border border-idma-green/30' : 'bg-secondary text-muted-foreground'
            }`}
          >
            Oscuro
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              theme === 'light' ? 'bg-idma-green/20 text-idma-green-light border border-idma-green/30' : 'bg-secondary text-muted-foreground'
            }`}
          >
            Claro
          </button>
        </div>
      </div>

      {/* Orchestrator API */}
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

      {/* Infrastructure */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Infraestructura
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {infraServices.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-3">
                <StatusDot status={s.status === 'activo' ? 'operativo' : 'error'} />
                <div>
                  <p className="text-sm text-foreground font-medium">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{s.url}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{s.usage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Credenciales
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">Nombre</th>
                <th className="text-left py-2 px-2">Tipo</th>
                <th className="text-left py-2 px-2">Estado</th>
                <th className="text-left py-2 px-2">Último uso</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((c) => (
                <tr key={c.name} className="border-b border-border">
                  <td className="py-2 px-2 text-foreground font-mono">{c.name}</td>
                  <td className="py-2 px-2 text-muted-foreground">{c.type}</td>
                  <td className="py-2 px-2"><span className="text-idma-green">{c.status}</span></td>
                  <td className="py-2 px-2 text-muted-foreground">{c.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Costs */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Costos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">Servicio</th>
                <th className="text-left py-2 px-2">Plan</th>
                <th className="text-left py-2 px-2">Costo mensual</th>
                <th className="text-left py-2 px-2">Uso actual</th>
              </tr>
            </thead>
            <tbody>
              {infraServices.map((s) => (
                <tr key={s.name} className="border-b border-border">
                  <td className="py-2 px-2 text-foreground">{s.name}</td>
                  <td className="py-2 px-2 text-muted-foreground">{s.plan}</td>
                  <td className="py-2 px-2 text-idma-green font-mono">{s.cost}</td>
                  <td className="py-2 px-2 text-muted-foreground">{s.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-right">
          <span className="text-xs text-muted-foreground">Total mensual: </span>
          <span className="font-mono font-bold text-idma-green">$0</span>
        </div>
      </div>
    </div>
  );
}
