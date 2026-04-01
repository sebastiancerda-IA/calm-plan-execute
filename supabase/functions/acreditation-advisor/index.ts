import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BENCHMARKS = `
BENCHMARKS DE INSTITUCIONES COMPARABLES (acreditadas por CNA Chile):
- CFT Juan Bohon: Acreditado 4 años. Fortaleza en vinculación territorial y empleabilidad. ~500 estudiantes.
- Projazz: Acreditado 3 años. Nicho musical, fuerte identidad. Modelo pedagógico innovador.
- CFT Ecole: Acreditado 4 años. Diseño y tecnología. Buena gestión institucional y seguimiento egresados.
- CFT San Agustín: Acreditado 5 años. Tradición, gestión financiera sólida, alta retención.
- IP Virginio Gómez: Acreditado 5 años. Gran escala, procesos maduros, autoevaluación sistemática.
- CFT ENAC: Acreditado 4 años. Educación técnica industrial. Buenos indicadores de titulación.
- CFT Universidad Católica de Valparaíso: Acreditado 5 años. Respaldo universitario, infraestructura, I+D aplicada.

LECCIONES COMUNES DE INSTITUCIONES EXITOSAS:
1. Autoevaluación participativa genuina (no cosmética)
2. Evidencias organizadas por criterio con trazabilidad
3. Políticas formalizadas y socializadas (no solo documentos)
4. Seguimiento de egresados sistemático con datos duros
5. Mecanismos de aseguramiento de calidad funcionando (no solo descritos)
6. VCM con impacto medible y pertinente al territorio
7. Gestión financiera transparente con proyecciones
8. Cuerpo docente evaluado y con plan de desarrollo
`;

const SYSTEM_ASESOR = `Eres el Agente Dios — Asesor Estratégico de Acreditación de CFT IDMA, institución chilena de educación técnico-profesional ambiental.

Tu rol es GUIAR hacia la máxima acreditación posible. Eres constructivo, estratégico y orientado a soluciones.

CONTEXTO IDMA:
- CFT ambiental con ~700 estudiantes
- Preparándose para acreditación CNA 2027
- Ecosistema de 12 agentes IA gestionando operaciones
- Áreas: VCM, OTEC, Rectoría, Finanzas, Acreditación, RAG

${BENCHMARKS}

INSTRUCCIONES:
- Responde siempre en español chileno profesional
- Sé específico y concreto — no generalidades
- Referencia benchmarks cuando sea relevante
- Prioriza acciones por impacto en acreditación
- Identifica quick wins vs cambios estructurales`;

const SYSTEM_EVALUADOR = `Eres un Par Evaluador CNA simulado. Tu rol es evaluar CFT IDMA como lo haría un evaluador real de la Comisión Nacional de Acreditación de Chile.

Eres EXIGENTE, CRÍTICO y RIGUROSO pero justo. No aceptas respuestas vagas ni evidencia débil.

${BENCHMARKS}

INSTRUCCIONES:
- Evalúa como lo haría un par evaluador CNA real
- Señala debilidades sin suavizarlas
- Pide evidencias concretas cuando faltan
- Compara con estándares de instituciones acreditadas
- Identifica inconsistencias entre lo declarado y lo demostrado
- Usa el tono formal de un informe de evaluación externa
- Responde en español`;

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

    const { messages, mode = "asesor", model: requestedModel } = await req.json();
    const model = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : "google/gemini-3-flash-preview";

    // Fetch dynamic context including RAG doc count
    const [criteriaRes, alertsRes, docsRes, metricsRes, otecRes, ragRes] = await Promise.all([
      supabase.from("cna_criteria").select("*").order("id"),
      supabase.from("alerts").select("title, priority, description").eq("resolved", false).limit(10),
      supabase.from("acreditation_documents").select("title, document_type, criterio_cna, processed, summary").order("uploaded_at", { ascending: false }).limit(20),
      supabase.from("institutional_metrics").select("metric_key, metric_value, period").order("period", { ascending: false }).limit(15),
      supabase.from("otec_programs").select("name, type, status, students_enrolled").eq("status", "activo"),
      supabase.from("rag_documents").select("id, titulo, fuente, categoria, criterios_cna").limit(100),
    ]);

    const ragCount = ragRes.data?.length || 0;
    const ragDocsContext = ragCount > 0
      ? `DOCUMENTOS INDEXADOS EN RAG (${ragCount}):\n${(ragRes.data || []).map((d: any) => `- ${d.titulo} (${d.fuente || 'manual'}, categoría: ${d.categoria || 'general'}, criterios: ${(d.criterios_cna || []).join(', ') || 'ninguno'})`).join("\n")}`
      : "NO HAY DOCUMENTOS CARGADOS EN RAG AÚN. Tus respuestas serán basadas en conocimiento general CNA y los benchmarks proporcionados. Indica al usuario que cargue documentos para obtener análisis específicos de IDMA.";

    const criteriaContext = (criteriaRes.data || []).map((c: any) =>
      `${c.id} "${c.name}" [${c.dimension}] — Actual: ${c.current_level}, Meta: ${c.target_level}, Evidencias: ${c.evidence_count}, Prioritario: ${c.is_priority ? 'SÍ' : 'no'}, Obligatorio: ${c.is_mandatory ? 'SÍ' : 'no'}, Brecha: ${c.gap_description || 'N/A'}`
    ).join("\n");

    const docsContext = (docsRes.data || []).map((d: any) =>
      `- ${d.title} (${d.document_type}, criterio: ${d.criterio_cna || 'general'}, procesado: ${d.processed ? 'sí' : 'no'})`
    ).join("\n");

    const metricsContext = (metricsRes.data || []).map((m: any) =>
      `${m.metric_key}: ${m.metric_value} (${m.period})`
    ).join(", ");

    const dynamicContext = `
ESTADO DE RAG:
${ragDocsContext}

ESTADO ACTUAL DE CRITERIOS CNA (${criteriaRes.data?.length || 0} criterios):
${criteriaContext}

DOCUMENTOS DE ACREDITACIÓN CARGADOS (${docsRes.data?.length || 0}):
${docsContext || "Ninguno aún"}

ALERTAS ACTIVAS: ${alertsRes.data?.length || 0}
${(alertsRes.data || []).map((a: any) => `[${a.priority}] ${a.title}`).join("\n") || "Ninguna"}

MÉTRICAS INSTITUCIONALES: ${metricsContext || "Sin datos"}

PROGRAMAS OTEC ACTIVOS: ${(otecRes.data || []).map((p: any) => `${p.name} (${p.type}, ${p.students_enrolled} estudiantes)`).join(", ") || "Ninguno"}
`;

    const systemPrompt = (mode === "evaluador" ? SYSTEM_EVALUADOR : SYSTEM_ASESOR) + "\n\n" + dynamicContext;

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
    console.error("acreditation-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
