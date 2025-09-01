-- ===================================================================
-- WEBHOOK IMPLEMENTATION STRATEGIES
-- ===================================================================

-- STRATEGY A: Direct HTTP from Postgres (using extensions.http)
-- Note: This requires the http extension and proper environment configuration

-- Enhanced webhook function with HTTP calls
CREATE OR REPLACE FUNCTION send_http_webhook(
  event_name text,
  payload jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  webhook_url text;
  shared_secret text;
  full_payload jsonb;
  response_status int;
BEGIN
  -- Get webhook URL from environment (you'd need to set these in Supabase)
  CASE event_name
    WHEN 'big_spend' THEN 
      webhook_url := current_setting('app.webhook_big_spend_url', true);
    WHEN 'budget_threshold' THEN 
      webhook_url := current_setting('app.webhook_budget_threshold_url', true);
    WHEN 'new_member' THEN 
      webhook_url := current_setting('app.webhook_new_member_url', true);
    ELSE 
      webhook_url := current_setting('app.webhook_default_url', true);
  END CASE;

  shared_secret := current_setting('app.webhook_shared_secret', true);

  -- Skip if no webhook URL configured
  IF webhook_url IS NULL OR webhook_url = '' THEN
    RETURN;
  END IF;

  -- Build full payload with metadata
  full_payload := jsonb_build_object(
    'event', event_name,
    'timestamp', extract(epoch from now()),
    'data', payload
  );

  -- Make HTTP POST request
  SELECT status INTO response_status
  FROM extensions.http((
    'POST',
    webhook_url,
    ARRAY[
      extensions.http_header('Content-Type', 'application/json'),
      extensions.http_header('X-Webhook-Secret', shared_secret),
      extensions.http_header('User-Agent', 'Supabase-Webhook/1.0')
    ],
    'application/json',
    full_payload::text
  )::extensions.http_request);

  -- Log result (optional)
  IF response_status >= 400 THEN
    RAISE WARNING 'Webhook failed with status %: %', response_status, event_name;
  END IF;

EXCEPTION 
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Webhook HTTP request failed: %', SQLERRM;
END;
$$;

-- Example trigger using HTTP webhooks
CREATE OR REPLACE FUNCTION http_webhook_big_spend()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  threshold_amount numeric(14,2);
BEGIN
  -- Get threshold from settings (default 150.00)
  threshold_amount := COALESCE(
    current_setting('app.big_spend_threshold', true)::numeric(14,2), 
    150.00
  );

  IF NEW.direction = 'outflow' AND NEW.amount >= threshold_amount THEN
    PERFORM send_http_webhook('big_spend', jsonb_build_object(
      'household_id', NEW.household_id,
      'transaction_id', NEW.id,
      'amount', NEW.amount,
      'currency', NEW.currency,
      'merchant', NEW.merchant,
      'category_id', NEW.category_id,
      'threshold', threshold_amount,
      'created_by', NEW.created_by,
      'occurred_at', NEW.occurred_at
    ));
  END IF;
  
  RETURN NEW;
END;
$$;