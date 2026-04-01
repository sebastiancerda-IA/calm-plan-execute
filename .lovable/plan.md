

# Plan: Integraciones Estratégicas — Google Workspace + Alertas + Email

## Prioridad inmediata (implementable ahora)

### 1. Google Sheets → n8n → Orchestrator API (sin connector, via n8n)
Ya tienes n8n con acceso a Google. El flujo:
- n8n lee los spreadsheets VCM Log y OTEC Log cada 6 horas
- Envía datos al `n8n-webhook` edge function
- Se almacenan en tablas existentes (`email_logs`, `otec_programs`)
- **Acción**: Actualizar `sheetsService.ts` para leer de Supabase en vez de mock data

### 2. Email Institucional Branded
Configurar envío de emails desde dominio idma.cl:
- Emails de autenticación (password reset, verificación) con branding IDMA
- Notificaciones transaccionales (alertas críticas, reportes)
- **Acción**: Configurar email domain + scaffold auth email templates

### 3. Telegram Bot — Canal de Alertas Críticas
Usar el connector de Telegram disponible para:
- Edge function que envía alertas críticas al teléfono del director
- Resumen diario automático del estado del sistema
- **Acción**: Conectar Telegram connector + crear edge function `telegram-alerts`

### 4. Google Drive Links en Convenios y Acreditación
No requiere API directa — n8n ya tiene acceso a Drive:
- Los convenios ya tienen `archivo_drive_url` — solo necesitamos UI para abrir/vincular
- Documentos de acreditación linkean a Drive folders
- **Acción**: Mejorar UI de upload en Convenios y Acreditación para aceptar URLs de Drive

### 5. n8n como Conector MCP
Conectar el MCP de n8n disponible en el catálogo para:
- Ver workflows y su estado directamente desde Lovable
- Monitorear ejecuciones sin salir de la plataforma

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `src/services/sheetsService.ts` | Reemplazar mock → queries Supabase reales |
| `supabase/functions/telegram-alerts/index.ts` | Nuevo — envío de alertas a Telegram |
| `src/pages/Convenios.tsx` | Mejorar campo Drive URL con preview/link |
| `src/pages/Acreditacion.tsx` | Links a Drive folders por criterio |
| `src/components/dashboard/InfraFooter.tsx` | Agregar Telegram y Email al footer |

## Orden de ejecución sugerido
1. **Email branded** — mayor impacto profesional inmediato
2. **Telegram alerts** — alertas en tiempo real al celular
3. **Sheets → Supabase** — elimina mock data
4. **n8n MCP** — visibilidad de workflows
5. **Drive links UI** — mejora UX de documentos

## Notas
- Telegram connector ya está disponible en el catálogo — solo hay que conectarlo
- n8n MCP también disponible — da visibilidad directa de workflows
- Email requiere configurar dominio idma.cl (DNS records)
- Google Sheets se conecta via n8n (ya funciona), no requiere API key adicional en Lovable
- Railway Pro se usa solo para Qdrant — no necesita cambios

