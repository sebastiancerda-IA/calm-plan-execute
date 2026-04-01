import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY')
    if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY not configured — conecta el connector de Telegram')

    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')
    if (!TELEGRAM_CHAT_ID) throw new Error('TELEGRAM_CHAT_ID not configured')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { action } = body

    // Action: send_alert — enviar alerta específica
    if (action === 'send_alert') {
      const { title, description, priority } = body
      const emoji = priority === 'critica' ? '🔴' : priority === 'alta' ? '🟠' : '🟡'
      const text = `${emoji} <b>Alerta ${priority?.toUpperCase()}</b>\n\n<b>${title}</b>\n${description || ''}\n\n🕐 ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`

      const resp = await fetch(`${GATEWAY_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(`Telegram API error [${resp.status}]: ${JSON.stringify(data)}`)

      return new Response(JSON.stringify({ ok: true, message_id: data.result?.message_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: daily_summary — resumen diario del sistema
    if (action === 'daily_summary') {
      // Agentes operativos
      const { data: agents } = await supabase.from('agents').select('id, name, status')
      const operativos = agents?.filter((a: any) => a.status === 'operativo').length || 0
      const totalAgents = agents?.length || 0
      const errores = agents?.filter((a: any) => a.status === 'error') || []

      // Alertas activas
      const { count: activeAlerts } = await supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('resolved', false)

      // Emails procesados últimas 24h
      const { count: emails24h } = await supabase
        .from('email_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 86400000).toISOString())

      // Construir mensaje
      let text = `📊 <b>Resumen Diario — La Orquesta IDMA</b>\n`
      text += `🕐 ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}\n\n`
      text += `🤖 Agentes: <b>${operativos}/${totalAgents}</b> operativos\n`
      text += `📧 Emails 24h: <b>${emails24h || 0}</b>\n`
      text += `⚠️ Alertas activas: <b>${activeAlerts || 0}</b>\n`

      if (errores.length > 0) {
        text += `\n🔴 <b>Agentes con error:</b>\n`
        errores.forEach((a: any) => { text += `  • ${a.name}\n` })
      }

      text += `\n✅ Sistema ${errores.length === 0 ? 'operando normalmente' : 'requiere atención'}`

      const resp = await fetch(`${GATEWAY_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(`Telegram API error [${resp.status}]: ${JSON.stringify(data)}`)

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'action must be send_alert or daily_summary' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
