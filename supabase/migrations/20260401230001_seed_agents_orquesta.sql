-- Seed: 4 agentes operativos La Orquesta IDMA
-- Se ejecuta automáticamente en el próximo deploy de Lovable

INSERT INTO agents (code, area, name, status, workflow_id, model, description, error_rate, items_processed_24h)
VALUES
  ('A1', 'VCM',      'Agente VCM',      'active', 'PLACEHOLDER_A1', 'gemini-2.5-flash', 'Clasificación emails, convenios, Erasmus+, CNA C13/C14', 0, 0),
  ('C1', 'OTEC',     'Agente OTEC',     'active', 'PLACEHOLDER_C1', 'gemini-2.5-flash', 'Gestión OTEC-AMA, cash flow, CRM comercial',             0, 0),
  ('B2', 'Finanzas', 'Agente Finanzas', 'active', 'PLACEHOLDER_B2', 'gemini-2.5-flash', 'Presupuestos, visión estratégica DG, CNA C8',            0, 0),
  ('AD', 'Orquesta', 'Agente Dios',     'active', 'PLACEHOLDER_AD', 'claude-opus-4-6',  'Inteligencia estratégica completa IDMA', 0, 0)
ON CONFLICT (code) DO UPDATE SET
  name        = EXCLUDED.name,
  area        = EXCLUDED.area,
  description = EXCLUDED.description,
  model       = EXCLUDED.model,
  status      = EXCLUDED.status;
