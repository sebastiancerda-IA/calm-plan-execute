import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Filter, Handshake, Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PanelHeader, TerminalBadge } from '@/components/orquesta';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrquestaLiveOverlay } from '@/hooks/useOrquestaLiveOverlay';
import erasmusProjects from '@/data/erasmus-projects.json';

export default function VCM() {
  const { session, loading } = useAuth();
  const { live } = useOrquestaLiveOverlay();
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<'todos' | 'activo' | 'en_negociacion' | 'pendiente_firma' | 'expirado'>('todos');

  const conveniosQuery = useQuery({
    queryKey: ['orquesta-vcm-convenios', session?.user?.id || 'anon'],
    enabled: !loading,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('convenios')
        .select('id,nombre_institucion,tipo,estado,fecha_termino,archivo_drive_url,created_at')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) return [];
      return data || [];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const convenios = conveniosQuery.data || [];

  const filtered = useMemo(() => {
    return convenios.filter((c: any) => {
      if (estado !== 'todos' && c.estado !== estado) return false;
      if (search.trim().length > 0 && !(c.nombre_institucion || '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [convenios, estado, search]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'VCM y Proyectos' }]} />

      <section className="orquesta-panel rounded-2xl border border-border/90 bg-card p-5 md:p-6">
        <PanelHeader
          kicker="Vinculaciùn con el medio"
          title="Erasmus + Convenios institucionales"
          description="Siete proyectos Erasmus+ con enlaces cuando existen; tabla de convenios con filtros (overlay Supabase opcional)."
          right={
            <div className="flex flex-wrap gap-2">
              <TerminalBadge variant="neutral">
                Erasmus <span className="ml-1 font-mono text-foreground">{erasmusProjects.length}</span>
              </TerminalBadge>
              <TerminalBadge variant="live">
                Convenios <span className="ml-1 font-mono text-foreground">{live.conveniosCount ?? convenios.length}</span>
              </TerminalBadge>
              <TerminalBadge variant="neutral">
                Con link <span className="ml-1 font-mono text-foreground">{live.conveniosConLink ?? 'ù'}</span>
              </TerminalBadge>
            </div>
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {erasmusProjects.map((project) => (
          <article
            key={project.name}
            className="orquesta-panel flex min-h-[220px] flex-col rounded-2xl border border-border/90 bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold leading-snug text-foreground">{project.name}</h2>
              <TerminalBadge variant="live">Activo</TerminalBadge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {project.type} ù Coord: {project.coordinator}
            </p>
            <p className="mt-2 flex-1 text-xs text-foreground">{project.focus}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Presupuesto: <span className="font-mono text-foreground">EUR {project.budget_eur.toLocaleString('es-CL')}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {project.drive_url ? (
                <a href={project.drive_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-muted-foreground hover:text-foreground">
                  Drive <ExternalLink size={11} />
                </a>
              ) : (
                <span className="rounded-md border border-dashed border-border px-2 py-1 text-[10px] text-muted-foreground">Sin Drive</span>
              )}
              {project.doc_url ? (
                <a href={project.doc_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-muted-foreground hover:text-foreground">
                  Documento <ExternalLink size={11} />
                </a>
              ) : (
                <span className="rounded-md border border-dashed border-border px-2 py-1 text-[10px] text-muted-foreground">Sin doc</span>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm font-medium text-foreground inline-flex items-center gap-2"><Handshake size={15} /> Convenios institucionales</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search size={13} className="absolute left-2 top-2.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar institucion"
                className="h-8 rounded-md border border-border bg-background pl-7 pr-2 text-xs text-foreground"
              />
            </label>
            <label className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              <Filter size={12} />
              <select value={estado} onChange={(e) => setEstado(e.target.value as any)} className="bg-transparent text-foreground outline-none">
                <option value="todos">Todos</option>
                <option value="activo">Activo</option>
                <option value="en_negociacion">En negociacion</option>
                <option value="pendiente_firma">Pendiente firma</option>
                <option value="expirado">Expirado</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Institucion</th>
                <th className="px-2 py-2 font-medium">Tipo</th>
                <th className="px-2 py-2 font-medium">Estado</th>
                <th className="px-2 py-2 font-medium">Termino</th>
                <th className="px-2 py-2 font-medium">Drive</th>
              </tr>
            </thead>
            <tbody>
              {conveniosQuery.isLoading && (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-center text-xs text-muted-foreground">
                    Cargando conveniosù
                  </td>
                </tr>
              )}
              {conveniosQuery.isError && !conveniosQuery.isLoading && (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-center text-xs text-destructive">
                    No se pudo cargar la tabla de convenios. Revisa la conexiÛn o vuelve a intentar.
                  </td>
                </tr>
              )}
              {!conveniosQuery.isLoading && !conveniosQuery.isError && filtered.slice(0, 80).map((row: any) => (
                <tr key={row.id} className="border-b border-border/70 text-foreground">
                  <td className="px-2 py-2">{row.nombre_institucion}</td>
                  <td className="px-2 py-2 text-muted-foreground">{row.tipo || '-'}</td>
                  <td className="px-2 py-2">
                    <span className="rounded px-1.5 py-0.5 border border-border text-muted-foreground">{row.estado || '-'}</span>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">{row.fecha_termino || '-'}</td>
                  <td className="px-2 py-2">
                    {row.archivo_drive_url ? (
                      <a href={row.archivo_drive_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        Abrir <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!conveniosQuery.isLoading && !conveniosQuery.isError && filtered.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">Sin resultados para los filtros seleccionados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
