import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ALLOWED_MODELS = [
      "google/gemini-3-flash-preview",
      "google/gemini-2.5-pro",
      "openai/gpt-5",
      "openai/gpt-5-mini",
    ];

    const { type, model: requestedModel } = await req.json();
    const model = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : "google/gemini-3-flash-preview";

    // Fetch current CNA state
    const { data: criteria } = await supabase
      .from("cna_criteria")
      .select("*")
      .order("id");

    // Fetch active alerts
    const { data: alerts } = await supabase
      .from("alerts")
      .select("title, priority, description")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(10);

    const criteriaText = (criteria || []).map((c: any) =>
      `${c.id} "${c.name}" - Nivel actual: ${c.current_level}, Meta: ${c.target_level}, Evidencias: ${c.evidence_count}, Brecha: ${c.gap_description || 'ninguna'}, Prioritario: ${c.is_priority ? 'SÍ' : 'no'}, Obligatorio: ${c.is_mandatory ? 'SÍ' : 'no'}`
    ).join("\n");

    const alertsText = (alerts || []).map((a: any) =>
      `[${a.priority}] ${a.title}: ${a.description}`
    ).join("\n");

    let systemPrompt: string;
    let userPrompt: string;

    if (type === "briefing") {
      systemPrompt = "Eres el asistente estratégico de CFT IDMA, una institución chilena de educación técnico-profesional ambiental. Genera briefings ejecutivos concisos en español.";
      userPrompt = `Genera un briefing ejecutivo del día para el Director de CFT IDMA basado en:

ALERTAS ACTIVAS:
${alertsText || "Sin alertas activas"}

ESTADO CNA:
${criteriaText}

Formato: 3-5 puntos clave, cada uno con acción sugerida. Máximo 300 palabras.`;
    } else {
      systemPrompt = "Eres un asesor experto en acreditación CNA para instituciones de educación superior técnico-profesional en Chile. Conoces en detalle los criterios de la CNA y las estrategias para alcanzar el máximo nivel de acreditación posible. Responde siempre en español.";
      userPrompt = `Analiza el estado actual de los 16 criterios CNA de CFT IDMA y genera:

1. DIAGNÓSTICO: Estado general y nivel de acreditación estimado alcanzable
2. BRECHAS CRÍTICAS: Los 5 criterios más urgentes con justificación
3. PLAN 30 DÍAS: Acciones concretas priorizadas para los próximos 30 días
4. RECOMENDACIONES: Estrategias para maximizar el resultado de acreditación

ESTADO ACTUAL DE CRITERIOS:
${criteriaText}

ALERTAS ACTIVAS:
${alertsText || "Sin alertas"}

Sé específico, concreto y orientado a la acción. Máximo 500 palabras.`;
    }

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de requests alcanzado. Intenta en unos minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "Sin respuesta";

    return new Response(JSON.stringify({
      summary: content,
      type,
      criteria_count: criteria?.length || 0,
      alerts_count: alerts?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cna-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
