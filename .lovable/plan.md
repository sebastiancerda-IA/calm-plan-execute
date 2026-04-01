

# Plan Reformulado: Sprint Nocturno + Preparación para Día D

## Cambios vs Plan Anterior

1. **Tareas por agente**: Enfocadas en hacer funcionar el sistema al 100%, NO en acreditación (eso viene después de cargar datos mañana)
2. **RAG**: No duplicamos infraestructura RAG — preparamos una API bridge para que Claude Code pueda leer/escribir en la Orquesta
3. **A4 Informe**: Se redefine como preparación para que Claude Code tenga acceso completo al sistema via API
4. **Bot asesor**: Se potencia con streaming + contexto dinámico de la DB

---

## Bloque 1: API Bridge para Claude Code (~3 créditos)

Nueva Edge Function `orchestrator-api` — un endpoint REST que Claude Code puede llamar para leer y escribir en la Orquesta.

**Endpoints (todo en una sola Edge Function con routing por `action`):**

```text
POST /orchestrator-api
Body: { action: "get_status" }        → Estado completo: agentes, alertas, criterios CNA, métricas
Body: { action: "get_agents" }        → Lista de agentes con estado
Body: { action: "get_criteria" }      → Estado CNA completo
Body: { action: "get_alerts" }        → Alertas activas
Body: { action: "get_documents" }     → Documentos de acreditación cargados
Body: { action: "get_metrics" }       → Métricas institucionales
Body: { action: "update_agent", ... } → Actualizar estado de agente
Body: { action: "create_alert", ... } → Crear alerta
Body: { action: "add_execution", ... }→ Registrar ejecución
Body: { action: "add_rag_doc", ... }  → Registrar documento en RAG
```

Esto le da a Claude Code control total sobre la Orquesta. Mañana tú le das la URL del endpoint + la API key y Claude Code puede:
- Leer todo el estado del sistema
- Escribir ejecuciones cuando los agentes corren
- Crear alertas
- Registrar documentos que procese via su propio RAG (Qdrant)
- Generar el super-análisis de optimización leyendo todo

**La sincronización con tu RAG de Claude Code**: No replicamos Qdrant aquí. Claude Code usa su Qdrant. La Orquesta registra en `rag_documents` los metadatos (título, fuente, criterio CNA, chunks). Claude Code llama `add_rag_doc` cada vez que indexa algo → la Orquesta lo refleja.

## Bloque 2: Tareas por Agente — Funcionalidad del Sistema (~3 créditos)

Nueva tabla `agent_tasks` con tareas centradas en hacer el sistema operativo:

**Categorías:**
- `sistema`: Configurar, conectar, activar componentes
- `datos`: Cargar, validar, limpiar data
- `integracion`: Conectar servicios externos
- `monitoreo`: Verificar funcionamiento continuo

**Ejemplos de seed data (no acreditación, sino operación):**
- A1 VCM: "Conectar workflow n8n de clasificación con webhook" (integración)
- A1 VCM: "Validar que emails se clasifican correctamente en 5 categorías" (monitoreo)
- C1 OTEC: "Cargar listado actualizado de cursos SENCE activos" (datos)
- A3 RAG: "Verificar conexión Qdrant y estado de colección" (sistema)
- A3 RAG: "Indexar documentos de acreditación anterior" (datos)
- B2 Finanzas: "Cargar balance Q1 2025 en métricas institucionales" (datos)
- AD Dios: "Configurar webhook de reportes automáticos" (integración)
- B3 Calidad: "Conectar pipeline de procesamiento de documentos" (integración)

UI en `AgentDetail.tsx`: sección con lista de tareas, filtro por categoría, botón para marcar completada. RLS: SELECT + UPDATE para authenticated.

## Bloque 3: Bot Asesor Potenciado con Streaming (~3 créditos)

Edge Function `acreditation-advisor` con streaming SSE (no el `cna-advisor` actual que devuelve bloque completo).

**Potenciadores propuestos:**
1. **Contexto dinámico completo**: Lee criterios CNA + alertas + documentos cargados + métricas institucionales + programas OTEC antes de cada respuesta — el bot sabe todo
2. **Memoria de conversación**: Envía historial completo de mensajes al modelo para que la conversación sea coherente
3. **System prompt con benchmarks**: Incluye datos de las 8 instituciones comparables (Juan Bohon, Projazz, Ecole, San Agustín, Virginio Gómez, ENAC, UCV) con sus resultados de acreditación
4. **Modo dual**: "Asesor" (guía estratégica) y "Evaluador" (simula par evaluador CNA, es duro y crítico)
5. **Streaming token-by-token**: Respuestas en tiempo real, no bloques

Panel de chat integrado en `/acreditacion` con:
- Input de texto + historial scrollable
- Botón toggle "Modo Asesor / Modo Evaluador"
- Renderizado markdown de respuestas
- Indicador de streaming activo

## Bloque 4: Preparación del Terreno para Mañana (~2 créditos)

### 4a. Página de Estado del Sistema
Expandir Settings con sección "Estado del Sistema para Claude Code":
- URL del endpoint `orchestrator-api`
- Payload examples listos para copiar
- Checklist de lo que Claude Code necesita hacer mañana:
  - Leer estado completo del sistema
  - Analizar gaps y generar super-prompt de optimización
  - Conectar sus agentes n8n con el webhook
  - Registrar documentos RAG procesados

### 4b. Dashboard Checklist de Carga
Componente en Dashboard mostrando qué data falta cargar:
- Informe acreditación anterior (PDF)
- Carpeta avance actual con asesores
- Correos sistematizados de asesores
- Datos de matrículas actualizados
- Balance financiero Q1 2025
Cada item con estado (pendiente/cargado) y link directo a donde cargarlo.

### 4c. Edge Function `process-document`
Al subir un PDF a acreditation-docs:
1. Registra en `acreditation_documents`
2. Genera resumen con Lovable AI (gemini-3-flash-preview)
3. Marca `processed = true`
4. Así cuando Claude Code lea los documentos mañana, ya tendrá resúmenes

---

## Orden de Ejecución

1. **Bloque 1** — API Bridge para Claude Code (la pieza clave)
2. **Bloque 2** — Tareas por agente (operación del sistema)
3. **Bloque 3** — Bot asesor con streaming
4. **Bloque 4** — Checklist + process-document

**Total estimado: ~11 créditos**

## Notas Técnicas

- `orchestrator-api` usa `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS — autenticado via header `X-Api-Key` que validamos contra un secret
- `agent_tasks` necesita RLS SELECT + UPDATE para authenticated
- El bot asesor usa streaming SSE siguiendo el patrón documentado de Lovable AI
- `process-document` se dispara client-side post-upload (no hay triggers de storage en Cloud)
- Mañana Claude Code llama `GET /orchestrator-api?action=get_status` y obtiene un JSON con todo el ecosistema para su análisis

