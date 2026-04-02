import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth: accept either supabase JWT or X-Api-Key header matching SUPABASE_SERVICE_ROLE_KEY
    const apiKey = req.headers.get("x-api-key");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // For external callers (Claude Code), validate X-Api-Key
    // For internal (frontend), validate JWT claims via supabase
    const authHeader = req.headers.get("authorization");
    let authenticated = false;

    if (apiKey && apiKey === serviceRoleKey) {
      authenticated = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const token = authHeader.replace("Bearer ", "");
      const authClient = createClient(supabaseUrl, anonKey);
      const { data, error } = await authClient.auth.getClaims(token);
      if (!error && data?.claims?.sub) authenticated = true;
    }

    if (!authenticated) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    const { action, ...params } = body;

    let result: any;

    switch (action) {
      case "get_status": {
        const [agents, criteria, alerts, metrics, documents, otec, executions] = await Promise.all([
          supabase.from("agents").select("*").order("code"),
          supabase.from("cna_criteria").select("*").order("id"),
          supabase.from("alerts").select("*").eq("resolved", false).order("created_at", { ascending: false }),
          supabase.from("institutional_metrics").select("*").order("period", { ascending: false }).limit(20),
          supabase.from("acreditation_documents").select("*").order("uploaded_at", { ascending: false }),
          supabase.from("otec_programs").select("*").order("start_date", { ascending: false }),
          supabase.from("executions").select("*").order("created_at", { ascending: false }).limit(20),
        ]);
        result = {
          agents: agents.data,
          criteria: criteria.data,
          active_alerts: alerts.data,
          metrics: metrics.data,
          documents: documents.data,
          otec_programs: otec.data,
          recent_executions: executions.data,
          timestamp: new Date().toISOString(),
        };
        break;
      }

      case "get_agents": {
        const { data } = await supabase.from("agents").select("*").order("code");
        result = { agents: data };
        break;
      }

      case "get_criteria": {
        const { data } = await supabase.from("cna_criteria").select("*").order("id");
        result = { criteria: data };
        break;
      }

      case "get_alerts": {
        const resolved = params.include_resolved ?? false;
        let q = supabase.from("alerts").select("*").order("created_at", { ascending: false });
        if (!resolved) q = q.eq("resolved", false);
        const { data } = await q;
        result = { alerts: data };
        break;
      }

      case "get_documents": {
        const { data } = await supabase.from("acreditation_documents").select("*").order("uploaded_at", { ascending: false });
        result = { documents: data };
        break;
      }

      case "get_metrics": {
        const { data } = await supabase.from("institutional_metrics").select("*").order("period", { ascending: false });
        result = { metrics: data };
        break;
      }

      case "get_tasks": {
        let q = supabase.from("agent_tasks").select("*").order("created_at", { ascending: false });
        if (params.agent_id) q = q.eq("agent_id", params.agent_id);
        if (params.status) q = q.eq("status", params.status);
        if (params.category) q = q.eq("category", params.category);
        const { data } = await q;
        result = { tasks: data };
        break;
      }

      case "update_agent": {
        const { agent_id, ...updates } = params;
        if (!agent_id) throw new Error("agent_id required");
        const { data, error } = await supabase.from("agents").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", agent_id).select().single();
        if (error) throw error;
        result = { agent: data };
        break;
      }

      case "create_alert": {
        const { data, error } = await supabase.from("alerts").insert({
          title: params.title,
          description: params.description,
          priority: params.priority || "media",
          agent_id: params.agent_id || null,
          action_required: params.action_required || null,
        }).select().single();
        if (error) throw error;
        result = { alert: data };
        break;
      }

      case "add_execution": {
        const { data, error } = await supabase.from("executions").insert({
          agent_id: params.agent_id,
          status: params.status || "success",
          items_processed: params.items_processed || 0,
          duration_ms: params.duration_ms || null,
          started_at: params.started_at || new Date().toISOString(),
          finished_at: params.finished_at || new Date().toISOString(),
          workflow_id: params.workflow_id || null,
          error_message: params.error_message || null,
        }).select().single();
        if (error) throw error;
        // Also update agent last_run
        if (params.agent_id) {
          await supabase.from("agents").update({
            last_run: new Date().toISOString(),
            status: params.status === "error" ? "error" : "operativo",
            items_processed_24h: params.items_processed || 0,
          }).eq("id", params.agent_id);
        }
        result = { execution: data };
        break;
      }

      case "add_rag_doc": {
        const { data, error } = await supabase.from("rag_documents").insert({
          id: params.id || `rag-${Date.now()}`,
          titulo: params.titulo,
          fuente: params.fuente || "manual",
          agent_id: params.agent_id || null,
          categoria: params.categoria || null,
          criterios_cna: params.criterios_cna || [],
          chunk_count: params.chunk_count || 1,
          fecha: params.fecha || new Date().toISOString().split("T")[0],
        }).select().single();
        if (error) throw error;
        result = { document: data };
        break;
      }

      case "update_task": {
        const { task_id, ...updates } = params;
        if (!task_id) throw new Error("task_id required");
        const { data, error } = await supabase.from("agent_tasks").update(updates).eq("id", task_id).select().single();
        if (error) throw error;
        result = { task: data };
        break;
      }

      case "create_financial_record": {
        const { data, error } = await supabase.from("financial_records").insert({
          period: params.period,
          category: params.category || "general",
          concept: params.concept,
          amount: params.amount,
          record_type: params.record_type || "ingreso",
          notes: params.notes || null,
        }).select().single();
        if (error) throw error;
        result = { record: data };
        break;
      }

      case "bulk_financial_records": {
        if (!Array.isArray(params.records)) throw new Error("records array required");
        const { data, error } = await supabase.from("financial_records").insert(params.records).select();
        if (error) throw error;
        result = { records: data, count: data?.length };
        break;
      }

      case "list_qdrant_docs": {
        // Lee documentos directamente de Qdrant — sin pasar por rag_documents Supabase
        const qdrantUrl = "https://qdrant-production-e4a5.up.railway.app";
        const scrollBody: any = {
          limit: params.limit || 500,
          with_payload: true,
          with_vector: false,
        };
        if (params.categoria) {
          scrollBody.filter = { must: [{ key: "categoria", match: { value: params.categoria } }] };
        }
        const qdrantRes = await fetch(`${qdrantUrl}/collections/idma_knowledge/points/scroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scrollBody),
        });
        if (!qdrantRes.ok) throw new Error(`Qdrant error: ${qdrantRes.status}`);
        const qdrantData = await qdrantRes.json();
        const points = qdrantData.result?.points || [];

        // Agrupar chunks por titulo → documentos únicos con conteo de chunks
        const docMap: Record<string, any> = {};
        for (const p of points) {
          const key = p.payload?.titulo || p.payload?.title || p.id;
          if (!docMap[key]) {
            docMap[key] = {
              id: String(p.id),
              titulo: p.payload?.titulo || p.payload?.title || "Sin título",
              fuente: p.payload?.fuente || "drive",
              categoria: p.payload?.categoria || "general",
              criterios_cna: p.payload?.criterios_cna || [],
              chunk_count: 0,
              fecha: p.payload?.fecha || p.payload?.indexed_at || new Date().toISOString().split("T")[0],
            };
          }
          docMap[key].chunk_count += 1;
        }
        const documents = Object.values(docMap);
        result = { documents, total_chunks: points.length, total_docs: documents.length };
        break;
      }

      case "bulk_rag_docs": {
        if (!Array.isArray(params.documents)) throw new Error("documents array required");
        const docs = params.documents.map((d: any) => ({
          id: d.id || `rag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          titulo: d.titulo,
          fuente: d.fuente || "manual",
          agent_id: d.agent_id || null,
          categoria: d.categoria || null,
          criterios_cna: d.criterios_cna || [],
          chunk_count: d.chunk_count || 1,
          fecha: d.fecha || new Date().toISOString().split("T")[0],
        }));
        const { data, error } = await supabase.from("rag_documents").insert(docs).select();
        if (error) throw error;
        result = { documents: data, count: data?.length };
        break;
      }

      case "get_convenios": {
        const { data } = await supabase.from("convenios").select("*").order("created_at", { ascending: false });
        result = { convenios: data };
        break;
      }

      case "get_financial_summary": {
        const { data: fin } = await supabase.from("financial_records").select("*").order("period");
        const recs = fin || [];
        const ing = recs.filter((r: any) => r.record_type === "ingreso");
        const gas = recs.filter((r: any) => r.record_type === "gasto");
        const totalIng = ing.reduce((s: number, r: any) => s + Number(r.amount), 0);
        const totalGas = gas.reduce((s: number, r: any) => s + Number(r.amount), 0);
        const byPeriod: Record<string, { ingresos: number; gastos: number }> = {};
        recs.forEach((r: any) => {
          if (!byPeriod[r.period]) byPeriod[r.period] = { ingresos: 0, gastos: 0 };
          byPeriod[r.period][r.record_type === "ingreso" ? "ingresos" : "gastos"] += Number(r.amount);
        });
        result = {
          total_ingresos: totalIng, total_gastos: totalGas, balance: totalIng - totalGas,
          margen_pct: totalIng > 0 ? ((totalIng - totalGas) / totalIng * 100).toFixed(1) : "0",
          records_count: recs.length, by_period: byPeriod,
        };
        break;
      }

      case "get_ui_state": {
        result = {
          version: "2.4.0",
          theme: "dark-default",
          features: [
            "pwa", "glass-morphism", "financial-advisor", "cna-advisor",
            "acreditation-advisor", "model-selector", "csv-export",
            "audit-log", "in-app-notifications", "realtime-rag",
            "convenios-templates", "rbac", "mobile-nav", "dashboard-analytics",
          ],
          edge_functions: [
            "orchestrator-api", "financial-advisor", "cna-advisor",
            "acreditation-advisor", "process-document", "n8n-webhook",
          ],
          pages: [
            "/", "/agents", "/alerts", "/acreditacion", "/cna",
            "/finanzas", "/convenios", "/rag", "/settings", "/install",
          ],
          component_count: 45,
          timestamp: new Date().toISOString(),
        };
        break;
      }

      case "get_system_health": {
        const [agRes, exRes, alRes] = await Promise.all([
          supabase.from("agents").select("id, code, name, status, last_run, error_rate, items_processed_24h"),
          supabase.from("executions").select("*").order("created_at", { ascending: false }).limit(20),
          supabase.from("alerts").select("id, priority").eq("resolved", false),
        ]);
        const agents = agRes.data || [];
        const errorAgents = agents.filter((a: any) => a.status === "error");
        result = {
          agents_total: agents.length,
          agents_operative: agents.filter((a: any) => a.status === "operativo").length,
          agents_error: errorAgents.length,
          error_agents: errorAgents.map((a: any) => a.code),
          active_alerts: alRes.data?.length || 0,
          critical_alerts: (alRes.data || []).filter((a: any) => a.priority === "critica").length,
          recent_executions: exRes.data?.length || 0,
          health_score: agents.length > 0
            ? Math.round(((agents.length - errorAgents.length) / agents.length) * 100)
            : 0,
          timestamp: new Date().toISOString(),
        };
        break;
      }

      default:
        return new Response(JSON.stringify({
          error: `Unknown action: ${action}`,
          available_actions: [
            "get_status", "get_agents", "get_criteria", "get_alerts",
            "get_documents", "get_metrics", "get_tasks", "get_convenios",
            "get_financial_summary", "get_system_health", "get_ui_state",
            "update_agent", "create_alert", "add_execution", "add_rag_doc", "update_task",
            "create_financial_record", "bulk_financial_records", "bulk_rag_docs",
          ],
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("orchestrator-api error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
