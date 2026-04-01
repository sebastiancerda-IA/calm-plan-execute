import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Handshake, Plus, FileText, Building2, Search, Filter, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { TablesInsert } from '@/integrations/supabase/types';
import { exportConvenios } from '@/lib/exportUtils';

type ConvenioInsert = TablesInsert<'convenios'>;

const ESTADO_MAP: Record<string, { label: string; color: string }> = {
  activo: { label: 'Activo', color: 'bg-idma-green/20 text-idma-green' },
  expirado: { label: 'Expirado', color: 'bg-destructive/20 text-destructive' },
  pendiente_firma: { label: 'Pendiente firma', color: 'bg-yellow-500/20 text-yellow-400' },
  en_negociacion: { label: 'En negociación', color: 'bg-idma-blue/20 text-idma-blue' },
  suspendido: { label: 'Suspendido', color: 'bg-muted text-muted-foreground' },
};

const TIPO_OPTIONS = [
  { value: 'practica_profesional', label: 'Práctica Profesional' },
  { value: 'prosecucion_estudios', label: 'Prosecución de Estudios' },
  { value: 'cooperacion_tecnica', label: 'Cooperación Técnica' },
  { value: 'descuento_arancel', label: 'Descuento Arancel' },
  { value: 'colaboracion_institucional', label: 'Colaboración Institucional' },
  { value: 'otec_empresa', label: 'OTEC Empresa' },
  { value: 'erasmus', label: 'Erasmus/Internacional' },
  { value: 'investigacion', label: 'Investigación' },
] as const;

const CONTRAPARTE_OPTIONS = [
  { value: 'municipalidad', label: 'Municipalidad' },
  { value: 'empresa_privada', label: 'Empresa Privada' },
  { value: 'ies_universidad', label: 'Universidad' },
  { value: 'ies_cft_ip', label: 'CFT/IP' },
  { value: 'sociedad_civil_ong', label: 'ONG' },
  { value: 'organismo_publico', label: 'Organismo Público' },
  { value: 'fundacion', label: 'Fundación' },
  { value: 'internacional', label: 'Internacional' },
  { value: 'otro', label: 'Otro' },
] as const;

const ESTADO_OPTIONS = [
  { value: 'en_negociacion', label: 'En negociación' },
  { value: 'pendiente_firma', label: 'Pendiente firma' },
  { value: 'activo', label: 'Activo' },
  { value: 'expirado', label: 'Expirado' },
  { value: 'suspendido', label: 'Suspendido' },
] as const;

// Smart templates: pre-fill fields based on contraparte type
type TemplateDefaults = Partial<Pick<ConvenioInsert, 'tipo' | 'estado' | 'descripcion' | 'criterios_cna'>>;

const TEMPLATES: Record<string, TemplateDefaults> = {
  municipalidad: {
    tipo: 'cooperacion_tecnica',
    estado: 'en_negociacion',
    descripcion: 'Convenio de cooperación técnica con municipalidad para vinculación con el medio, prácticas profesionales y actividades ambientales conjuntas.',
    criterios_cna: ['C13', 'C14'],
  },
  empresa_privada: {
    tipo: 'practica_profesional',
    estado: 'en_negociacion',
    descripcion: 'Convenio de práctica profesional con empresa del sector para inserción laboral de estudiantes y desarrollo de competencias en terreno.',
    criterios_cna: ['C4', 'C13'],
  },
  ies_universidad: {
    tipo: 'prosecucion_estudios',
    estado: 'en_negociacion',
    descripcion: 'Convenio de articulación con universidad para prosecución de estudios de egresados/as CFT IDMA, con reconocimiento de créditos.',
    criterios_cna: ['C3', 'C5'],
  },
  ies_cft_ip: {
    tipo: 'colaboracion_institucional',
    estado: 'en_negociacion',
    descripcion: 'Convenio de colaboración institucional con CFT/IP para intercambio de buenas prácticas, benchmarking y desarrollo conjunto.',
    criterios_cna: ['C6', 'C10'],
  },
  sociedad_civil_ong: {
    tipo: 'cooperacion_tecnica',
    estado: 'en_negociacion',
    descripcion: 'Convenio con organización de la sociedad civil para proyectos de vinculación con el medio y responsabilidad social.',
    criterios_cna: ['C13', 'C14', 'C15'],
  },
  organismo_publico: {
    tipo: 'cooperacion_tecnica',
    estado: 'en_negociacion',
    descripcion: 'Convenio marco con organismo público para desarrollo de programas, capacitaciones y apoyo técnico institucional.',
    criterios_cna: ['C6', 'C13'],
  },
  fundacion: {
    tipo: 'colaboracion_institucional',
    estado: 'en_negociacion',
    descripcion: 'Convenio con fundación para becas, programas formativos y proyectos de impacto social-ambiental.',
    criterios_cna: ['C13', 'C15'],
  },
  internacional: {
    tipo: 'erasmus',
    estado: 'en_negociacion',
    descripcion: 'Convenio internacional de movilidad e intercambio académico para docentes y estudiantes.',
    criterios_cna: ['C5', 'C16'],
  },
  otro: {
    tipo: 'colaboracion_institucional',
    estado: 'en_negociacion',
    descripcion: '',
    criterios_cna: [],
  },
};

const EMPTY_FORM: ConvenioInsert = {
  nombre_institucion: '',
  tipo: 'practica_profesional',
  contraparte: 'empresa_privada',
  estado: 'en_negociacion',
  fecha_inicio: null,
  fecha_termino: null,
  descripcion: '',
  persona_contacto: '',
  email_contacto: '',
  criterios_cna: [],
  observaciones: '',
  archivo_drive_url: '',
  carreras_habilitadas: [],
  beneficio_creditos: null,
  beneficio_arancel_pct: null,
  cupos_anuales: null,
  para_carrera: '',
};

export default function Convenios() {
  const { isDirector } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [form, setForm] = useState<ConvenioInsert>({ ...EMPTY_FORM });
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [search, setSearch] = useState('');

  const { data: convenios = [], isLoading } = useQuery({
    queryKey: ['convenios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('convenios').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (conv: ConvenioInsert) => {
      const payload: ConvenioInsert = {
        nombre_institucion: conv.nombre_institucion,
        tipo: conv.tipo,
        contraparte: conv.contraparte,
        estado: conv.estado,
        descripcion: conv.descripcion || null,
        persona_contacto: conv.persona_contacto || null,
        email_contacto: conv.email_contacto || null,
        criterios_cna: (conv.criterios_cna && conv.criterios_cna.length > 0) ? conv.criterios_cna : null,
        observaciones: conv.observaciones || null,
        archivo_drive_url: conv.archivo_drive_url || null,
        fecha_inicio: conv.fecha_inicio || null,
        fecha_termino: conv.fecha_termino || null,
        cupos_anuales: conv.cupos_anuales || null,
        beneficio_arancel_pct: conv.beneficio_arancel_pct || null,
        beneficio_creditos: conv.beneficio_creditos || null,
        para_carrera: conv.para_carrera || null,
        carreras_habilitadas: (conv.carreras_habilitadas && conv.carreras_habilitadas.length > 0) ? conv.carreras_habilitadas : null,
      };
      const { error } = await supabase.from('convenios').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      toast.success('Convenio creado exitosamente');
      handleClose();
    },
    onError: (e: any) => toast.error(e.message || 'Error al crear convenio'),
  });

  const handleSelectContraparte = (contraparte: string) => {
    const tpl = TEMPLATES[contraparte] || TEMPLATES.otro;
    setForm({
      ...EMPTY_FORM,
      contraparte: contraparte as any,
      tipo: tpl.tipo || 'colaboracion_institucional',
      estado: tpl.estado || 'en_negociacion',
      descripcion: tpl.descripcion || '',
      criterios_cna: tpl.criterios_cna || [],
    });
    setStep('form');
  };

  const handleClose = () => {
    setOpen(false);
    setStep('select');
    setForm({ ...EMPTY_FORM });
  };

  const handleSubmit = () => {
    if (!form.nombre_institucion.trim()) {
      toast.error('El nombre de la institución es obligatorio');
      return;
    }
    createMutation.mutate(form);
  };

  const updateField = <K extends keyof ConvenioInsert>(key: K, value: ConvenioInsert[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Filters
  const filtered = convenios.filter((c: any) => {
    if (filterEstado !== 'todos' && c.estado !== filterEstado) return false;
    if (search && !c.nombre_institucion?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
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
        {isDirector && (
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
            <Plus size={14} /> Nuevo Convenio
          </Button>
        )}
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

      {/* Filters */}
      {convenios.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar institución..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <Filter size={12} className="mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {ESTADO_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table or empty state */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Cargando convenios...</p>
        </div>
      ) : filtered.length === 0 && convenios.length === 0 ? (
        <div className="rounded-lg border border-dashed border-idma-green/30 bg-card p-12 text-center space-y-4">
          <Handshake size={48} className="mx-auto text-idma-green/40" />
          <h3 className="text-lg font-medium text-foreground">Sin convenios registrados</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Usa el botón "Nuevo Convenio" para crear uno. El sistema sugerirá una plantilla según el tipo de contraparte.
          </p>
          {isDirector && (
            <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5 mt-2">
              <Plus size={14} /> Crear primer convenio
            </Button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No hay convenios que coincidan con el filtro.</p>
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
                {filtered.map((c: any) => {
                  const estado = ESTADO_MAP[c.estado] || ESTADO_MAP.activo;
                  const tipoLabel = TIPO_OPTIONS.find(t => t.value === c.tipo)?.label || c.tipo;
                  const contraLabel = CONTRAPARTE_OPTIONS.find(t => t.value === c.contraparte)?.label || c.contraparte;
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 px-3 font-medium text-foreground">{c.nombre_institucion}</td>
                      <td className="py-2 px-3 text-muted-foreground">{tipoLabel}</td>
                      <td className="py-2 px-3 text-muted-foreground">{contraLabel}</td>
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

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {step === 'select' ? (
            <>
              <DialogHeader>
                <DialogTitle>Nuevo Convenio — Selecciona tipo de contraparte</DialogTitle>
                <DialogDescription>
                  Se aplicará una plantilla con datos pre-cargados según el tipo. Solo deberás completar los campos clave.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CONTRAPARTE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectContraparte(opt.value)}
                    className="rounded-lg border border-border bg-card p-3 text-left hover:border-primary hover:bg-secondary/40 transition-colors group"
                  >
                    <p className="text-sm font-medium text-foreground group-hover:text-primary">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {TEMPLATES[opt.value]?.tipo
                        ? TIPO_OPTIONS.find(t => t.value === TEMPLATES[opt.value]?.tipo)?.label
                        : 'Colaboración'}
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Datos del Convenio</DialogTitle>
                <DialogDescription>
                  Plantilla: {CONTRAPARTE_OPTIONS.find(o => o.value === form.contraparte)?.label}. Revisa y completa los campos clave.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* KEY FIELDS */}
                <div>
                  <Label className="text-xs">Nombre de la Institución *</Label>
                  <Input
                    value={form.nombre_institucion}
                    onChange={e => updateField('nombre_institucion', e.target.value)}
                    placeholder="Ej: Universidad de Chile"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tipo de Convenio</Label>
                    <Select value={form.tipo} onValueChange={v => updateField('tipo', v as any)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIPO_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Estado</Label>
                    <Select value={form.estado} onValueChange={v => updateField('estado', v as any)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADO_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Persona de contacto</Label>
                    <Input
                      value={form.persona_contacto || ''}
                      onChange={e => updateField('persona_contacto', e.target.value)}
                      placeholder="Nombre completo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email de contacto</Label>
                    <Input
                      type="email"
                      value={form.email_contacto || ''}
                      onChange={e => updateField('email_contacto', e.target.value)}
                      placeholder="email@ejemplo.cl"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Fecha inicio</Label>
                    <Input
                      type="date"
                      value={form.fecha_inicio || ''}
                      onChange={e => updateField('fecha_inicio', e.target.value || null)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fecha término</Label>
                    <Input
                      type="date"
                      value={form.fecha_termino || ''}
                      onChange={e => updateField('fecha_termino', e.target.value || null)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Descripción (pre-cargada por plantilla)</Label>
                  <Textarea
                    value={form.descripcion || ''}
                    onChange={e => updateField('descripcion', e.target.value)}
                    rows={3}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Criterios CNA vinculados (sugeridos por plantilla)</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12','C13','C14','C15','C16'].map(c => {
                      const selected = form.criterios_cna?.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            const current = form.criterios_cna || [];
                            updateField('criterios_cna', selected ? current.filter(x => x !== c) : [...current, c]);
                          }}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            selected
                              ? 'bg-idma-green/20 text-idma-green border-idma-green/40'
                              : 'bg-secondary text-muted-foreground border-border hover:border-primary/40'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">URL documento en Drive (opcional)</Label>
                  <Input
                    value={form.archivo_drive_url || ''}
                    onChange={e => updateField('archivo_drive_url', e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Observaciones</Label>
                  <Textarea
                    value={form.observaciones || ''}
                    onChange={e => updateField('observaciones', e.target.value)}
                    rows={2}
                    placeholder="Notas internas..."
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" size="sm" onClick={() => setStep('select')}>
                  ← Cambiar tipo
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Guardando...' : 'Crear Convenio'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
