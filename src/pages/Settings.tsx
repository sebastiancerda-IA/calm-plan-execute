import { StatusDot } from '@/components/shared/StatusDot';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useTheme } from '@/hooks/useTheme';

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

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Settings' }]} />
      <h1 className="text-xl font-semibold text-foreground">Settings</h1>

      {/* Infrastructure */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Infraestructura
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {infraServices.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3 rounded bg-background border border-border">
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
      <div className="rounded-md border border-border bg-card p-4">
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
                  <td className="py-2 px-2">
                    <span className="text-[#22C55E]">{c.status}</span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{c.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Costs */}
      <div className="rounded-md border border-border bg-card p-4">
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
                  <td className="py-2 px-2 text-[#22C55E] font-mono">{s.cost}</td>
                  <td className="py-2 px-2 text-muted-foreground">{s.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-right">
          <span className="text-xs text-muted-foreground">Total mensual: </span>
          <span className="font-mono font-bold text-[#22C55E]">$0</span>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Tema
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            Oscuro
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            Claro
          </button>
        </div>
      </div>
    </div>
  );
}
