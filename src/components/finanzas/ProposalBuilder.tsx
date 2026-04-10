import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Download, Trash2, FileText, Send, CheckCircle, DollarSign } from 'lucide-react';
import { downloadCSV } from '@/lib/exportUtils';

type LineItem = { servicio: string; cantidad: number; precio_unitario: number; subtotal: number };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  borrador: { label: 'Borrador', color: 'bg-muted text-muted-foreground' },
  enviada: { label: 'Enviada', color: 'bg-primary/20 text-primary' },
  negociacion: { label: 'Negociación', color: 'bg-yellow-500/20 text-yellow-400' },
  aceptada: { label: 'Aceptada', color: 'bg-idma-green/20 text-idma-green' },
  rechazada: { label: 'Rechazada', color: 'bg-destructive/20 text-destructive' },
};

const TYPE_OPTIONS = [
  { value: 'capacitacion', label: 'Capacitación OTEC' },
  { value: 'consultoria', label: 'Consultoría' },
  { value: 'servicio', label: 'Servicio técnico' },
  { value: 'proyecto', label: 'Proyecto especial' },
];

const TEMPLATES: Record<string, { description: string; lines: LineItem[] }> = {
  capacitacion: {
    description: 'Propuesta de capacitación SENCE o libre para empresa cliente.',
    lines: [
      { servicio: 'Diseño instruccional', cantidad: 1, precio_unitario: 0, subtotal: 0 },
      { servicio: 'Ejecución curso (por participante)', cantidad: 20, precio_unitario: 0, subtotal: 0 },
      { servicio: 'Material didáctico', cantidad: 1, precio_unitario: 0, subtotal: 0 },
    ],
  },
  consultoria: {
    description: 'Propuesta de consultoría técnica o ambiental.',
    lines: [
      { servicio: 'Diagnóstico inicial', cantidad: 1, precio_unitario: 0, subtotal: 0 },
      { servicio: 'Informe técnico', cantidad: 1, precio_unitario: 0, subtotal: 0 },
      { servicio: 'Horas de consultoría', cantidad: 10, precio_unitario: 0, subtotal: 0 },
    ],
  },
  servicio: {
    description: 'Propuesta de servicio técnico especializado.',
    lines: [
      { servicio: 'Servicio técnico', cantidad: 1, precio_unitario: 0, subtotal: 0 },
      { servicio: 'Materiales', cantidad: 1, precio_unitario: 0, subtotal: 0 },
    ],
  },
  proyecto: {
    description: 'Propuesta de proyecto especial con entregables definidos.',
    lines: [
      { servicio: 'Planificación y gestión', cantidad: 1, precio_unitario: 0, subtotal: 0 },
      { servicio: 'Ejecución', cantidad: 1, precio_unitario: 0, subtotal: 0 },
      { servicio: 'Informe final', cantidad: 1, precio_unitario: 0, subtotal: 0 },
    ],
  },
};

export function ProposalBuilder() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [proposalType, setProposalType] = useState('capacitacion');
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientRut, setClientRut] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['commercial_proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commercial_proposals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const totalAmount = lineItems.reduce((s, l) => s + l.subtotal, 0);
      const { error } = await supabase.from('commercial_proposals').insert({
        title,
        proposal_type: proposalType,
        client_name: clientName,
        client_rut: clientRut || null,
        client_email: clientEmail || null,
        description: description || null,
        valid_until: validUntil || null,
        notes: notes || null,
        line_items: lineItems as any,
        total_amount: totalAmount,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial_proposals'] });
      toast.success('Propuesta creada');
      resetForm();
    },
    onError: () => toast.error('Error al crear propuesta'),
  });

  const resetForm = () => {
    setOpen(false);
    setStep(1);
    setTitle('');
    setClientName('');
    setClientRut('');
    setClientEmail('');
    setDescription('');
    setValidUntil('');
    setNotes('');
    setLineItems([]);
    setProposalType('capacitacion');
  };

  const selectType = (type: string) => {
    setProposalType(type);
    const tpl = TEMPLATES[type];
    if (tpl) {
      setDescription(tpl.description);
      setLineItems([...tpl.lines]);
    }
    setStep(2);
  };

  const updateLine = (i: number, field: keyof LineItem, val: string | number) => {
    const copy = [...lineItems];
    (copy[i] as any)[field] = val;
    if (field === 'cantidad' || field === 'precio_unitario') {
      copy[i].subtotal = copy[i].cantidad * copy[i].precio_unitario;
    }
    setLineItems(copy);
  };

  const addLine = () => setLineItems([...lineItems, { servicio: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
  const removeLine = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i));

  const totalAmount = lineItems.reduce((s, l) => s + l.subtotal, 0);

  const filtered = proposals.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search && !p.client_name.toLowerCase().includes(search.toLowerCase()) && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportProposals = () => {
    const header = ['Cliente', 'RUT', 'Email', 'Título', 'Tipo', 'Estado', 'Monto', 'Válida hasta', 'Fecha'];
    const rows = filtered.map(p => [
      p.client_name, p.client_rut || '', p.client_email || '',
      p.title, p.proposal_type, p.status,
      String(p.total_amount), p.valid_until || '',
      p.created_at?.split('T')[0] || '',
    ]);
    downloadCSV([header, ...rows], 'propuestas_idma');
  };

  // Metrics
  const total = proposals.length;
  const enviadas = proposals.filter(p => p.status === 'enviada').length;
  const aceptadas = proposals.filter(p => p.status === 'aceptada').length;
  const pipeline = proposals.filter(p => ['enviada', 'negociacion'].includes(p.status)).reduce((s, p) => s + Number(p.total_amount), 0);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, icon: FileText, color: 'text-foreground' },
          { label: 'Enviadas', value: enviadas, icon: Send, color: 'text-primary' },
          { label: 'Aceptadas', value: aceptadas, icon: CheckCircle, color: 'text-idma-green' },
          { label: 'Pipeline', value: `$${(pipeline / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-yellow-400' },
        ].map(m => (
          <div key={m.label} className="rounded-md border border-border bg-card p-3 flex items-center gap-3">
            <m.icon size={16} className={m.color} />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
              <p className="text-sm font-semibold text-foreground">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todos</SelectItem>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filtered.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportProposals} className="h-8 text-xs">
            <Download size={12} className="mr-1" /> CSV
          </Button>
        )}
        <Button size="sm" onClick={() => setOpen(true)} className="h-8 text-xs">
          <Plus size={12} className="mr-1" /> Nueva
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-xs text-muted-foreground text-center py-8">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-8 italic">
          {proposals.length === 0 ? 'Sin propuestas. Crea la primera.' : 'Sin resultados para el filtro.'}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium hidden sm:table-cell">Título</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Tipo</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Estado</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Monto</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium hidden lg:table-cell">Válida</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = STATUS_MAP[p.status] || STATUS_MAP.borrador;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 text-foreground font-medium">{p.client_name}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{p.title}</td>
                    <td className="px-3 py-2 text-muted-foreground capitalize">{p.proposal_type}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">${(Number(p.total_amount) / 1000000).toFixed(1)}M</td>
                    <td className="px-3 py-2 text-right text-muted-foreground hidden lg:table-cell">{p.valid_until || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Dialog */}
      <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {step === 1 ? 'Selecciona tipo de propuesta' : 'Nueva propuesta comercial'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {step === 1 ? 'El tipo pre-configura servicios típicos.' : 'Completa los datos del cliente y cotización.'}
            </DialogDescription>
          </DialogHeader>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3 py-2">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => selectType(t.value)}
                  className="border border-border rounded-lg p-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <p className="text-xs font-medium text-foreground">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{TEMPLATES[t.value]?.description.slice(0, 60)}...</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {/* Client info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Cliente *</Label>
                  <Input value={clientName} onChange={e => setClientName(e.target.value)} className="text-xs h-8 mt-1" placeholder="Nombre empresa" />
                </div>
                <div>
                  <Label className="text-xs">RUT</Label>
                  <Input value={clientRut} onChange={e => setClientRut(e.target.value)} className="text-xs h-8 mt-1" placeholder="12.345.678-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email contacto</Label>
                  <Input value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="text-xs h-8 mt-1" placeholder="contacto@empresa.cl" />
                </div>
                <div>
                  <Label className="text-xs">Válida hasta</Label>
                  <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="text-xs h-8 mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Título propuesta *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="text-xs h-8 mt-1" placeholder="Ej: Capacitación SSO para Minera X" />
              </div>
              <div>
                <Label className="text-xs">Descripción</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="text-xs mt-1" rows={2} />
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Líneas de cotización</Label>
                  <Button variant="ghost" size="sm" onClick={addLine} className="h-6 text-[10px]">
                    <Plus size={10} className="mr-1" /> Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Input
                        value={item.servicio}
                        onChange={e => updateLine(i, 'servicio', e.target.value)}
                        className="text-xs h-7 flex-1"
                        placeholder="Servicio"
                      />
                      <Input
                        type="number"
                        value={item.cantidad || ''}
                        onChange={e => updateLine(i, 'cantidad', Number(e.target.value))}
                        className="text-xs h-7 w-16"
                        placeholder="Cant."
                      />
                      <Input
                        type="number"
                        value={item.precio_unitario || ''}
                        onChange={e => updateLine(i, 'precio_unitario', Number(e.target.value))}
                        className="text-xs h-7 w-24"
                        placeholder="P. Unit."
                      />
                      <span className="text-[10px] font-mono text-muted-foreground w-20 text-right">
                        ${(item.subtotal / 1000).toFixed(0)}K
                      </span>
                      <button onClick={() => removeLine(i)} className="text-destructive hover:text-destructive/80">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                {lineItems.length > 0 && (
                  <p className="text-[10px] text-right text-muted-foreground mt-1">
                    Total: <span className="text-foreground font-mono">${(totalAmount / 1000000).toFixed(2)}M</span>
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Notas</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="text-xs mt-1" rows={2} />
              </div>
            </div>
          )}

          {step === 2 && (
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs">Atrás</Button>
              <Button
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || !clientName.trim() || createMutation.isPending}
                className="text-xs"
              >
                {createMutation.isPending ? 'Creando...' : 'Crear propuesta'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
