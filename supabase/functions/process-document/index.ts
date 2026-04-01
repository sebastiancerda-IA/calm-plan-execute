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

    const { document_id } = await req.json();
    if (!document_id) throw new Error("document_id required");

    // Get document record
    const { data: doc, error: docErr } = await supabase
      .from("acreditation_documents")
      .select("*")
      .eq("id", document_id)
      .single();
    if (docErr || !doc) throw new Error("Document not found");

    if (doc.processed) {
      return new Response(JSON.stringify({ message: "Already processed", summary: doc.summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate summary using AI based on document metadata
    const prompt = `Genera un resumen ejecutivo de máximo 150 palabras para un documento de acreditación CNA con la siguiente información:
- Título: ${doc.title}
- Tipo: ${doc.document_type}
- Criterio CNA asociado: ${doc.criterio_cna || 'General'}
- Dimensión: ${doc.dimension || 'No especificada'}

El resumen debe destacar:
1. Propósito del documento para la acreditación
2. Criterio(s) CNA que apoya
3. Tipo de evidencia que representa

Responde SOLO con el resumen, sin encabezados ni formato.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Eres un asistente experto en acreditación CNA de instituciones de educación superior chilenas." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", aiResponse.status);
      throw new Error("Failed to generate summary");
    }

    const aiResult = await aiResponse.json();
    const summary = aiResult.choices?.[0]?.message?.content || "Resumen no disponible";

    // Update document with summary
    const { error: updateErr } = await supabase
      .from("acreditation_documents")
      .update({ summary, processed: true })
      .eq("id", document_id);
    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ summary, processed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
