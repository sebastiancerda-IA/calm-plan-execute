

# Plan: La Orquesta IDMA — De Monitor Pasivo a Centro de Comando Funcional

## Problema Actual
El dashboard es un monitor estático que muestra datos sin guiar ni permitir acción. No refleja el poder del ecosistema multiagente. Faltan datos institucionales clave (matrículas, OTEC, finanzas), no hay acciones ejecutables, y no hay inteligencia que guíe hacia la acreditación.

## Visión
Transformar La Orquesta de un "panel de estado" a un **centro de comando estratégico** que: muestra KPIs institucionales reales, guía activamente hacia la acreditación CNA 2027, permite ejecutar acciones, y está preparado para recibir documentos de acreditación mañana.

---

## Bloque 1: Nuevas Tablas de Datos Institucionales

Crear 3 tablas nuevas en la base de datos para almacenar datos institucionales reales:

**`institutional_metrics`** — KPIs de CFT IDMA
- `metric_key`: matriculas_nuevas, matriculas_antiguas, matriculas_total, tasa_retencion, tasa_titulacion, tasa_empleabilidad, ingresos_mensual, gastos_mensual, balance
- `metric_value`, `period` (2024-Q1, 2025-M03), `updated_at`
- Esto alimenta un nuevo widget de KPIs institucionales en el Dashboard

**`otec_programs`** — Cursos y diplomados OTEC activos
- `id`, `name`, `type` (curso/diplomado), `status` (activo/finalizado/programado), `sence_code`, `students_enrolled`, `start_date`, `end_date`, `empresa`, `revenue`
- Alimenta un nuevo panel OTEC en el Dashboard

**`acreditation_documents`** — Documentos de acreditación (anterior + actual)
- `id`, `title`, `document_type` (informe_anterior/avance_actual/evidencia), `criterio_cna`, `dimension`, `file_path`, `summary`, `uploaded_at`, `processed` (boolean)
- Preparado para recibir la carga de documentos de mañana

Seed data con valores realistas de CFT IDMA (matrículas ~600-800 estudiantes, cursos OTEC activos, etc.)

## Bloque 2: Dashboard Expandido — KPIs Institucionales

Expandir `GlobalMetrics` de 4 a 8 métricas en 2 filas:

**Fila 1 (operacional — ya existe, mejorada):**
- Agentes operativos (ya existe)
- Emails procesados 24h (ya existe)
- Alertas activas (ya existe)
- Base de conocimiento (ya existe)

**Fila 2 (institucional — nueva):**
- Matrículas activas (nuevas + antiguas, con desglose)
- Programas OTEC activos (cursos + diplomados)
- Progreso CNA global (% con indicador de meta)
- Balance financiero (ingresos vs gastos del mes)

## Bloque 3: Panel "Guía de Acreditación" — Nuevo Componente

Nuevo componente `AccreditationGuide` que reemplaza o complementa `CNASnapshot` en el Dashboard:

- Muestra los criterios con brecha critica (N1 cuando meta es N2+) destacados en rojo
- Para cada brecha, muestra: qué falta, qué agente es responsable, próxima acción concreta
- Indicador de "días restantes para acreditación" (cuenta regresiva a Mar 2027)
- Sección "Documentos pendientes de carga" — lista de lo que falta subir, preparado para la carga de mañana
- Este componente usa Lovable AI para generar recomendaciones estratégicas basadas en el estado actual de los criterios

## Bloque 4: Centro de Acciones — Ejecutar Comandos

Nuevo componente `ActionCenter` en el Dashboard (o como página `/actions`):

- Botones de acción rápida:
  - "Forzar clasificación de emails" — llama al webhook n8n para ejecutar A1/C1
  - "Re-indexar RAG" — llama al webhook para ejecutar A3
  - "Generar briefing diario" — genera resumen con Lovable AI basado en alertas + emails recientes
  - "Exportar reporte CNA" — genera PDF/CSV del estado actual
- Cada acción muestra estado (ejecutando/completado/error) con feedback visual
- Log de acciones ejecutadas desde la UI

## Bloque 5: Preparación para Carga de Documentos de Acreditación

Crear página `/acreditacion` o expandir RAG Explorer:

- Zona de carga de archivos (storage bucket) para PDFs de acreditación
- Al subir, el documento se registra en `acreditation_documents` con su criterio CNA asociado
- Vista de "Informe anterior" vs "Avance actual" por criterio
- Contador de evidencias por criterio (alimenta el evidence_count de cna_criteria)
- Edge function que procesa documentos subidos: extrae texto con Lovable AI y genera resumen automático

## Bloque 6: ActivityFeed con Datos Reales + Seed Data

- Reemplazar ActivityFeed mock con datos reales de `executions` + `alerts`
- Insertar seed data en `email_logs` y `executions` para que la app no esté vacía
- Insertar más `rag_documents` (llegar a 51 como indica el spec original)

## Bloque 7: Asesor IA Integrado (Edge Function + Lovable AI)

Edge function `cna-advisor` que:
- Recibe el estado actual de los 16 criterios
- Usa Lovable AI (gemini-3-flash-preview) para analizar brechas y generar:
  - Recomendaciones priorizadas
  - Estimación de nivel alcanzable por criterio
  - Plan de acción sugerido para los próximos 30 días
- Se muestra en un panel lateral o modal desde CNA Matrix y desde el Dashboard
- NO es un chat — es un análisis on-demand que se ejecuta al presionar "Analizar estado CNA"

---

## Orden de Ejecución

1. **Bloque 1** — Tablas nuevas + seed data (~3 créditos)
2. **Bloque 6** — Seed data faltante + ActivityFeed real (~2 créditos)
3. **Bloque 2** — Dashboard KPIs expandidos (~2 créditos)
4. **Bloque 3** — Panel guía de acreditación (~3 créditos)
5. **Bloque 5** — Página de carga de documentos (~4 créditos)
6. **Bloque 4** — Centro de acciones (~3 créditos)
7. **Bloque 7** — Asesor IA CNA (~3 créditos)

**Total estimado: ~20 créditos**

## Notas Tecnicas

- Las tablas nuevas usan RLS con policy SELECT para authenticated
- Storage bucket `acreditation-docs` para archivos PDF
- Edge function `cna-advisor` usa `LOVABLE_API_KEY` (ya disponible) con gemini-3-flash-preview
- Edge function `process-document` para extraer resúmenes de PDFs subidos
- Los KPIs institucionales se leen de `institutional_metrics` — preparados para que mañana se llenen con datos reales via n8n o carga manual
- Programas OTEC se leen de `otec_programs` — misma lógica
- No se agregan dependencias pesadas — todo usa lo ya instalado (recharts, framer-motion, React Query)

