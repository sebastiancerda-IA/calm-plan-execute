/**
 * Resolución única de URL/clave Supabase para el build (Vite/Lovable).
 *
 * Si en Project Settings de Lovable siguen las variables del preview antiguo
 * (`jhyuidtdvhcipwepesdz`), `import.meta.env.VITE_SUPABASE_URL` gana sobre los
 * fallbacks de `client.ts` y la app consulta OTRA base: convenios "vacíos" y JWT incoherente.
 *
 * Aquí forzamos el proyecto IDMA cuando detectamos ese ref legado.
 */

export const IDMA_SUPABASE_URL = 'https://wipeaufqdiohfdtcbhac.supabase.co';

export const IDMA_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_2reG5ddK8AVmbqyu5RtKsQ_DMI5h6LK';

export const IDMA_SUPABASE_PROJECT_ID = 'wipeaufqdiohfdtcbhac';

/** Preview Lovable/Stitch antiguo; no contiene los datos de producción IDMA. */
const LEGACY_SUPABASE_REF = 'jhyuidtdvhcipwepesdz';

function envUrl(): string | undefined {
  return import.meta.env.VITE_SUPABASE_URL;
}

function envPublishableKey(): string | undefined {
  return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

function envProjectId(): string | undefined {
  return import.meta.env.VITE_SUPABASE_PROJECT_ID;
}

/** True si el bundle fue construido con el proyecto equivocado (típico en Lovable). */
export function isLegacySupabaseBuild(): boolean {
  const url = envUrl() || '';
  const id = (envProjectId() || '').trim();
  return url.includes(LEGACY_SUPABASE_REF) || id === LEGACY_SUPABASE_REF;
}

export function getSupabaseUrl(): string {
  if (isLegacySupabaseBuild()) return IDMA_SUPABASE_URL;
  return envUrl() || IDMA_SUPABASE_URL;
}

export function getSupabasePublishableKey(): string {
  if (isLegacySupabaseBuild()) return IDMA_SUPABASE_PUBLISHABLE_KEY;
  return envPublishableKey() || IDMA_SUPABASE_PUBLISHABLE_KEY;
}

/** Id de proyecto coherente con la URL resuelta (para banner de diagnóstico). */
export function getResolvedProjectId(): string {
  if (isLegacySupabaseBuild()) return IDMA_SUPABASE_PROJECT_ID;
  const fromEnv = (envProjectId() || '').trim();
  if (fromEnv) return fromEnv;
  const u = getSupabaseUrl();
  return u.replace('https://', '').split('.')[0] || IDMA_SUPABASE_PROJECT_ID;
}
