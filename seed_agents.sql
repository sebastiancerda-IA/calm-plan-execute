-- Seed: 4 agentes operativos La Orquesta IDMA
-- Ejecutar en: https://supabase.com/dashboard/project/wipeaufqdiohfdtcbhac/sql

INSERT INTO agents (code, area, name, status, workflow_id, model, description, error_rate, items_processed_24h)
VALUES
  ('A1', 'VCM',        'Agente VCM',      'active', 'PLACEHOLDER_A1', 'gemini-2.0-flash',  'Clasificacion emails, convenios, Erasmus+, CNA C13/C14', 0, 0),
  ('C1', 'OTEC',       'Agente OTEC',     'active', 'PLACEHOLDER_C1', 'gemini-2.0-flash',  'Gestion OTEC-AMA, cash flow, CRM comercial',             0, 0),
  ('B2', 'Finanzas',   'Agente Finanzas', 'active', 'PLACEHOLDER_B2', 'gemini-2.0-flash',  'Presupuestos, vision estrategica DG, CNA C8',            0, 0),
  ('AD', 'Orquesta',   'Agente Dios',     'active', 'PLACEHOLDER_AD', 'claude-opus-4-6',   'Inteligencia estrategica completa IDMA - acreditacion, crecimiento, plataforma LMS, ecosistema IA', 0, 0)
ON CONFLICT (code) DO UPDATE SET
  name        = EXCLUDED.name,
  area        = EXCLUDED.area,
  description = EXCLUDED.description,
  model       = EXCLUDED.model,
  status      = EXCLUDED.status;

-- Verificar:
SELECT code, area, name, model, status FROM agents ORDER BY code;