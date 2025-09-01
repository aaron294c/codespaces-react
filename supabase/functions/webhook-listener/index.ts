// supabase/functions/webhook-listener/index.ts
// DB Webhook -> Edge Function router -> (optional) external webhooks

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

type JSONValue = string | number | boolean | null | JSONValue[] | { [k: string]: JSONValue }

interface QueueRecord {
  id: string
  event_name: string
  payload: JSONValue | string
  status?: string
  attempts?: number
  created_at?: string
}

interface WebhookConfig {
  big_spend_url?: string
  budget_threshold_url?: string
  new_member_url?: string
  shared_secret: string
  big_spend_threshold: number
  budget_threshold_pct: number
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    // Allow simple health check & CORS preflight without secrets
    if (req.method === 'GET') {
      return new Response(getStatusPage(), { headers: { 'Content-Type': 'text/html' } })
    }
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 })
    }
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Only enforce secret if you actually set one in Secrets.
    const configuredSecret = Deno.env.get('WEBHOOK_SHARED_SECRET') ?? ''
    if (configuredSecret) {
      const incoming = req.headers.get('x-webhook-secret') ?? ''
      if (incoming !== configuredSecret) {
        return new Response('unauthorized', { status: 401 })
      }
    }

    const body = await req.json().catch(() => ({} as any))
    // Two shapes supported:
    // A) Database Webhook (table == 'webhook_queue', record/new contains row)
    // B) Direct posts: { event, payload }

    // --- A) From Database Webhook watching public.webhook_queue
    if ((body?.table === 'webhook_queue' || body?.table === 'public.webhook_queue') && (body?.record || body?.new)) {
      const rec = (body.record ?? body.new) as QueueRecord
      await routeEvent(rec.event_name, coercePayload(rec.payload))
      // Mark queue item as sent (or failed inside routeEvent try/catch)
      const { error } = await supabase.rpc('mark_webhook_sent', { webhook_id: rec.id })
      if (error) console.error('mark_webhook_sent error:', error)
      return new Response('ok', { status: 200 })
    }

    // --- B) Direct posts (optional)
    if (body?.event) {
      await routeEvent(body.event, body.payload)
      return new Response('ok', { status: 200 })
    }

    console.log('Unrecognized payload shape:', body)
    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response('internal error', { status: 500 })
  }
})

function getConfig(): WebhookConfig {
  return {
    big_spend_url: Deno.env.get('WEBHOOK_BIG_SPEND_URL') || undefined,
    budget_threshold_url: Deno.env.get('WEBHOOK_BUDGET_THRESHOLD_URL') || undefined,
    new_member_url: Deno.env.get('WEBHOOK_NEW_MEMBER_URL') || undefined,
    shared_secret: Deno.env.get('WEBHOOK_SHARED_SECRET') ?? '',
    big_spend_threshold: parseFloat(Deno.env.get('BIG_SPEND_THRESHOLD') || '150.00'),
    budget_threshold_pct: parseFloat(Deno.env.get('BUDGET_THRESHOLD_PCT') || '0.8'),
  }
}

function coercePayload(p: unknown): any {
  if (typeof p === 'string') {
    try { return JSON.parse(p) } catch { return { raw: p } }
  }
  return p
}

async function routeEvent(eventName: string, payload: any) {
  const cfg = getConfig()
  try {
    switch (eventName) {
      case 'big_spend':
        await handleBigSpend(payload, cfg); break
      case 'budget_threshold':
        await handleBudgetThreshold(payload, cfg); break
      case 'new_member':
        await handleNewMember(payload, cfg); break
      default:
        console.log('Unknown event:', eventName)
    }
  } catch (err) {
    console.error(`Handler for ${eventName} failed:`, err)
    // If this came via queue, mark as failed so your retry loop can pick it up
    if (payload?.id) {
      const { error } = await supabase.rpc('mark_webhook_failed', { webhook_id: payload.id })
      if (error) console.error('mark_webhook_failed error:', error)
    }
    throw err
  }
}

async function handleBigSpend(payload: any, cfg: WebhookConfig) {
  console.log('big_spend:', payload)
  if (cfg.big_spend_url) {
    await sendExternalWebhook(cfg.big_spend_url, { type: 'big_spend_alert', ...payload }, cfg.shared_secret)
  }
}

async function handleBudgetThreshold(payload: any, cfg: WebhookConfig) {
  console.log('budget_threshold:', payload)
  if (cfg.budget_threshold_url) {
    await sendExternalWebhook(cfg.budget_threshold_url, { type: 'budget_threshold_alert', ...payload }, cfg.shared_secret)
  }
}

async function handleNewMember(payload: any, cfg: WebhookConfig) {
  console.log('new_member:', payload)
  if (cfg.new_member_url) {
    await sendExternalWebhook(cfg.new_member_url, { type: 'new_member_joined', ...payload }, cfg.shared_secret)
  }
}

async function sendExternalWebhook(url: string, data: any, secret: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': secret,
      'User-Agent': 'Supabase-ExpenseApp/1.0',
    },
    body: JSON.stringify({ timestamp: Date.now(), source: 'expense_tracker', data }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`External webhook failed ${res.status}: ${text}`)
  }
}

function getStatusPage() {
  return `
<!doctype html><html><head><meta charset="utf-8"><title>Webhook Listener</title>
<style>body{font-family:ui-sans-serif,system-ui;margin:40px}code{background:#f5f5f5;padding:2px 6px;border-radius:4px}</style></head>
<body>
  <h1>Expense Tracker Webhook Listener</h1>
  <p>✅ Running</p>
  <ul>
    <li>Big Spend URL: ${Deno.env.get('WEBHOOK_BIG_SPEND_URL') ? '✅' : '❌'}</li>
    <li>Budget Threshold URL: ${Deno.env.get('WEBHOOK_BUDGET_THRESHOLD_URL') ? '✅' : '❌'}</li>
    <li>New Member URL: ${Deno.env.get('WEBHOOK_NEW_MEMBER_URL') ? '✅' : '❌'}</li>
    <li>Secret set: ${Deno.env.get('WEBHOOK_SHARED_SECRET') ? '✅' : '❌'}</li>
  </ul>
  <p>If you use Database Webhooks → “HTTP Request”, set header <code>x-webhook-secret</code>
     to match <code>WEBHOOK_SHARED_SECRET</code>. If you use “Supabase Edge Functions” type,
     you can leave <code>WEBHOOK_SHARED_SECRET</code> empty to skip the header check.</p>
</body></html>`
}
