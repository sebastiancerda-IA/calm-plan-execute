# Plan: Optimización UI/UX + Preparación Auto-Traspaso

## Qué se hace

Pulido visual y de experiencia en toda la plataforma. Cards más premium, transiciones más suaves, estados de carga consistentes, y un endpoint de health para que Claude Code pueda verificar estado del sistema automáticamente.

---

## 1. Glass-Morphism Cards + Profundidad Visual

### `src/index.css`
- Agregar utility classes: `.glass-card` (backdrop-blur + borde semi-transparente), `.glow-green` (sombra suave verde IDMA)
- Agregar animación `fadeInUp` para uso global
- Mejorar scrollbar styling (thin, colores IDMA)

### `src/components/shared/MetricTile.tsx`
- Aplicar glass-morphism al hover (backdrop-blur, borde gradiente)
- Agregar efecto de brillo sutil al hacer hover (shine overlay)

### `src/components/dashboard/WelcomeCard.tsx`
- Gradiente más pronunciado, borde animado con glow verde sutil
- Animación de entrada staggered para los feature items

## 2. Loading States Consistentes

### `src/components/shared/SkeletonLoader.tsx`
- Rediseñar: en vez de 3 barras, usar skeleton que simula la forma del contenido (cards, títulos)
- Agregar variante `mini` para widgets individuales

### Suspense fallbacks en `Dashboard.tsx`
- Reemplazar `WidgetFallback` genérico con skeletons que coincidan con la forma de cada widget

## 3. Micro-Animaciones y Transiciones

### `src/components/shared/PageTransition.tsx`
- Transición más suave: fade + scale sutil (0.98 → 1) en vez de solo translate Y

### `src/components/layout/MobileNav.tsx`
- Agregar indicador activo animado (pill que se desliza bajo el tab activo)
- Feedback háptico visual al tap (scale down sutil)

### `src/components/layout/TopBar.tsx`
- Animación sutil en el StatusDot (pulse cuando está activo)
- Transición suave en el reloj

## 4. Responsive Polish

### `src/components/layout/PageContainer.tsx`
- Agregar `scroll-smooth` al main container
- Padding responsive más granular (p-3 en móvil, p-4 tablet, p-6 desktop)

### `src/components/dashboard/GlobalMetrics.tsx` e `InstitutionalMetrics.tsx`
- En móvil (390px viewport actual): grid de 2 columnas en vez de 1 para aprovechar espacio
- Cards más compactas en móvil

## 5. Preparación Auto-Traspaso

### `src/lib/systemHealth.ts` (nuevo)
- Función `getSystemHealth()` que retorna estado del sistema: tablas con datos, edge functions activas, features habilitadas, versión
- Usado por el orchestrator-api action `get_status` para enriquecer la respuesta
- Claude Code puede llamar este endpoint y generar super-prompts automáticamente basados en el estado actual

### Actualizar `supabase/functions/orchestrator-api/index.ts`
- Enriquecer `get_status` con metadata de UI: versión, features activas, último deploy, conteo de componentes
- Agregar action `get_ui_state` que retorna configuración visual actual

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/index.css` | Glass-morphism utilities, scrollbar, animaciones |
| `src/components/shared/MetricTile.tsx` | Hover glass + shine effect |
| `src/components/shared/SkeletonLoader.tsx` | Rediseño con variantes |
| `src/components/shared/PageTransition.tsx` | Transición mejorada |
| `src/components/dashboard/WelcomeCard.tsx` | Glow + stagger animation |
| `src/components/dashboard/GlobalMetrics.tsx` | Grid responsive 2-col móvil |
| `src/components/dashboard/InstitutionalMetrics.tsx` | Grid responsive 2-col móvil |
| `src/components/layout/MobileNav.tsx` | Indicador activo animado |
| `src/components/layout/PageContainer.tsx` | Padding responsive mejorado |
| `src/components/layout/TopBar.tsx` | Micro-animaciones status |
| `src/pages/Dashboard.tsx` | Fallbacks con forma real |
| `src/lib/systemHealth.ts` | Nuevo — estado del sistema para traspaso |
| `supabase/functions/orchestrator-api/index.ts` | Enriquecer get_status |

## Notas Técnicas
- Sin dependencias nuevas — todo con Tailwind + Framer Motion (ya instalado)
- Glass-morphism usa `backdrop-blur-md` + bordes con opacity — funciona en todos los navegadores modernos
- El `systemHealth.ts` es client-side, consultable desde orchestrator-api para que Claude Code siempre tenga contexto fresco
- Estimado: ~5 créditos