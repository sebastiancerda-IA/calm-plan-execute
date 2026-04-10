

# Plan: Presupuestos Internos + Propuestas Comerciales en Finanzas

## Resumen
Agregar dos nuevas tabs al módulo de Finanzas: "Presupuestos" (internos) y "Propuestas" (comerciales para clientes). Ambas siguen el mismo patrón de Convenios: tabla con filtros, dialog de creación con plantillas inteligentes por tipo, métricas de resumen, y exportación CSV.

## 1. Crear tabla `budgets` (presupuestos internos)

Migración SQL:
- `id` uuid PK
- `title` text NOT NULL — nombre del presupuesto
- `budget_type` text NOT NULL DEFAULT 'operativo' — operativo, proyecto, departamento, evento
- `status` text NOT NULL DEFAULT 'borrador' — borrador, aprobado, en_ejecucion, cerrado
- `period` text NOT NULL — ej: "2025-Q2"
- `total_amount` numeric NOT NULL DEFAULT 0
- `allocated_amount` numeric DEFAULT 0 — monto asignado/ejecutado
- `department` text — área responsable
- `description` text
- `line_items` jsonb DEFAULT '[]' — array de {concepto, monto, categoria}
- `notes` text
- `created_at`, `updated_at` timestamps
- RLS: SELECT/INSERT/UPDATE para director y dg (mismo patrón que `financial_records`)

## 2. Crear tabla `commercial_proposals` (propuestas para clientes)

Migración SQL:
- `id` uuid PK
- `client_name` text NOT NULL
- `client_rut` text
- `client_email` text
- `proposal_type` text NOT NULL DEFAULT 'capacitacion' — capacitacion, consultoria, servicio, proyecto
- `status` text NOT NULL DEFAULT 'borrador' — borrador, enviada, negociacion, aceptada, rechazada
- `title` text NOT NULL
- `description` text
- `total_amount` numeric NOT NULL DEFAULT 0
- `line_items` jsonb DEFAULT '[]' — array de {servicio, cantidad, precio_unitario, subtotal}
- `valid_until` date
- `notes` text
- `created_at`, `updated_at` timestamps
- RLS: mismo patrón director/dg

## 3. Componente `BudgetBuilder` (nuevo tab en Finanzas)

Patrón idéntico a Convenios:
- **Métricas**: Total, Aprobados, En ejecución, Monto total
- **Filtros**: búsqueda por título + filtro por estado
- **Tabla**: título, tipo, departamento, estado, monto total, % ejecutado
- **Dialog de creación** con 2 pasos:
  - Paso 1: seleccionar tipo (Operativo, Proyecto, Departamento, Evento) — cada tipo pre-llena descripción y categorías de líneas
  - Paso 2: formulario con título, período, departamento, monto total, líneas de detalle (agregar/eliminar filas dinámicas), notas
- **Exportar CSV**

## 4. Componente `ProposalBuilder` (nuevo tab en Finanzas)

Mismo patrón:
- **Métricas**: Total, Enviadas, Aceptadas, Monto pipeline
- **Filtros**: búsqueda por cliente + filtro por estado
- **Tabla**: cliente, título, tipo, estado, monto, validez
- **Dialog de creación** con 2 pasos:
  - Paso 1: seleccionar tipo (Capacitación OTEC, Consultoría, Servicio técnico, Proyecto especial) — pre-llena descripción y servicios típicos
  - Paso 2: formulario con datos cliente, título, líneas de cotización (servicio, cantidad, precio unitario, subtotal auto-calculado), fecha validez, notas
- **Exportar CSV**

## 5. Integrar en Finanzas.tsx

Agregar dos TabsTrigger adicionales al componente existente:
```
Dashboard | Presupuestos | Propuestas | Consultar Asesor
```

## 6. Exportación

Agregar `exportBudgets()` y `exportProposals()` a `src/lib/exportUtils.ts`.

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| Migración SQL | Crear tablas `budgets` y `commercial_proposals` con RLS |
| `src/pages/Finanzas.tsx` | Agregar tabs + importar componentes |
| `src/components/finanzas/BudgetBuilder.tsx` | Nuevo — gestión presupuestos |
| `src/components/finanzas/ProposalBuilder.tsx` | Nuevo — gestión propuestas |
| `src/lib/exportUtils.ts` | Agregar funciones de exportación |

## Notas
- Las líneas de detalle se guardan como JSONB para flexibilidad (no requiere tabla adicional)
- Plantillas inteligentes por tipo (mismo UX que Convenios con contraparte)
- Solo director/dg pueden acceder (usa la restricción existente de `isDirectorOrDG`)
- Sin dependencias nuevas

