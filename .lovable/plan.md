

# Plan: Status Update para Claude Code + Sync GitHub

## Dos entregables

### 1. Documento de Status Update para Claude Code
Generar un archivo markdown completo en `/mnt/documents/` con el estado actual del sistema para que Claude Code tenga contexto total. Incluye:

- **Arquitectura completa**: 14 páginas, 6 edge functions, 13 tablas, 3 enums, RBAC con `has_role()`
- **Schema de cada tabla** con columnas y tipos exactos
- **Orchestrator API**: las 18 acciones disponibles con payloads de ejemplo
- **Edge Functions**: `cna-advisor`, `financial-advisor`, `acreditation-advisor`, `n8n-webhook`, `orchestrator-api`, `process-document`
- **Selector de modelos IA**: 4 modelos disponibles (Gemini Flash, Gemini Pro, GPT-5, GPT-5 Mini)
- **RLS y seguridad**: roles `director`, `dg`, `staff` + función `has_role()`
- **Estado de datos**: qué tablas tienen datos y cuáles esperan carga
- **Endpoints y payloads** para integración n8n/Railway
- **Lo que falta**: datos financieros, convenios, documentos RAG reales, conexión n8n live

### 2. Preparación GitHub
Para dar acceso a Claude Code al repo:
- El usuario conecta GitHub desde Settings > Connectors > GitHub
- Se crea un repo que sincroniza bidireccionalmente
- Claude Code clona el repo y tiene acceso completo al código
- Combinado con el status document, Claude Code puede analizar todo el ecosistema

## Archivos

| Archivo | Acción |
|---|---|
| `/mnt/documents/claude-code-status-update.md` | Crear — documento exhaustivo con schema, endpoints, estado |

## Notas
- El documento se genera como artifact descargable
- No requiere cambios en el código — es un export de estado
- Claude Code usará este documento + el repo GitHub + la `orchestrator-api` para interactuar con el sistema
- Estimado: ~1 crédito

