

# Plan: PWA Ahora + Preparación Capacitor — App Móvil La Orquesta IDMA

## Fase 1: PWA (implementar ahora)

La app será instalable desde el navegador en cualquier teléfono. No requiere App Store.

### Qué se hace

**A. Manifest + Iconos**
- Crear `public/manifest.json` con nombre "La Orquesta IDMA", colores institucionales (green-teal), `display: "standalone"`
- Generar iconos PWA (192x192, 512x512) con el branding IDMA
- Agregar meta tags en `index.html`: `apple-mobile-web-app-capable`, `theme-color`, link al manifest

**B. Service Worker (solo producción)**
- Instalar `vite-plugin-pwa`
- Configurar en `vite.config.ts` con:
  - `devOptions: { enabled: false }` — no interfiere con el preview de Lovable
  - `navigateFallbackDenylist: [/^\/~oauth/]`
  - Caching strategy para assets estáticos
- Guard en `main.tsx`: detectar iframe/preview host y desregistrar SW si existe

**C. Vista móvil diferenciada**
- Crear hook `useIsMobileApp()` que detecta si se ejecuta como PWA (`display-mode: standalone`)
- Cuando es PWA: ocultar sidebar, usar bottom tab navigation con 5 tabs:
  - Dashboard | Agentes | Alertas | Acreditación | Más (settings, convenios, etc.)
- Touch-friendly: botones más grandes, swipe gestures en cards

**D. Página `/install`**
- Instrucciones para instalar según dispositivo (iOS: Share → Add to Home Screen, Android: menú → Instalar)
- Trigger del install prompt nativo en Android
- QR code para compartir link de instalación

### Funcionalidades móvil exclusivas

1. **Quick Actions desde home**: notificaciones de alertas críticas al abrir
2. **Vista compacta del mapa de agentes**: lista vertical con status dots, sin SVG complejo
3. **Swipe para resolver alertas**: en la lista de alertas, swipe right = marcar resuelta
4. **Pull-to-refresh**: en dashboard y alertas

## Fase 2: Capacitor (preparación para después)

Solo se deja documentado y preparado:
- Instrucciones en el traspaso de cómo agregar `@capacitor/core` + `@capacitor/cli`
- App ID reservado: `app.lovable.c737757431b44fbb984b67b5f14789de`
- La arquitectura PWA es compatible — Capacitor wrappea la misma web app

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `public/manifest.json` | Crear — manifest PWA |
| `public/pwa-192x192.svg` | Crear — icono SVG escalable |
| `public/pwa-512x512.svg` | Crear — icono SVG escalable |
| `index.html` | Agregar meta tags PWA |
| `vite.config.ts` | Agregar vite-plugin-pwa |
| `src/main.tsx` | Guard para iframe/preview |
| `src/hooks/useIsMobileApp.ts` | Crear — detecta modo standalone |
| `src/components/layout/MobileNav.tsx` | Crear — bottom tab navigation |
| `src/components/layout/PageContainer.tsx` | Condicionar sidebar vs mobile nav |
| `src/pages/Install.tsx` | Crear — página de instalación |
| `src/App.tsx` | Agregar ruta /install |

## Notas Técnicas
- `vite-plugin-pwa` es la única dependencia nueva
- El SW solo se activa en producción (published), nunca en preview
- La bottom nav usa los mismos `navItems` del sidebar — sin duplicación
- Las vistas móvil-exclusivas (swipe, pull-to-refresh) usan CSS touch-action + handlers nativos, sin librerías extra
- Estimado: ~4 créditos

