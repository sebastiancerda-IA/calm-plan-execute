import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const VALID_TIPOS = new Set([
  "practica_profesional",
  "prosecucion_estudios",
  "cooperacion_tecnica",
  "descuento_arancel",
  "colaboracion_institucional",
  "otec_empresa",
  "erasmus",
  "investigacion",
]);

const VALID_CONTRAPARTES = new Set([
  "municipalidad",
  "empresa_privada",
  "ies_universidad",
  "ies_cft_ip",
  "sociedad_civil_ong",
  "organismo_publico",
  "fundacion",
  "internacional",
  "otro",
]);

const VALID_ESTADOS = new Set([
  "activo",
  "expirado",
  "pendiente_firma",
  "en_negociacion",
  "suspendido",
]);

type NormalizedConvenio = {
  nombre_institucion: string;
  tipo: string;
  contraparte: string;
  estado: string;
  fecha_inicio: string | null;
  fecha_termino: string | null;
  descripcion: string | null;
  carreras_habilitadas: string[] | null;
  beneficio_creditos: number | null;
  beneficio_arancel_pct: number | null;
  para_carrera: string | null;
  cupos_anuales: number | null;
  persona_contacto: string | null;
  email_contacto: string | null;
  criterios_cna: string[] | null;
  archivo_drive_url: string | null;
  archivo_nombre: string | null;
  observaciones: string | null;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNullableString(v: unknown): string | null {
  const str = asString(v);
  return str === "" ? null : str;
}

function asNullableDate(v: unknown): string | null {
  const str = asString(v);
  if (!str) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null;
}

function asNullableNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asNullableStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const arr = v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
  return arr.length > 0 ? arr : null;
}

function normalizeRecord(raw: unknown, rowIndex: number): { record: NormalizedConvenio | null; errors: string[] } {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object") {
    return { record: null, errors: [`row ${rowIndex}: invalid object`] };
  }

  const row = raw as Record<string, unknown>;
  const nombre_institucion = asString(row.nombre_institucion);
  const tipo = asString(row.tipo);
  const contraparte = asString(row.contraparte);
  const estado = asString(row.estado);

  if (!nombre_institucion) errors.push(`row ${rowIndex}: nombre_institucion required`);
  if (!VALID_TIPOS.has(tipo)) errors.push(`row ${rowIndex}: invalid tipo '${tipo}'`);
  if (!VALID_CONTRAPARTES.has(contraparte)) errors.push(`row ${rowIndex}: invalid contraparte '${contraparte}'`);
  if (!VALID_ESTADOS.has(estado)) errors.push(`row ${rowIndex}: invalid estado '${estado}'`);

  const fecha_inicio = asNullableDate(row.fecha_inicio);
  const fecha_termino = asNullableDate(row.fecha_termino);
  if (asString(row.fecha_inicio) && !fecha_inicio) errors.push(`row ${rowIndex}: invalid fecha_inicio`);
  if (asString(row.fecha_termino) && !fecha_termino) errors.push(`row ${rowIndex}: invalid fecha_termino`);

  const record: NormalizedConvenio = {
    nombre_institucion,
    tipo,
    contraparte,
    estado,
    fecha_inicio,
    fecha_termino,
    descripcion: asNullableString(row.descripcion),
    carreras_habilitadas: asNullableStringArray(row.carreras_habilitadas),
    beneficio_creditos: asNullableNumber(row.beneficio_creditos),
    beneficio_arancel_pct: asNullableNumber(row.beneficio_arancel_pct),
    para_carrera: asNullableString(row.para_carrera),
    cupos_anuales: asNullableNumber(row.cupos_anuales),
    persona_contacto: asNullableString(row.persona_contacto),
    email_contacto: asNullableString(row.email_contacto),
    criterios_cna: asNullableStringArray(row.criterios_cna),
    archivo_drive_url: asNullableString(row.archivo_drive_url),
    archivo_nombre: asNullableString(row.archivo_nombre),
    observaciones: asNullableString(row.observaciones),
  };

  return { record, errors };
}

function tally(records: NormalizedConvenio[], field: keyof NormalizedConvenio): Record<string, number> {
  const out: Record<string, number> = {};
  for (const rec of records) {
    const key = String(rec[field] ?? "null");
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const apiKey = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");

    let authenticated = false;
    if (apiKey && apiKey === serviceRoleKey) {
      authenticated = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      authenticated = !!user;
    }

    if (!authenticated) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const action = asString(body.action || "dry_run");
    const sourceFile = asString(body.source_file || "Consolidado_IDMA_Compacto_Paso3_localizable_rapido.xlsx");
    const rawRecords: unknown[] = Array.isArray(body.records) ? body.records : [];

    const normalized: NormalizedConvenio[] = [];
    const errors: string[] = [];

    rawRecords.forEach((raw: unknown, index: number) => {
      const { record, errors: rowErrors } = normalizeRecord(raw, index + 1);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else if (record) {
        normalized.push(record);
      }
    });

    const diagnostics = {
      source_file: sourceFile,
      total_rows: rawRecords.length,
      valid_rows: normalized.length,
      invalid_rows: errors.length > 0 ? rawRecords.length - normalized.length : 0,
      links_localizados: normalized.filter((r) => !!r.archivo_drive_url).length,
      links_pendientes: normalized.filter((r) => !r.archivo_drive_url).length,
      by_estado: tally(normalized, "estado"),
      by_tipo: tally(normalized, "tipo"),
      by_contraparte: tally(normalized, "contraparte"),
      sample_errors: errors.slice(0, 20),
    };

    if (action === "dry_run") {
      await supabase.from("convenios_import_runs").insert({
        import_batch_id: crypto.randomUUID(),
        source_file: sourceFile,
        requested_action: "dry_run",
        dry_run: true,
        total_rows: diagnostics.total_rows,
        valid_rows: diagnostics.valid_rows,
        invalid_rows: diagnostics.invalid_rows,
        replaced_previous_rows: 0,
        inserted_rows: 0,
        status: errors.length > 0 ? "invalid" : "completed",
        report: diagnostics,
      });

      return new Response(JSON.stringify({ ok: true, action: "dry_run", diagnostics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action !== "replace_all") {
      throw new Error("Unsupported action. Use dry_run or replace_all");
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Validation failed",
        diagnostics,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.rpc("replace_all_convenios", {
      p_records: normalized,
      p_source_file: sourceFile,
      p_report: diagnostics,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, action: "replace_all", diagnostics, result: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
