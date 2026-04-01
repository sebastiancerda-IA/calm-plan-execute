

# Plan: GLOW UP Visual + Mapa de Agentes + Traspaso Claude Code

## Tres entregables en un solo sprint

---

## 1. GLOW UP Visual — Personalizable por Usuario

### Problema actual
La UI es funcional pero plana. Cards sin profundidad, sin micro-animaciones, sin identidad visual que conecte con www.idma.cl (verde-teal gradient, tipografía limpia, naturaleza).

### Mejoras

**A. Animaciones de entrada con framer-motion** (ya instalado)
- Cada MetricTile aparece con `fadeInUp` escalonado (staggerChildren)
- AgentMap: nodos aparecen en cascada jerárquica (Dios primero, luego operativos, luego infra)
- Transiciones de página ya existen vía PageTransition — refinar timing

**B. Cards con profundidad visual**
- Gradient sutil en bordes de cards principales (green-to-teal, siguiendo IDMA)
- MetricTile: hover con `scale(1.01)` + sombra con color del tile
- StatusDot: pulse animation mejorada con glow ring

**C. TopBar premium**
- Gradient sutil `idma-green → idma-teal` en el borde inferior
- Logo IDMA: usar la hoja estilizada actual pero con glow sutil

**D. Preferencias de usuario (localStorage)**
- Nueva sección en Settings: "Personalización"
  - Densidad: `compacto` / `normal` / `expandido` (cambia padding/gaps globalmente)
  - Animaciones: on/off toggle
  - Sidebar colapsada por defecto: sí/no
  - Dashboard: re-ordenar widgets (drag-and-drop es pesado — usar checkboxes de visibilidad)
- Hook `useUserPreferences` que lee/escribe en localStorage
- CSS variables para densidad: `--density-factor` que multiplica paddings

**E. Tipografía y color refinados**
- Headings con gradient text `idma-green → idma-teal` en títulos principales
- Separadores con gradient line sutil en vez de `border-border` plano
- Muted backgrounds con textura sutil (CSS noise pattern, solo dark mode)

---

## 2. Mapa de Agentes — Rediseño de Jerarquía

### Problema actual
El mapa actual es un grid plano con líneas SVG bezier. Las jerarquías no se leen bien, especialmente en mobile (390px). La relación Dios → Operativos → Transversales → Infra no es clara.

### Rediseño

**Estructura visual tipo organigrama descendente:**

```text
                    ┌─────────┐
                    │  AD Dios │  ← Corona dorada, card más grande
                    └────┬────┘
           ┌─────────┬───┴───┬─────────┐
           │         │       │         │
        ┌──┴──┐  ┌──┴──┐ ┌──┴──┐  ┌──┴──┐
        │A1   │  │B1   │ │B2   │  │C1   │  ← Operativos: 2 filas de 3
        │VCM  │  │Matr │ │Fin  │  │OTEC │
        └─────┘  └─────┘ └─────┘  └─────┘
        ┌──┴──┐  ┌──┴──┐ ┌──┴──┐
        │B3   │  │D1   │ │D2   │
        │Calid│  │Bench│ │SiGC │
        └─────┘  └─────┘ └─────┘
           ┌─────────┬───┴───┐
        ┌──┴──┐  ┌──┴──┐ ┌──┴──┐
        │A2   │  │A1+  │ │D3   │  ← Transversales
        │Pulse│  │Prio │ │Audit│
        └─────┘  └─────┘ └─────┘
              ┌────┴────┐
           ┌──┴──┐  ┌──┴──┐
           │A3   │  │A3Q  │  ← Infraestructura (base)
           │RAG  │  │QA   │
           └─────┘  └─────┘
```

**Mejoras concretas:**
- Etiquetas de capa: "DIRECTOR" / "OPERATIVOS" / "TRANSVERSALES" / "INFRAESTRUCTURA" como labels laterales
- Líneas SVG con flechas direccionales (triángulo al final)
- Líneas animadas: `stroke-dasharray` + `stroke-dashoffset` animation cuando un agente está en estado `procesando`
- Nodo AD (Dios): border doble, tamaño 1.2x, icono corona
- Color coding por área: cada área (VCM naranja, Matrículas azul, etc.) tiene su banda de color
- Hover: ilumina toda la cadena de dependencias con glow
- Mobile: layout vertical compacto, scrollable, con líneas simplificadas

---

## 3. Plan de Traspaso para Claude Code

### Archivo: `/mnt/documents/traspaso-claude-code.md`

Documento extenso y estructurado que Claude Code puede consumir mañana. Contendrá:

**A. Estado actual del ecosistema**
- Arquitectura completa: React + Supabase Cloud + Edge Functions
- Todas las tablas con su esquema y datos actuales
- Edge Functions disponibles y sus endpoints
- API Bridge: URL exacta, autenticación, todos los payloads posibles

**B. Instrucciones de conexión**
- Cómo autenticarse con `X-Api-Key`
- Curl examples para cada acción del orchestrator-api
- Cómo registrar documentos RAG procesados en Qdrant para que aparezcan en la Orquesta
- Cómo crear ejecuciones para que el Dashboard las refleje en tiempo real

**C. Análisis estratégico — Lo que falta**
Basado en todo lo que hemos construido, el análisis honesto:

1. **Datos reales** — Todo está en 0. Las tablas tienen estructura pero los KPIs muestran ceros. Mañana debe cargarse:
   - Matrículas reales (600→300 post-pandemia, estado actual)
   - Balance financiero real
   - Programas OTEC activos con ingresos
   - Estado CNA real (no el seed genérico)

2. **Agentes conectados** — Los 12 agentes existen en DB pero ninguno está realmente conectado a n8n. Falta:
   - Configurar webhook URLs en cada workflow de n8n
   - Probar el flujo email→clasificación→dashboard
   - Conectar Qdrant con la Orquesta vía `add_rag_doc`

3. **Inteligencia estratégica** — El bot asesor existe pero opera sin datos. Con los PDFs de acreditación anterior + avance actual, podrá:
   - Identificar brechas reales vs. brechas estimadas
   - Comparar con benchmarks de CFT similares
   - Generar plan de acción priorizado

4. **La llave del exito (análisis honesto)**:
   - **Retención estudiantil**: de 1300 a 300 estudiantes. El sistema necesita un pipeline de captación + retención con métricas reales. Los agentes B1 (Matrículas) y C1 (OTEC) deben alimentar un funnel visible.
   - **Diversificación de ingresos**: OTEC/capacitación es la oportunidad inmediata. Cursos SENCE, diplomados para empresas. El agente C1 debe trackear oportunidades y revenue pipeline.
   - **Marca y posicionamiento**: 30 años de trayectoria es un activo brutal. El sistema debería generar reportes de impacto VCM automatizados para comunicaciones.
   - **Acreditación como palanca comercial**: No es solo un sello — es un diferenciador de mercado. Cada nivel subido = argumento de venta.
   - **Automatización real**: Los agentes hoy son conceptuales. Mañana, con n8n conectado, el valor explota: emails se clasifican solos, alertas se generan, informes se compilan.

**D. Super-prompt sugerido para Claude Code**
Template de prompt que Claude Code puede ejecutar mañana para analizar todo el sistema y devolver recomendaciones de optimización.

**E. Checklist de acciones para mañana (18h sprint)**
- Hora por hora, qué hacer, qué cargar, qué probar

---

## Orden de ejecución

1. **Mapa de Agentes rediseñado** (~3 créditos) — impacto visual inmediato
2. **GLOW UP visual** (~3 créditos) — animaciones, gradients, profundidad
3. **Preferencias de usuario** (~2 créditos) — densidad + toggles en Settings
4. **Documento de traspaso** (~1 crédito) — generado como archivo markdown

**Total estimado: ~9 créditos**

## Notas Técnicas
- Framer-motion ya instalado — solo se agregan variantes a componentes existentes
- Preferencias en localStorage — no requiere tabla nueva ni backend
- El mapa rediseñado usa el mismo patrón SVG pero con layout CSS Grid restructurado por capas
- El documento de traspaso se genera como artifact en `/mnt/documents/`
- No se agregan dependencias nuevas

