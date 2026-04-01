

# Plan: Preparación Pre-RAG + Mejoras Ejecutables Ahora

## Estado Actual del Sistema

| Tabla | Registros | Estado |
|---|---|---|
| agents | 22 | ✅ Poblada |
| alerts | 13 | ✅ Poblada |
| executions | 10 | ✅ Con datos |
| rag_documents | 63 | ✅ Base lista |
| cna_criteria | 16 | ✅ Los 16 criterios |
| agent_tasks | 23 | ✅ Tareas asignadas |
| convenios | 0 | ⏳ Esperando carga |
| financial_records | 0 | ⏳ Esperando carga mañana |
| institutional_metrics | 15 | ✅ KPIs base |
| otec_programs | 8 | ✅ Programas |

## Lo que podemos hacer AHORA (antes del RAG a las 18hrs)

### Bloque 1 — Notificaciones Push + Alertas Inteligentes (~3 créditos)
El sistema detecta alertas pero no avisa proactivamente. Implementar:
- **Centro de notificaciones** en el TopBar: campana con badge de count, dropdown con las últimas 10 alertas sin resolver
- **Notificaciones nativas del navegador** (Web Notification API): pedir permiso al login, disparar cuando llega alerta crítica via realtime
- **Resumen diario automático**: widget en dashboard que muestra "Hoy: X alertas, Y ejecuciones, Z documentos nuevos" — se calcula client-side desde los datos existentes

### Bloque 2 — Dashboard de Agentes Mejorado (~3 créditos)
La página `/agents` es una lista. Convertirla en un panel de control operativo:
- **Vista Grid/List toggle**: grid con cards grandes mostrando último run, items procesados, error rate con sparkline
- **Filtros rápidos**: por estado (activo/error/futuro), por área (académica/administrativa/acreditación)
- **Indicador de salud**: semáforo por agente basado en error_rate y tiempo desde last_run
- **Acción rápida**: botón "Forzar ejecución" que llama al orchestrator-api con `add_execution`

### Bloque 3 — Página de Inicio / Onboarding (~2 créditos)
Cuando un usuario nuevo entra, no sabe qué está viendo. Crear:
- **Welcome card** en dashboard para usuarios nuevos (primer login): explica qué es La Orquesta, qué puede hacer
- **Tour guiado** con tooltips en los elementos clave (3-4 pasos máximo)
- **Quick stats** personalizados por rol: director ve finanzas primero, staff ve tareas

### Bloque 4 — Exportación y Reportes (~2 créditos)
Para que cuando lleguen los datos del RAG se puedan sacar reportes inmediatamente:
- **Botón exportar CSV** en cada tabla (agentes, alertas, ejecuciones, convenios)
- **Reporte de estado del sistema** exportable: JSON/PDF con snapshot de todos los KPIs
- **Historial de ejecuciones** con gráfico de timeline (últimas 24h, 7d, 30d) usando recharts

### Bloque 5 — Preparación para recibir RAG (~2 créditos)
Optimizar la infraestructura para que cuando cargues los documentos todo funcione al instante:
- **Auto-refresh en /acreditacion**: suscripción realtime a `rag_documents` para que aparezcan sin recargar (ya preparado pero necesita polish)
- **Contador en vivo en el sidebar**: badge con total de documentos RAG que se actualiza en realtime
- **Endpoint `orchestrator-api` optimizado**: agregar acción `bulk_rag_docs` para cargar múltiples documentos en una sola llamada desde Claude Code
- **Vista previa de documento**: al hacer click en un doc RAG, mostrar metadata expandida (chunks, criterios vinculados, resumen si existe)

## Archivos a crear/modificar

| Archivo | Cambio |
|---|---|
| `src/components/layout/TopBar.tsx` | Centro de notificaciones con campana |
| `src/hooks/useNotifications.ts` | Crear — permisos + dispatch de Web Notifications |
| `src/pages/AgentsList.tsx` | Grid view, filtros, semáforo de salud |
| `src/components/dashboard/WelcomeCard.tsx` | Crear — onboarding para usuarios nuevos |
| `src/components/shared/ExportButton.tsx` | Crear — componente reutilizable CSV export |
| `src/pages/RAGExplorer.tsx` | Vista previa expandida de documentos |
| `src/components/layout/AppSidebar.tsx` | Badge RAG count en sidebar |
| `supabase/functions/orchestrator-api/index.ts` | Acción `bulk_rag_docs` |

## Recomendación de ejecución

Sugiero implementar en este orden:
1. **Bloque 5** primero — deja todo listo para las 18hrs
2. **Bloque 1** — notificaciones para que cuando lleguen datos lo veas
3. **Bloque 2** — panel de agentes operativo
4. **Bloque 4** — exportación lista para cuando haya datos reales
5. **Bloque 3** — onboarding al final, pulido

**Total estimado: ~12 créditos**

## Qué queda para DESPUÉS de las 18hrs (cuando llegue el RAG)
- Conectar datos reales a gráficos financieros
- Activar el bot asesor con contexto real de acreditación
- Generar el primer reporte automatizado de brechas CNA
- Vincular documentos RAG con criterios específicos automáticamente

