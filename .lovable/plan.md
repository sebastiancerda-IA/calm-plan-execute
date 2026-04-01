

# Plan: Asesor Financiero IA + Backend n8n/Railway Ready

## Dos entregables principales

---

## 1. Edge Function `financial-advisor` — Super Chatbot Financiero

Nueva edge function con el mismo patrón de streaming SSE del `acreditation-advisor`, pero con personalidad de **analista financiero experto**.

### System prompt especializado
- Experto en finanzas de instituciones de educación superior chilenas
- Conocimiento de normativa tributaria chilena (SII, IVA, renta)
- Estrategia de negocios, inversiones, flujo de caja, sostenibilidad
- Análisis de estructura de costos educacionales
- Proyecciones financieras y escenarios
- Contexto dinámico: lee `financial_records`, `institutional_metrics`, `otec_programs` (revenue) en cada request

### Modos del chatbot
- **Analista**: constructivo, propone estrategias de optimización
- **Auditor**: riguroso, busca inconsistencias y riesgos

### Contexto dinámico inyectado
- Todos los `financial_records` (ingresos/gastos por período)
- Métricas institucionales (matrículas, retención)
- Revenue de programas OTEC activos
- Balance, márgenes calculados server-side

### Seguridad
- Valida JWT del usuario
- Verifica rol `director` o `dg` via `user_roles` antes de responder
- Si no tiene rol autorizado, retorna 403

---

## 2. UI del Chat Financiero en `/finanzas`

### Tabs en la página Finanzas
- **Dashboard** (actual): KPIs, tabla ingresos/gastos
- **Consultar Asesor**: Chat streaming con el bot financiero

### Componentes del chat
- Selector de modo: Analista / Auditor
- Chips de consultas sugeridas:
  - "¿Cuál es nuestra estructura de costos?"
  - "Proyección de flujo de caja a 6 meses"
  - "¿Cómo optimizar el margen operativo?"
  - "Análisis de rentabilidad por programa OTEC"
  - "Riesgos tributarios actuales"
- Badge de contexto: "X registros financieros cargados"
- Markdown rendering con `react-markdown`

---

## 3. Preparación Backend para n8n + Railway

### Endpoint `orchestrator-api` — nuevas acciones
- `get_financial_summary`: Devuelve resumen agregado (totales por período, balance, margen) — listo para que n8n lo consuma
- `get_system_health`: Estado de salud de todos los agentes + últimas ejecuciones — para monitoring desde Railway

### Estructura para sincronización n8n → Orquesta
El `n8n-webhook` ya existe. Se agregan validaciones para nuevos event types:
- `financial_sync`: para cuando n8n envíe datos financieros desde Google Sheets
- `otec_sync`: para sincronizar programas OTEC

### Documentación en Settings
En el panel n8n de `/settings`, agregar sección con los payloads de ejemplo para:
- Sincronización financiera
- Sincronización OTEC
- Health check desde Railway

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `supabase/functions/financial-advisor/index.ts` | Crear — chatbot financiero con streaming SSE |
| `src/pages/Finanzas.tsx` | Agregar tabs Dashboard/Asesor + chat UI |
| `supabase/functions/orchestrator-api/index.ts` | Agregar `get_financial_summary` y `get_system_health` |
| `supabase/functions/n8n-webhook/index.ts` | Agregar handlers `financial_sync` y `otec_sync` |
| `src/pages/Settings.tsx` | Agregar ejemplos de payloads n8n financieros |

## Notas Técnicas
- `financial-advisor` usa `LOVABLE_API_KEY` (ya disponible) con `google/gemini-3-flash-preview`
- Seguridad: valida JWT + consulta `user_roles` con service role key antes de procesar
- El chat reutiliza el mismo patrón de streaming SSE del `acreditation-advisor`
- No se agregan dependencias — `react-markdown` ya está instalado
- Railway se conecta via los mismos endpoints HTTP del orchestrator-api (X-Api-Key auth)
- Estimado: ~5 créditos

