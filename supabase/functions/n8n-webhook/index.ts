import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { agent_id, status, items_processed, error_message, duration_ms, workflow_id } = body

    if (!agent_id || !status) {
      return new Response(JSON.stringify({ error: 'agent_id and status required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Record execution
    await supabase.from('executions').insert({
      agent_id,
      workflow_id,
      status,
      items_processed: items_processed || 0,
      error_message,
      duration_ms,
      started_at: new Date(Date.now() - (duration_ms || 0)).toISOString(),
      finished_at: new Date().toISOString(),
    })

    // Update agent status
    await supabase.from('agents').update({
      last_run: new Date().toISOString(),
      status: status === 'success' ? 'operativo' : 'error',
      items_processed_24h: items_processed || 0,
      updated_at: new Date().toISOString(),
    }).eq('id', agent_id)

    // Auto-create alert on error
    if (status === 'error') {
      await supabase.from('alerts').insert({
        agent_id,
        priority: 'alta',
        title: `Error en ${agent_id}: workflow falló`,
        description: error_message || 'Error desconocido',
        action_required: 'Revisar logs de n8n y reintentar',
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
