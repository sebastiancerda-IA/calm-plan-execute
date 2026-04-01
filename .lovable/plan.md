

# Plan: Selector de Modelo de IA en Chatbots

## Qué se hace

Agregar un selector de modelo de lenguaje en los chatbots de Finanzas y Acreditación. El usuario elige qué modelo usar para cada conversación.

## Modelos disponibles

| Etiqueta UI | Model ID | Notas |
|---|---|---|
| Gemini Flash (rápido) | `google/gemini-3-flash-preview` | Default, balance velocidad/calidad |
| Gemini Pro (profundo) | `google/gemini-2.5-pro` | Razonamiento complejo, más lento |
| GPT-5 (potente) | `openai/gpt-5` | Máxima precisión, más costoso |
| GPT-5 Mini (ágil) | `openai/gpt-5-mini` | Buen balance costo/rendimiento |

Todos pasan por el mismo Lovable AI Gateway — no requieren API keys adicionales.

## Cambios

### 1. Edge Functions (backend)
- **`financial-advisor/index.ts`**: Aceptar campo `model` del body JSON. Usar como parámetro en la llamada al gateway en vez del hardcoded `google/gemini-3-flash-preview`. Validar contra lista blanca de modelos permitidos.
- **`cna-advisor/index.ts`**: Mismo cambio — aceptar `model` opcional.
- **`acreditation-advisor/index.ts`**: Si existe chat streaming, mismo patrón.

### 2. Frontend
- **`Finanzas.tsx`**: Agregar un `Select` dropdown junto al selector de modo (Analista/Auditor) para elegir modelo. Enviar `model` en el body del fetch.
- **`Acreditacion.tsx`**: Mismo selector en el chat del asesor CNA.

### 3. UX
- Selector compacto tipo chip/dropdown al lado del modo
- Tooltip en cada opción explicando trade-off (velocidad vs profundidad)
- El modelo seleccionado se persiste en `localStorage` por sección

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `supabase/functions/financial-advisor/index.ts` | Aceptar `model` del request, validar whitelist |
| `supabase/functions/cna-advisor/index.ts` | Aceptar `model` del request |
| `src/pages/Finanzas.tsx` | Agregar selector de modelo + enviar en request |
| `src/pages/Acreditacion.tsx` | Agregar selector de modelo + enviar en request |

## Notas Técnicas
- Whitelist de modelos validada server-side para evitar inyección
- Default sigue siendo `google/gemini-3-flash-preview` si no se envía modelo
- No requiere secrets nuevos — todos los modelos usan `LOVABLE_API_KEY`
- Estimado: ~2 créditos

