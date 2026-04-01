/**
 * Export utilities for generating downloadable CSV/Excel-compatible files
 */

export function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFinancialRecords(records: any[]) {
  const header = ['Período', 'Categoría', 'Concepto', 'Tipo', 'Monto', 'Notas', 'Fecha'];
  const rows = records.map(r => [
    r.period, r.category, r.concept, r.record_type,
    String(r.amount), r.notes || '', r.created_at?.split('T')[0] || '',
  ]);
  downloadCSV([header, ...rows], 'finanzas_idma');
}

export function exportConvenios(convenios: any[]) {
  const header = ['Institución', 'Tipo', 'Contraparte', 'Estado', 'Inicio', 'Término', 'Contacto', 'Email', 'CNA', 'Observaciones'];
  const rows = convenios.map(c => [
    c.nombre_institucion, c.tipo, c.contraparte, c.estado,
    c.fecha_inicio || '', c.fecha_termino || '',
    c.persona_contacto || '', c.email_contacto || '',
    (c.criterios_cna || []).join(', '), c.observaciones || '',
  ]);
  downloadCSV([header, ...rows], 'convenios_idma');
}

export function exportCNAMatrix(dimensions: any[]) {
  const header = ['ID', 'Nombre', 'Dimensión', 'Nivel Actual', 'Nivel Meta', 'Brecha', 'Evidencias', 'Acciones'];
  const rows: string[][] = [];
  dimensions.forEach(dim => {
    dim.criteria.forEach((c: any) => {
      rows.push([
        c.id, c.name, dim.name, c.currentLevel, c.targetLevel,
        c.gap || '', String(c.evidenceCount), (c.actions || []).join('; '),
      ]);
    });
  });
  downloadCSV([header, ...rows], 'cna_matrix_idma');
}
