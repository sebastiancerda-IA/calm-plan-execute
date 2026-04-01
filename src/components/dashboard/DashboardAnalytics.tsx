import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { BarChart3, Activity, AlertTriangle, Zap } from 'lucide-react';

const COLORS = ['#22C55E', '#3B82F6', '#EAB308', '#EF4444', '#8B5CF6', '#EC4899'];

export function DashboardAnalytics() {
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await supabase.from('agents').select('*');
      return data || [];
    },
  });

  const { data: executions = [] } = useQuery({
    queryKey: ['executions-analytics'],
    queryFn: async () => {
      const { data } = await supabase.from('executions').select('*').order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-analytics'],
    queryFn: async () => {
      const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
  });

  // Agent status distribution
  const statusCounts: Record<string, number> = {};
  agents.forEach((a: any) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Executions by status
  const execByStatus: Record<string, number> = {};
  executions.forEach((e: any) => {
    const s = e.status || 'unknown';
    execByStatus[s] = (execByStatus[s] || 0) + 1;
  });
  const execData = Object.entries(execByStatus).map(([name, value]) => ({ name, value }));

  // Alerts by priority
  const alertsByPriority: Record<string, number> = {};
  alerts.forEach((a: any) => {
    alertsByPriority[a.priority] = (alertsByPriority[a.priority] || 0) + 1;
  });
  const alertData = Object.entries(alertsByPriority).map(([name, value]) => ({ name, value }));

  // Items processed per agent (top 10)
  const agentProcessed = agents
    .filter((a: any) => (a.items_processed_24h || 0) > 0)
    .sort((a: any, b: any) => (b.items_processed_24h || 0) - (a.items_processed_24h || 0))
    .slice(0, 10)
    .map((a: any) => ({ name: a.code, items: a.items_processed_24h || 0 }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Analytics del Sistema</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agent Status Distribution */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={12} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Estado de Agentes</span>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={55} paddingAngle={2}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-8">Sin datos</p>
          )}
          <div className="flex flex-wrap gap-2 mt-1 justify-center">
            {statusData.map((s, i) => (
              <span key={s.name} className="text-[9px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        {/* Items Processed by Agent */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Ítems Procesados (24h)</span>
          </div>
          {agentProcessed.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={agentProcessed}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="items" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-8">Sin ejecuciones registradas</p>
          )}
        </div>

        {/* Executions by Status */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={12} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Ejecuciones por Estado</span>
          </div>
          {execData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={execData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-8">Sin ejecuciones</p>
          )}
        </div>

        {/* Alerts by Priority */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Alertas por Prioridad</span>
          </div>
          {alertData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={alertData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-8">Sin alertas</p>
          )}
        </div>
      </div>
    </div>
  );
}
