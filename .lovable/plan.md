

# Plan: Optimización UI/UX + Preparación Auto-Traspaso

## 1. Glass-Morphism + Visual Polish

### `src/index.css`
- Agregar custom scrollbar styling (thin, colores IDMA)
- Agregar utilities: `.glass-card` (backdrop-blur + borde semi-transparente), `.glass-card-hover` (glow verde al hover), `.glow-green` (shadow verde), `.shine-effect` (brillo diagonal animado al hover)
- Agregar keyframes: `fadeInUp`, `shimmer` (para skeletons)

### `src/components/shared/MetricTile.tsx`
- Aplicar clases `glass-card glass-card-hover shine-effect` en vez del border/bg estático
- Mover `suffix` debajo del valor como línea separada (mejor legibilidad en móvil)
- Reducir font-size a `text-xl sm:text-2xl` para responsive

### `src/components/dashboard/WelcomeCard.tsx`
- Usar `glass-card glow-green` en vez del bg gradient estático
- Agregar barra gradient animada en el top (2px)
- Stagger animation con framer-motion en los feature items
- AnimatePresence para dismiss suave

## 2. Loading States Mejorados

### `src/components/shared/SkeletonLoader.tsx`
- Rediseñar con 3 variantes: `page` (grid de cards + bloque), `widget` (card individual), `mini` (barra inline)
- Usar shimmer animation en vez de barras pulsantes
- Forma que simula el contenido real

### `src/components/shared/PageTransition.tsx`
- Cambiar de `y: 8` a `scale: 0.98 + y: 6` para transición más suave
- Easing curve mejorada `[0.25, 0.1, 0.25, 1]`

### `src/pages/Dashboard.tsx`
- Reemplazar `WidgetFallback` con `<SkeletonLoader variant="widget" />`

## 3. Mobile + Responsive

### `src/components/layout/MobileNav.tsx`
- Agregar pill indicator animado (motion.div) bajo el tab activo usando `layoutId`
- Scale down sutil al tap (`whileTap={{ scale: 0.95 }}`)

### `src/components/dashboard/GlobalMetrics.tsx` e `InstitutionalMetrics.tsx`
- Cambiar grid de `grid-cols-1 sm:grid-cols-2` a `grid-cols-2 sm:grid-cols-2` (2 cols en 390px)
- Padding más compacto en móvil

### `src/components/layout/PageContainer.tsx`
- Main padding: `p-3 sm:p-4 lg:p-6` (más granular)
- Agregar `scroll-smooth` al contenedor

## 4. Preparación Auto-Traspaso

### `src/lib/systemHealth.ts` (nuevo)
- Función `getSystemHealth()` que retorna objeto con:
  - `version`, `features` activas (array de strings)
  - `tables` con estado (populated/empty)
  - `edgeFunctions` disponibles
  - `uiComponents` count
  - `lastCheck` timestamp
- Exportable para uso interno y desde orchestrator-api

### `supabase/functions/orchestrator-api/index.ts`
- Enriquecer `get_status` con bloque `ui_state`: version, features, component_count
- Agregar action `get_ui_state` que retorna config visual + features + health

## Archivos

| Archivo | Cambio |
|---|---|
| `src/index.css` | Glass utilities, scrollbar, shimmer |
| `src/components/shared/MetricTile.tsx` | Glass + shine + responsive |
| `src/components/shared/SkeletonLoader.tsx` | Rediseño 3 variantes |
| `src/components/shared/PageTransition.tsx` | Scale + easing |
| `src/components/dashboard/WelcomeCard.tsx` | Glass + glow + stagger |
| `src/components/dashboard/GlobalMetrics.tsx` | 2-col mobile grid |
| `src/components/dashboard/InstitutionalMetrics.tsx` | 2-col mobile grid |
| `src/components/layout/MobileNav.tsx` | Animated pill indicator |
| `src/components/layout/PageContainer.tsx` | Responsive padding |
| `src/pages/Dashboard.tsx` | Widget fallback mejorado |
| `src/lib/systemHealth.ts` | Nuevo — estado para traspaso |
| `supabase/functions/orchestrator-api/index.ts` | get_ui_state action |

## Notas Técnicas
- Sin dependencias nuevas — Tailwind + Framer Motion existentes
- Glass-morphism usa `backdrop-blur-md` — soporte en todos los navegadores modernos
- Shimmer animation via CSS background-position — zero JS overhead
- `systemHealth.ts` es client-side, consultable desde edge function para auto-traspaso
- Estimado: ~5 créditos

