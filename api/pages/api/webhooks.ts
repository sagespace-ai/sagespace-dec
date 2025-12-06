import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

interface WebhookEvent {
  id: string;
  type: string;
  resource_type: string;
  resource_id: string;
  data: Record<string, any>;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const event: WebhookEvent = req.body;

    // Process webhook event
    await processWebhookEvent(event);

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function processWebhookEvent(event: WebhookEvent) {
  // Store webhook event
  await supabase
    .from('webhook_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      payload: event.data,
      processed: false,
      created_at: new Date().toISOString()
    });

  // Process based on event type
  switch (event.type) {
    case 'feed_item.created':
      await handleFeedItemCreated(event);
      break;
    case 'user.created':
      await handleUserCreated(event);
      break;
    case 'comment.created':
      await handleCommentCreated(event);
      break;
    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

async function handleFeedItemCreated(event: WebhookEvent) {
  // Notify subscribers, update analytics, etc.
  console.log('Feed item created:', event.resource_id);
}

async function handleUserCreated(event: WebhookEvent) {
  // Send welcome email, create default collections, etc.
  console.log('User created:', event.resource_id);
}

async function handleCommentCreated(event: WebhookEvent) {
  // Notify mentioned users, update engagement metrics, etc.
  console.log('Comment created:', event.resource_id);
}

// Helper function to emit webhook events (called from other APIs)
export async function emitWebhookEvent(
  type: string,
  resourceType: string,
  resourceId: string,
  data: Record<string, any>
) {
  const event: WebhookEvent = {
    id: crypto.randomUUID(),
    type,
    resource_type: resourceType,
    resource_id: resourceId,
    data,
    timestamp: new Date().toISOString()
  };

  // Get all active webhook subscriptions
  const { data: subscriptions } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .eq('active', true)
    .eq('event_type', type);

  // Send webhook to each subscriber
  for (const subscription of subscriptions || []) {
    try {
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(JSON.stringify(event))
            .digest('hex')
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        console.error(`Webhook delivery failed for ${subscription.url}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Webhook delivery error for ${subscription.url}:`, error);
    }
  }
}
