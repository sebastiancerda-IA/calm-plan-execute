import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_ANALISTA = `Eres el Asesor Financiero Estratégico de CFT IDMA, institución chilena de educación técnico-profesional ambiental.

EXPERTISE:
- Finanzas de instituciones de educación superior chilenas
- Normativa tributaria chilena (SII, IVA, impuesto a la renta, exenciones educacionales)
- Análisis de estructura de costos educacionales (docencia, infraestructura, administración)
- Flujo de caja, capital de trabajo, sostenibilidad financiera
- Estrategia de negocios en educación: diversificación de ingresos (OTEC, convenios, matrículas)
- Proyecciones financieras y análisis de escenarios
- Inversiones, ROI educacional, costo por alumno
- Cumplimiento normativo MINEDUC y CNA en aspectos financieros

CONTEXTO IDMA:
- CFT ambiental con ~700 estudiantes de pregrado
- Unidad OTEC generando ingresos adicionales (cursos SENCE, diplomados)
- Preparándose para acreditación CNA 2027 (gestión financiera es criterio clave)
- Necesita demostrar sostenibilidad financiera a evaluadores

INSTRUCCIONES:
- Responde en español chileno profesional
- Sé específico con números y porcentajes cuando los datos lo permitan
- Propón estrategias concretas de optimización
- Identifica oportunidades de ahorro y nuevas fuentes de ingreso
- Relaciona todo con sostenibilidad para acreditación`;

const SYSTEM_AUDITOR = `Eres un Auditor Financiero Externo evaluando CFT IDMA, institución chilena de educación técnico-profesional.

Eres RIGUROSO, METÓDICO y EXIGENTE. Buscas inconsistencias, riesgos y debilidades en la gestión financiera.

EXPERTISE:
- Auditoría financiera de IES chilenas
- Normativa SII, IFRS para entidades sin fines de lucro
- Detección de riesgos financieros y contingencias tributarias
- Evaluación de controles internos y gobernanza financiera
- Cumplimiento normativo MINEDUC, CNA, Contraloría
- Análisis forense de estados financieros

INSTRUCCIONES:
- Evalúa como auditor externo real
- Señala riesgos sin suavizarlos
- Pide documentación cuando falte
- Identifica banderas rojas en los datos
- Usa tono formal de informe de auditoría
- Responde en español`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate JWT and check role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check role using service role client
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const userRoles = (roles || []).map((r: any) => r.role);
    if (!userRoles.includes("director") && !userRoles.includes("dg")) {
      return new Response(JSON.stringify({ error: "Acceso restringido a Director y DG" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ALLOWED_MODELS = [
      "google/gemini-3-flash-preview",
      "google/gemini-2.5-pro",
      "openai/gpt-5",
      "openai/gpt-5-mini",
    ];

    const { messages, mode = "analista", model: requestedModel } = await req.json();
    const model = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : "google/gemini-3-flash-preview";

    // Fetch financial context
    const [financialRes, metricsRes, otecRes] = await Promise.all([
      supabase.from("financial_records").select("*").order("period", { ascending: false }).limit(100),
      supabase.from("institutional_metrics").select("*").order("period", { ascending: false }).limit(20),
      supabase.from("otec_programs").select("*").order("created_at", { ascending: false }),
    ]);

    const records = financialRes.data || [];
    const ingresos = records.filter((r: any) => r.record_type === "ingreso");
    const gastos = records.filter((r: any) => r.record_type === "gasto");
    const totalIngresos = ingresos.reduce((s: number, r: any) => s + Number(r.amount), 0);
    const totalGastos = gastos.reduce((s: number, r: any) => s + Number(r.amount), 0);
    const balance = totalIngresos - totalGastos;
    const margen = totalIngresos > 0 ? ((balance / totalIngresos) * 100).toFixed(1) : "0";

    const financialContext = `
DATOS FINANCIEROS ACTUALES (${records.length} registros):
- Total ingresos: $${(totalIngresos / 1000000).toFixed(1)}M CLP
- Total gastos: $${(totalGastos / 1000000).toFixed(1)}M CLP
- Balance: $${(balance / 1000000).toFixed(1)}M CLP
- Margen: ${margen}%

DETALLE INGRESOS (${ingresos.length}):
${ingresos.map((r: any) => `- ${r.concept} (${r.category}, ${r.period}): $${(Number(r.amount) / 1000000).toFixed(2)}M`).join("\n") || "Sin registros aún"}

DETALLE GASTOS (${gastos.length}):
${gastos.map((r: any) => `- ${r.concept} (${r.category}, ${r.period}): $${(Number(r.amount) / 1000000).toFixed(2)}M`).join("\n") || "Sin registros aún"}

MÉTRICAS INSTITUCIONALES:
${(metricsRes.data || []).map((m: any) => `${m.metric_key}: ${m.metric_value} (${m.period})`).join(", ") || "Sin datos"}

PROGRAMAS OTEC (revenue):
${(otecRes.data || []).map((p: any) => `${p.name} (${p.type}, ${p.status}): ${p.students_enrolled} estudiantes, revenue $${(Number(p.revenue || 0) / 1000000).toFixed(2)}M`).join("\n") || "Sin programas"}
`;

    const systemPrompt = (mode === "auditor" ? SYSTEM_AUDITOR : SYSTEM_ANALISTA) + "\n\n" + financialContext;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de requests alcanzado. Intenta en unos minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("financial-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
