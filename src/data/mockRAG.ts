import { RAGDocument, RAGStats } from '@/types';

export const ragStats: RAGStats = {
  collection: 'idma_knowledge',
  totalPoints: 51,
  totalDocuments: 51,
  sources: { gmail: 51, drive: 0, manual: 0 },
  jinaTokensUsed: 3700,
  jinaTokensLimit: 1000000,
  agentDistribution: { vcm: 48, otec: 3 },
  lastIndexed: '2026-03-30T23:00:00',
};

export const mockDocuments: RAGDocument[] = [
  { id: 'doc1', titulo: 'Convenio Marco Municipalidad Providencia', fuente: 'gmail', agente: 'A1', fecha: '2026-03-28', categoria: 'VCM_INSTITUCIONAL', criterios_cna: ['C13', 'C14'], chunkCount: 4 },
  { id: 'doc2', titulo: 'Erasmus+ KA171 Partnership Intent', fuente: 'gmail', agente: 'A1', fecha: '2026-03-27', categoria: 'ERASMUS', criterios_cna: ['C13', 'C14', 'C15'], chunkCount: 6 },
  { id: 'doc3', titulo: 'Programa GENERA Informe Q4 2025', fuente: 'gmail', agente: 'A1', fecha: '2026-03-25', categoria: 'FONDOS_NACIONALES', criterios_cna: ['C13', 'C14'], chunkCount: 8 },
  { id: 'doc4', titulo: 'Cotización SENCE Minera Atacama', fuente: 'gmail', agente: 'C1', fecha: '2026-03-30', categoria: 'SENCE', criterios_cna: ['C4'], chunkCount: 3 },
  { id: 'doc5', titulo: 'Acta Consejo Académico Marzo 2026', fuente: 'gmail', agente: 'A1', fecha: '2026-03-20', categoria: 'VCM_INSTITUCIONAL', criterios_cna: ['C6', 'C10'], chunkCount: 5 },
  { id: 'doc6', titulo: 'Propuesta Consultoría EcoSur', fuente: 'gmail', agente: 'A1', fecha: '2026-03-22', categoria: 'CONSULTORA', criterios_cna: ['C14', 'C15'], chunkCount: 4 },
  { id: 'doc7', titulo: 'Red Campus Sustentable — Seminario Abril', fuente: 'gmail', agente: 'A1', fecha: '2026-03-19', categoria: 'VCM_INSTITUCIONAL', criterios_cna: ['C13'], chunkCount: 2 },
  { id: 'doc8', titulo: 'CORFO Innovación Social — Estado Postulación', fuente: 'gmail', agente: 'A1', fecha: '2026-03-18', categoria: 'FONDOS_NACIONALES', criterios_cna: ['C13', 'C15'], chunkCount: 3 },
  { id: 'doc9', titulo: 'Matrícula Energías Renovables 2026-2', fuente: 'gmail', agente: 'C1', fecha: '2026-03-17', categoria: 'MATRICULA', criterios_cna: ['C1', 'C3'], chunkCount: 2 },
  { id: 'doc10', titulo: 'Visita Técnica Torres del Paine — Coordinación', fuente: 'gmail', agente: 'A1', fecha: '2026-03-15', categoria: 'VCM_INSTITUCIONAL', criterios_cna: ['C13', 'C14'], chunkCount: 3 },
  { id: 'doc11', titulo: 'Minds On Earth PIF Guidelines', fuente: 'gmail', agente: 'A1', fecha: '2026-03-14', categoria: 'FONDOS_NACIONALES', criterios_cna: ['C13', 'C14'], chunkCount: 7 },
  { id: 'doc12', titulo: 'Renovación Franquicia SENCE 2026', fuente: 'gmail', agente: 'C1', fecha: '2026-03-12', categoria: 'SENCE', criterios_cna: ['C4'], chunkCount: 4 },
];

export const driveFolders = [
  { name: '01_Finanzas', status: 'pendiente', docs: 0 },
  { name: '02_Rectoria', status: 'pendiente', docs: 0 },
  { name: '03_Docencia', status: 'pendiente', docs: 0 },
  { name: '04_VCM', status: 'pendiente', docs: 0 },
  { name: '05_Calidad', status: 'pendiente', docs: 0 },
  { name: '06_OTEC', status: 'pendiente', docs: 0 },
];
