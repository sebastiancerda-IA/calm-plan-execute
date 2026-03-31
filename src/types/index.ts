export type AgentStatus = 'operativo' | 'listo' | 'disenado' | 'futuro' | 'error' | 'procesando';
export type AgentPlatform = 'n8n' | 'claude_project' | 'claude_code' | 'hybrid';
export type Priority = 'critica' | 'alta' | 'media' | 'info';
export type CNALevel = 'N1' | 'N2' | 'N3';

export interface AgentMetric {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
}

export interface Agent {
  id: string;
  code: string;
  name: string;
  description: string;
  area: 'vcm' | 'otec' | 'rectoria' | 'finanzas' | 'acreditacion' | 'rag' | 'sistema';
  color: string;
  colorSecondary?: string;
  status: AgentStatus;
  platform: AgentPlatform;
  trigger: string;
  workflowId?: string;
  lastRun?: string;
  itemsProcessed24h: number;
  errorRate: number;
  criteriaCNA: string[];
  dependencies: string[];
  metrics: AgentMetric[];
}

export interface ClassifiedEmail {
  id: string;
  fecha: string;
  asunto: string;
  de: string;
  categoria: string;
  sub_etiqueta: string;
  prioridad: Priority;
  deadline?: string;
  accion_requerida: boolean;
  accion_resumen: string;
  criterios_cna: string[];
  agente: string;
}

export interface CNACriterion {
  id: string;
  name: string;
  dimension: string;
  currentLevel: CNALevel;
  targetLevel: CNALevel;
  responsibleAgent: string;
  evidenceCount: number;
  gap: string;
  actions: string[];
}

export interface Alert {
  id: string;
  timestamp: string;
  priority: Priority;
  source: string;
  title: string;
  description: string;
  resolved: boolean;
  actionRequired: string;
}

export interface RAGDocument {
  id: string;
  titulo: string;
  fuente: 'gmail' | 'drive' | 'manual';
  agente: string;
  fecha: string;
  categoria: string;
  criterios_cna: string[];
  chunkCount: number;
  score?: number;
}

export interface RAGStats {
  collection: string;
  totalPoints: number;
  totalDocuments: number;
  sources: { gmail: number; drive: number; manual: number };
  jinaTokensUsed: number;
  jinaTokensLimit: number;
  agentDistribution: Record<string, number>;
  lastIndexed: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agentCode: string;
  agentColor: string;
  action: string;
  result: string;
}

export interface InfraService {
  name: string;
  status: 'activo' | 'inactivo' | 'error';
  detail: string;
}
