// supabase/functions/webhook-listener/index.ts
// COMPLETE INTEGRATION: Database notifications → Edge Function → External webhooks

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

interface WebhookEvent {
  event: string
  payload: any
  timestamp: number
}

interface WebhookConfig {
  big_spend_url?: string
  budget_threshold_url?: string
  new_member_url?: string
  shared_secret: string
  big_spend_threshold: number
  budget_threshold_pct: number
}

serve(async (req) => {
  try {
    const config: WebhookConfig = {
      big_spend_url: Deno.env.get('WEBHOOK_BIG_SPEND_URL'),
      budget_threshold_url: Deno.env.get('WEBHOOK_BUDGET_THRESHOLD_URL'),
      new_member_url: Deno.env.get('WEBHOOK_NEW_MEMBER_URL'),
      shared_secret: Deno.env.get('WEBHOOK_SHARED_SECRET') || '',
      big_spend_threshold: parseFloat(Deno.env.get('BIG_SPEND_THRESHOLD') || '150.00'),
      budget_threshold_pct: parseFloat(Deno.env.get('BUDGET_THRESHOLD_PCT') || '0.8')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Handle direct webhook calls (from database triggers via Database Webhook)
      return await handleDatabaseNotification(req, config)
    }

    if (req.method === 'GET') {
      // Return status page
      return new Response(getStatusPage(), {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    return new Response('Method not allowed', { status: 405 })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})

async function handleDatabaseNotification(req: Request, config: WebhookConfig) {
  try {
    // Parse the notification from the database
    const body = await req.json()
    
    // Handle different notification formats
    let event: WebhookEvent
    
    if (body.type === 'INSERT' && body.table === 'webhook_queue') {
      // From Database Webhook integration
      event = JSON.parse(body.record.payload)
    } else if (body.event) {
      // Direct event format
      event = body
    } else {
      console.log('Unknown notification format:', body)
      return new Response('OK', { status: 200 })
    }

    console.log('Processing database notification:', event.event)

    // Route to appropriate handler
    switch (event.event) {
      case 'big_spend':
        await handleBigSpend(event.payload, config)
        break
      case 'budget_threshold':
        await handleBudgetThreshold(event.payload, config)
        break
      case 'new_member':
        await handleNewMember(event.payload, config)
        break
      default:
        console.log('Unknown event type:', event.event)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Failed to handle notification:', error)
    return new Response('Error processing notification', { status: 500 })
  }
}

async function handleBigSpend(payload: any, config: WebhookConfig) {
  console.log('Processing big spend alert:', payload)

  const message = `Large expense of ${payload.currency}${payload.amount} at ${payload.merchant || 'Unknown merchant'}`

  // Send to external webhook if configured
  if (config.big_spend_url) {
    await sendExternalWebhook(config.big_spend_url, {
      type: 'big_spend_alert',
      message,
      amount: payload.amount,
      currency: payload.currency,
      merchant: payload.merchant,
      household_id: payload.household_id,
      transaction_id: payload.transaction_id,
      category_id: payload.category_id,
      created_by: payload.created_by,
      occurred_at: payload.occurred_at
    }, config.shared_secret)
  }

  // Additional integrations could go here:
  // - Send push notification
  // - Send email alert
  // - Post to Slack/Discord
  // - Log to analytics service
}

async function handleBudgetThreshold(payload: any, config: WebhookConfig) {
  console.log('Processing budget threshold alert:', payload)

  const pctFormatted = Math.round(payload.pct * 100)
  const message = `Budget ${pctFormatted}% used for ${payload.period}`
  
  if (config.budget_threshold_url) {
    await sendExternalWebhook(config.budget_threshold_url, {
      type: 'budget_threshold_alert',
      message,
      category_id: payload.category_id,
      period: payload.period,
      spent: payload.spent,
      budget: payload.budget,
      percentage: payload.pct,
      threshold_pct: payload.threshold_pct,
      household_id: payload.household_id
    }, config.shared_secret)
  }
}

async function handleNewMember(payload: any, config: WebhookConfig) {
  console.log('Processing new member notification:', payload)

  const message = `New ${payload.role} joined the household`

  if (config.new_member_url) {
    await sendExternalWebhook(config.new_member_url, {
      type: 'new_member_joined',
      message,
      user_id: payload.user_id,
      role: payload.role,
      household_id: payload.household_id,
      joined_at: payload.joined_at
    }, config.shared_secret)
  }
}

async function sendExternalWebhook(url: string, payload: any, secret: string) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': secret,
        'User-Agent': 'Supabase-ExpenseApp/1.0'
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        source: 'expense_tracker',
        data: payload
      })
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`Webhook failed: ${response.status} ${response.statusText} - ${errorText}`)
      throw new Error(`HTTP ${response.status}`)
    } else {
      console.log(`Webhook sent successfully to ${url}`)
    }
  } catch (error) {
    console.error('Webhook send error:', error)
    // Could implement retry logic here or queue for later retry
  }
}

function getStatusPage() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Tracker Webhook Listener</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { color: green; font-weight: bold; }
        .config { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
        pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Expense Tracker Webhook Listener</h1>
      <p class="status">✅ Service is running</p>
      
      <div class="config">
        <h3>Configuration:</h3>
        <ul>
          <li>Big Spend URL: ${Deno.env.get('WEBHOOK_BIG_SPEND_URL') ? '✅ Configured' : '❌ Not set'}</li>
          <li>Budget Threshold URL: ${Deno.env.get('WEBHOOK_BUDGET_THRESHOLD_URL') ? '✅ Configured' : '❌ Not set'}</li>
          <li>New Member URL: ${Deno.env.get('WEBHOOK_NEW_MEMBER_URL') ? '✅ Configured' : '❌ Not set'}</li>
          <li>Shared Secret: ${Deno.env.get('WEBHOOK_SHARED_SECRET') ? '✅ Set' : '❌ Not set'}</li>
          <li>Big Spend Threshold: $${Deno.env.get('BIG_SPEND_THRESHOLD') || '150.00'}</li>
          <li>Budget Threshold: ${(parseFloat(Deno.env.get('BUDGET_THRESHOLD_PCT') || '0.8') * 100)}%</li>
        </ul>
      </div>

      <h3>Supported Events:</h3>
      <ul>
        <li><code>big_spend</code> - Triggered when expenses exceed threshold</li>
        <li><code>budget_threshold</code> - Triggered when budget usage exceeds percentage</li>
        <li><code>new_member</code> - Triggered when someone joins a household</li>
      </ul>

      <h3>Usage:</h3>
      <p>POST webhook events to this endpoint to trigger external integrations.</p>
      
      <h3>Example Payload:</h3>
      <pre>{
  "event": "big_spend",
  "timestamp": ${Date.now()},
  "payload": {
    "household_id": "uuid",
    "transaction_id": "uuid",
    "amount": 175.50,
    "currency": "USD",
    "merchant": "Expensive Restaurant",
    "category_id": "uuid",
    "created_by": "uuid"
  }
}</pre>
    </body>
    </html>
  `
}