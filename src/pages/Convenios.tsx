import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatusDot } from '@/components/shared/StatusDot';
import { Handshake, Plus, FileText, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ESTADO_MAP: Record<string, { label: string; color: string }> = {
  activo: { label: 'Activo', color: 'bg-idma-green/20 text-idma-green' },
  expirado: { label: 'Expirado', color: 'bg-destructive/20 text-destructive' },
  pendiente_firma: { label: 'Pendiente firma', color: 'bg-yellow-500/20 text-yellow-400' },
  en_negociacion: { label: 'En negociación', color: 'bg-idma-blue/20 text-idma-blue' },
  suspendido: { label: 'Suspendido', color: 'bg-muted text-muted-foreground' },
};

const TIPO_LABELS: Record<string, string> = {
  practica_profesional: 'Práctica Profesional',
  prosecucion_estudios: 'Prosecución de Estudios',
  cooperacion_tecnica: 'Cooperación Técnica',
  descuento_arancel: 'Descuento Arancel',
  colaboracion_institucional: 'Colaboración Institucional',
  otec_empresa: 'OTEC Empresa',
  erasmus: 'Erasmus/Internacional',
  investigacion: 'Investigación',
};

const CONTRAPARTE_LABELS: Record<string, string> = {
  municipalidad: 'Municipalidad',
  empresa_privada: 'Empresa Privada',
  ies_universidad: 'Universidad',
  ies_cft_ip: 'CFT/IP',
  sociedad_civil_ong: 'ONG',
  organismo_publico: 'Organismo Público',
  fundacion: 'Fundación',
  internacional: 'Internacional',
  otro: 'Otro',
};

export default function Convenios() {
  const { isDirectorOrDG } = useAuth();

  const { data: convenios = [], isLoading } = useQuery({
    queryKey: ['convenios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('convenios').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const activos = convenios.filter((c: any) => c.estado === 'activo').length;
  const enNegociacion = convenios.filter((c: any) => c.estado === 'en_negociacion').length;
  const total = convenios.length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Convenios' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gradient-idma flex items-center gap-2">
          <Handshake size={22} /> Convenios Institucionales
        </h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, icon: FileText },
          { label: 'Activos', value: activos, icon: Building2 },
          { label: 'En negociación', value: enNegociacion, icon: Handshake },
          { label: 'Tipos', value: new Set(convenios.map((c: any) => c.tipo)).size, icon: FileText },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <m.icon size={14} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase">{m.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Table or empty state */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Cargando convenios...</p>
        </div>
      ) : convenios.length === 0 ? (
        <div className="rounded-lg border border-dashed border-idma-green/30 bg-card p-12 text-center space-y-4">
          <Handshake size={48} className="mx-auto text-idma-green/40" />
          <h3 className="text-lg font-medium text-foreground">Sin convenios registrados</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Los convenios institucionales se cargarán manualmente. Una vez ingresados, 
            aparecerán aquí con su estado, tipo y vinculación a criterios CNA.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {Object.values(TIPO_LABELS).slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                  <th className="text-left py-2 px-3">Institución</th>
                  <th className="text-left py-2 px-3">Tipo</th>
                  <th className="text-left py-2 px-3">Contraparte</th>
                  <th className="text-left py-2 px-3">Estado</th>
                  <th className="text-left py-2 px-3">Vigencia</th>
                  <th className="text-left py-2 px-3">CNA</th>
                </tr>
              </thead>
              <tbody>
                {convenios.map((c: any) => {
                  const estado = ESTADO_MAP[c.estado] || ESTADO_MAP.activo;
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 px-3 font-medium text-foreground">{c.nombre_institucion}</td>
                      <td className="py-2 px-3 text-muted-foreground">{TIPO_LABELS[c.tipo] || c.tipo}</td>
                      <td className="py-2 px-3 text-muted-foreground">{CONTRAPARTE_LABELS[c.contraparte] || c.contraparte}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${estado.color}`}>{estado.label}</span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground font-mono">
                        {c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString('es-CL') : '—'} 
                        {c.fecha_termino ? ` → ${new Date(c.fecha_termino).toLocaleDateString('es-CL')}` : ''}
                      </td>
                      <td className="py-2 px-3">
                        {c.criterios_cna?.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {c.criterios_cna.map((cr: string) => (
                              <span key={cr} className="text-[9px] px-1.5 py-0.5 rounded bg-idma-green/10 text-idma-green">{cr}</span>
                            ))}
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
