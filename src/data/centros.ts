export type PipelineStage = {
  name: string;
  items: string[];
};

export type CentroData = {
  id: 'cec' | 'cts' | 'centro-3';
  nombre: string;
  foco: string;
  ingresosMensual: number;
  ocupacionPct: number;
  leadsAbiertos: number;
  actividadesProximas: number;
  conveniosVinculados: number;
  agenda: { fecha: string; titulo: string }[];
  pipeline: PipelineStage[];
};

export const CENTROS_DATA: Record<CentroData['id'], CentroData> = {
  'cec': {
    id: 'cec',
    nombre: 'CEC',
    foco: 'Centro de Ecoturismo y Conservacion',
    ingresosMensual: 2400000,
    ocupacionPct: 42,
    leadsAbiertos: 8,
    actividadesProximas: 5,
    conveniosVinculados: 12,
    agenda: [
      { fecha: '2026-04-20', titulo: 'Workshop turismo inclusivo' },
      { fecha: '2026-04-24', titulo: 'Salida educativa biodiversidad' },
      { fecha: '2026-04-30', titulo: 'Reunion socios territoriales' }
    ],
    pipeline: [
      { name: 'Lead', items: ['Municipio A', 'Fundacion B', 'Empresa C'] },
      { name: 'Contacto', items: ['Colegio D', 'OTEC E'] },
      { name: 'Propuesta', items: ['Corporacion F'] },
      { name: 'Cierre', items: ['ONG G'] }
    ]
  },
  'cts': {
    id: 'cts',
    nombre: 'CTS',
    foco: 'Centro Tecnologico de Sustentabilidad',
    ingresosMensual: 6000000,
    ocupacionPct: 73,
    leadsAbiertos: 14,
    actividadesProximas: 7,
    conveniosVinculados: 21,
    agenda: [
      { fecha: '2026-04-18', titulo: 'Curso fotovoltaico cohorte 2' },
      { fecha: '2026-04-22', titulo: 'Demo soluciones energia' },
      { fecha: '2026-04-29', titulo: 'Mesa tecnica industria' }
    ],
    pipeline: [
      { name: 'Lead', items: ['Empresa H', 'Empresa I', 'Empresa J', 'Empresa K'] },
      { name: 'Contacto', items: ['Empresa L', 'Empresa M', 'Empresa N'] },
      { name: 'Propuesta', items: ['Empresa O', 'Empresa P'] },
      { name: 'Cierre', items: ['Empresa Q', 'Empresa R'] }
    ]
  },
  'centro-3': {
    id: 'centro-3',
    nombre: 'Centro-3',
    foco: 'Casa Ecologica y Aprendizaje Aplicado',
    ingresosMensual: 8800000,
    ocupacionPct: 68,
    leadsAbiertos: 11,
    actividadesProximas: 6,
    conveniosVinculados: 16,
    agenda: [
      { fecha: '2026-04-19', titulo: 'Visita tecnica energia termica' },
      { fecha: '2026-04-23', titulo: 'Taller economia circular' },
      { fecha: '2026-05-02', titulo: 'Jornada comunidad local' }
    ],
    pipeline: [
      { name: 'Lead', items: ['Empresa S', 'Empresa T', 'Municipio U'] },
      { name: 'Contacto', items: ['Fundacion V', 'Empresa W'] },
      { name: 'Propuesta', items: ['Empresa X', 'Empresa Y'] },
      { name: 'Cierre', items: ['Empresa Z'] }
    ]
  }
};
