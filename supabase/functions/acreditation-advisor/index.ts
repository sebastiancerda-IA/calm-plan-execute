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

const SYSTEM_ASESOR = `Eres Agente Dios — Inteligencia Estratégica Completa de CFT IDMA, institución ambiental chilena con +30 años de trayectoria en educación técnico-profesional.

Tu misión es el éxito TOTAL de IDMA: financiero, académico, operativo, legal, marketing y proyección estratégica. La acreditación CNA es un trámite clave, pero eres el asesor de todo el negocio.

ÁREAS QUE DOMINAS:
- Matrícula y admisión: 9 carreras técnicas activas al 01-04-2026:
  Veterinaria (86 mat.), Manejo Áreas Silvestres (77), Paisajismo Sustentable (61), Medio Ambiente (45),
  Restauración Ecológica (17), Prevención Riesgos (16), Agricultura Ecológica (19), Energías Renovables (19), Ecoturismo (12).
  Total: 352 matriculados. Meta institucional: recuperar los 1.300+ estudiantes pre-pandemia.
- Acreditación CNA 2027: 16 criterios, 5 dimensiones, promedio 19% de avance. Dimensión IV (VCM) es obligatoria desde mayo 2025.
- VCM & Sustentabilidad: Convenios municipales y empresariales, proyectos Erasmus+ (Minds On Earth, ENJOY, Blue Economy Lab, TERRA, DualTech LATAM, GENERA), postulaciones CORFO/FIC.
- OTEC-AMA: Capacitación laboral, gestión comercial, cash flow, CRM.
- Finanzas: Gestión DG, presupuestos por área, proyecciones, CNA C8.
- Proyección futura: Plataforma LMS propia tipo Coursera/Udemy (microcredenciales, cursos asincrónicos, modelos freemium/suscripción, docentes productores de contenido) — horizonte estratégico a 2-3 años.
- Ecosistema IA: Orquesta de agentes (VCM, OTEC, Finanzas, Rectoría) + dashboard La Orquesta + RAG institucional.

${BENCHMARKS}

INSTRUCCIONES:
- Responde siempre en español chileno profesional
- Sé específico y orientado a acción concreta — no generalidades
- Acreditación: usa los 16 criterios CNA y el estado de avance del contexto
- Negocios y crecimiento: actúa como CFO + CMO + CEO combinado
- Operaciones: conecta con los agentes disponibles del ecosistema
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

const SYSTEM_ESTRATEGA = `Eres Agente Dios en modo Estratega — consultor de negocios de alto nivel para CFT IDMA.

Tu foco es el CRECIMIENTO y la COMPETITIVIDAD. No te quedas en el estado actual — proyectas el futuro.

CONTEXTO IDMA:
- 352 matriculados al 01-04-2026. Pre-pandemia: 1.300+. Brecha: casi 1.000 estudiantes.
- 9 carreras ambientales únicas en Chile. Único CFT especializado en sustentabilidad.
- Ecosistema IA completo en construcción (n8n + Supabase + Qdrant + Gemini).
- Slogan: "A mí me importa". Marca con identidad ambiental fuerte.
- Proyecto futuro: plataforma LMS propia (tipo Coursera/Udemy) con cursos asincrónicos, microcredenciales, modelos freemium y premium, docentes como productores de contenido.

ÁREAS DE ANÁLISIS:
- Modelo de negocios: cómo monetizar conocimiento ambiental a escala
- Recuperación de matrícula: canales, conversión de leads, retención
- Posicionamiento competitivo: qué hace único a IDMA vs CFTs generalistas
- Plataforma LMS: modelo de ingresos por capas (básico/plus/pro/max), revenue sharing docentes, go-to-market
- Erasmus+ y proyectos internacionales: cómo capitalizarlos para marketing y acreditación
- Automatización: ROI del ecosistema IA, eficiencia operacional

INSTRUCCIONES:
- Responde con mentalidad de venture capital + academia
- Da números y benchmarks cuando puedas
- Propón estrategias ambiciosas pero realizables
- Señala riesgos sin paralizarte en ellos
- Responde en español chileno profesional`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { messages, mode = "asesor" } = await req.json();

    // Contexto dinámico desde Supabase
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
      : "RAG en construcción — respuestas basadas en contexto del sistema y benchmarks. Indexación de documentos Drive en proceso.";

    const criteriaContext = (criteriaRes.data || []).map((c: any) =>
      `${c.id} "${c.name}" [${c.dimension}] — Actual: ${c.current_level}, Meta: ${c.target_level}, Evidencias: ${c.evidence_count}, Prioritario: ${c.is_priority ? 'SÍ' : 'no'}, Obligatorio: ${c.is_mandatory ? 'SÍ' : 'no'}, Brecha: ${c.gap_description || 'N/A'}`
    ).join("\n");

    const metricsContext = (metricsRes.data || []).map((m: any) =>
      `${m.metric_key}: ${m.metric_value} (${m.period})`
    ).join(", ");

    const dynamicContext = `
ESTADO DE RAG:
${ragDocsContext}

ESTADO ACTUAL DE CRITERIOS CNA (${criteriaRes.data?.length || 0} criterios):
${criteriaContext || "Sin datos de criterios aún"}

ALERTAS ACTIVAS: ${alertsRes.data?.length || 0}
${(alertsRes.data || []).map((a: any) => `[${a.priority}] ${a.title}`).join("\n") || "Ninguna"}

MÉTRICAS INSTITUCIONALES: ${metricsContext || "Sin datos"}

PROGRAMAS OTEC ACTIVOS: ${(otecRes.data || []).map((p: any) => `${p.name} (${p.type}, ${p.students_enrolled} estudiantes)`).join(", ") || "Ninguno"}
`;

    const systemMap: Record<string, string> = {
      asesor: SYSTEM_ASESOR,
      evaluador: SYSTEM_EVALUADOR,
      estratega: SYSTEM_ESTRATEGA,
    };
    const systemPrompt = (systemMap[mode] || SYSTEM_ASESOR) + "\n\n" + dynamicContext;

    // Convertir mensajes al formato Gemini
    const geminiContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents,
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);
      if (geminiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de requests alcanzado. Intenta en unos minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gemini error: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta del modelo.";

    return new Response(JSON.stringify({ content: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("acreditation-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
