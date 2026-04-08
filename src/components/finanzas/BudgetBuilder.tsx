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
import { Plus, Search, Download, Trash2, ClipboardList, CheckCircle, PlayCircle, DollarSign } from 'lucide-react';
import { downloadCSV } from '@/lib/exportUtils';

type LineItem = { concepto: string; monto: number; categoria: string };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  borrador: { label: 'Borrador', color: 'bg-muted text-muted-foreground' },
  aprobado: { label: 'Aprobado', color: 'bg-primary/20 text-primary' },
  en_ejecucion: { label: 'En ejecución', color: 'bg-yellow-500/20 text-yellow-400' },
  cerrado: { label: 'Cerrado', color: 'bg-destructive/20 text-destructive' },
};

const TYPE_OPTIONS = [
  { value: 'operativo', label: 'Operativo' },
  { value: 'proyecto', label: 'Proyecto' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'evento', label: 'Evento' },
];

const TEMPLATES: Record<string, { description: string; lines: LineItem[] }> = {
  operativo: {
    description: 'Presupuesto operativo mensual/trimestral para gastos recurrentes de la institución.',
    lines: [
      { concepto: 'Remuneraciones', monto: 0, categoria: 'personal' },
      { concepto: 'Arriendo y servicios', monto: 0, categoria: 'infraestructura' },
      { concepto: 'Materiales y suministros', monto: 0, categoria: 'operaciones' },
    ],
  },
  proyecto: {
    description: 'Presupuesto para proyecto específico con alcance y plazos definidos.',
    lines: [
      { concepto: 'Honorarios profesionales', monto: 0, categoria: 'personal' },
      { concepto: 'Equipamiento', monto: 0, categoria: 'inversión' },
      { concepto: 'Gastos operacionales', monto: 0, categoria: 'operaciones' },
    ],
  },
  departamento: {
    description: 'Presupuesto asignado a un área o departamento para el período.',
    lines: [
      { concepto: 'Personal del área', monto: 0, categoria: 'personal' },
      { concepto: 'Capacitación', monto: 0, categoria: 'desarrollo' },
      { concepto: 'Materiales', monto: 0, categoria: 'operaciones' },
    ],
  },
  evento: {
    description: 'Presupuesto para evento institucional, ceremonia o actividad especial.',
    lines: [
      { concepto: 'Logística y catering', monto: 0, categoria: 'eventos' },
      { concepto: 'Difusión y comunicaciones', monto: 0, categoria: 'marketing' },
      { concepto: 'Arriendo de espacios', monto: 0, categoria: 'infraestructura' },
    ],
  },
};

export function BudgetBuilder() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [budgetType, setBudgetType] = useState('operativo');
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const totalAmount = lineItems.reduce((s, l) => s + l.monto, 0);
      const { error } = await supabase.from('budgets').insert({
        title,
        budget_type: budgetType,
        period,
        department: department || null,
        description: description || null,
        notes: notes || null,
        line_items: lineItems as any,
        total_amount: totalAmount,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Presupuesto creado');
      resetForm();
    },
    onError: () => toast.error('Error al crear presupuesto'),
  });

  const resetForm = () => {
    setOpen(false);
    setStep(1);
    setTitle('');
    setPeriod('');
    setDepartment('');
    setDescription('');
    setNotes('');
    setLineItems([]);
    setBudgetType('operativo');
  };

  const selectType = (type: string) => {
    setBudgetType(type);
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
    setLineItems(copy);
  };

  const addLine = () => setLineItems([...lineItems, { concepto: '', monto: 0, categoria: 'general' }]);
  const removeLine = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i));

  const totalAmount = lineItems.reduce((s, l) => s + l.monto, 0);

  const filtered = budgets.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportBudgets = () => {
    const header = ['Título', 'Tipo', 'Estado', 'Período', 'Departamento', 'Monto Total', 'Ejecutado', 'Fecha'];
    const rows = filtered.map(b => [
      b.title, b.budget_type, b.status, b.period,
      b.department || '', String(b.total_amount), String(b.allocated_amount || 0),
      b.created_at?.split('T')[0] || '',
    ]);
    downloadCSV([header, ...rows], 'presupuestos_idma');
  };

  // Metrics
  const total = budgets.length;
  const aprobados = budgets.filter(b => b.status === 'aprobado').length;
  const enEjecucion = budgets.filter(b => b.status === 'en_ejecucion').length;
  const montoTotal = budgets.reduce((s, b) => s + Number(b.total_amount), 0);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, icon: ClipboardList, color: 'text-foreground' },
          { label: 'Aprobados', value: aprobados, icon: CheckCircle, color: 'text-primary' },
          { label: 'En ejecución', value: enEjecucion, icon: PlayCircle, color: 'text-yellow-400' },
          { label: 'Monto total', value: `$${(montoTotal / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-primary' },
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
            placeholder="Buscar presupuesto..."
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
          <Button variant="outline" size="sm" onClick={exportBudgets} className="h-8 text-xs">
            <Download size={12} className="mr-1" /> CSV
          </Button>
        )}
        <Button size="sm" onClick={() => setOpen(true)} className="h-8 text-xs">
          <Plus size={12} className="mr-1" /> Nuevo
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-xs text-muted-foreground text-center py-8">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-8 italic">
          {budgets.length === 0 ? 'Sin presupuestos. Crea el primero.' : 'Sin resultados para el filtro.'}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Título</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Tipo</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium hidden sm:table-cell">Depto.</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Estado</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Monto</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium hidden lg:table-cell">% Ejec.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const pct = Number(b.total_amount) > 0
                  ? Math.round((Number(b.allocated_amount || 0) / Number(b.total_amount)) * 100)
                  : 0;
                const st = STATUS_MAP[b.status] || STATUS_MAP.borrador;
                return (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 text-foreground font-medium">{b.title}</td>
                    <td className="px-3 py-2 text-muted-foreground capitalize">{b.budget_type}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{b.department || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">${(Number(b.total_amount) / 1000000).toFixed(1)}M</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground hidden lg:table-cell">{pct}%</td>
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
              {step === 1 ? 'Selecciona tipo de presupuesto' : 'Nuevo presupuesto'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {step === 1 ? 'El tipo pre-configura categorías y líneas.' : 'Completa los detalles.'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Título *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="text-xs h-8 mt-1" placeholder="Ej: Operativo Q2 2025" />
                </div>
                <div>
                  <Label className="text-xs">Período *</Label>
                  <Input value={period} onChange={e => setPeriod(e.target.value)} className="text-xs h-8 mt-1" placeholder="Ej: 2025-Q2" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Departamento</Label>
                <Input value={department} onChange={e => setDepartment(e.target.value)} className="text-xs h-8 mt-1" placeholder="Ej: Dirección Académica" />
              </div>
              <div>
                <Label className="text-xs">Descripción</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="text-xs mt-1" rows={2} />
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Líneas de detalle</Label>
                  <Button variant="ghost" size="sm" onClick={addLine} className="h-6 text-[10px]">
                    <Plus size={10} className="mr-1" /> Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={item.concepto}
                        onChange={e => updateLine(i, 'concepto', e.target.value)}
                        className="text-xs h-7 flex-1"
                        placeholder="Concepto"
                      />
                      <Input
                        type="number"
                        value={item.monto || ''}
                        onChange={e => updateLine(i, 'monto', Number(e.target.value))}
                        className="text-xs h-7 w-24"
                        placeholder="Monto"
                      />
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
                disabled={!title.trim() || !period.trim() || createMutation.isPending}
                className="text-xs"
              >
                {createMutation.isPending ? 'Creando...' : 'Crear presupuesto'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
