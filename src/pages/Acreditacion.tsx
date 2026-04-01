import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCNA } from '@/hooks/useSupabaseCNA';
import { Upload, FileText, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BUCKET = 'acreditation-docs';

export default function Acreditacion() {
  const [uploading, setUploading] = useState(false);
  const [selectedCriterio, setSelectedCriterio] = useState('');
  const [selectedType, setSelectedType] = useState('evidencia');
  const { criteria } = useSupabaseCNA();

  const { data: documents = [], refetch } = useQuery({
    queryKey: ['acreditation_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acreditation_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${selectedType}/${selectedCriterio || 'general'}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('acreditation_documents')
        .insert({
          title: file.name.replace(/\.[^.]+$/, ''),
          document_type: selectedType,
          criterio_cna: selectedCriterio || null,
          file_path: filePath,
          processed: false,
        });
      if (insertError) throw insertError;

      toast.success('Documento subido correctamente');
      refetch();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Group by type
  const byType = {
    informe_anterior: documents.filter((d: any) => d.document_type === 'informe_anterior'),
    avance_actual: documents.filter((d: any) => d.document_type === 'avance_actual'),
    evidencia: documents.filter((d: any) => d.document_type === 'evidencia'),
  };

  // Evidence count per criterio
  const evidenceByCriterio: Record<string, number> = {};
  documents.forEach((d: any) => {
    if (d.criterio_cna) {
      evidenceByCriterio[d.criterio_cna] = (evidenceByCriterio[d.criterio_cna] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Documentos de Acreditación</h1>
        <p className="text-xs text-muted-foreground">Carga y gestión de evidencias para CNA 2027</p>
      </div>

      {/* Upload zone */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Cargar documento
        </h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-secondary border border-border rounded px-2 py-1.5 text-xs text-foreground"
            >
              <option value="evidencia">Evidencia</option>
              <option value="informe_anterior">Informe anterior</option>
              <option value="avance_actual">Avance actual</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Criterio CNA</label>
            <select
              value={selectedCriterio}
              onChange={(e) => setSelectedCriterio(e.target.value)}
              className="bg-secondary border border-border rounded px-2 py-1.5 text-xs text-foreground"
            >
              <option value="">General</option>
              {criteria.map((c: any) => (
                <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs cursor-pointer hover:bg-primary/90 transition-colors">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.doc,.docx,.xlsx,.pptx" />
          </label>
        </div>
      </div>

      {/* Evidence matrix by criterio */}
      <div className="rounded-md border border-border bg-card p-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
          Evidencias por criterio
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {criteria.map((c: any) => {
            const count = evidenceByCriterio[c.id] || 0;
            return (
              <div
                key={c.id}
                className="flex flex-col items-center p-2 rounded border border-border bg-secondary/50"
              >
                <span className="text-[10px] font-mono font-bold text-foreground">{c.id}</span>
                <span className={`text-lg font-bold ${count > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {count}
                </span>
                <span className="text-[8px] text-muted-foreground">docs</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document lists by type */}
      {(['informe_anterior', 'avance_actual', 'evidencia'] as const).map((type) => {
        const docs = byType[type];
        const labels: Record<string, string> = {
          informe_anterior: 'Informe anterior',
          avance_actual: 'Avance actual',
          evidencia: 'Evidencias',
        };
        if (docs.length === 0) return null;
        return (
          <div key={type} className="rounded-md border border-border bg-card p-4">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
              {labels[type]} ({docs.length})
            </h3>
            <div className="space-y-1">
              {docs.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                  <FileText size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">{doc.title}</span>
                  {doc.criterio_cna && (
                    <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                      {doc.criterio_cna}
                    </span>
                  )}
                  {doc.processed && <Check size={12} className="text-green-500" />}
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(doc.uploaded_at).toLocaleDateString('es-CL')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {documents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No hay documentos cargados aún. Sube el primer documento de acreditación.
        </div>
      )}
    </div>
  );
}
