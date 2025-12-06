/**
 * POST /api/webhooks/stripe - Stripe Webhook Handler
 * 
 * Handles Stripe webhook events (payment success, failure, etc.)
 * This endpoint should be configured in Stripe Dashboard
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createSupabaseAdmin } from '../../../lib/supabase'
import { logWebhookError, logPaymentFailure } from '../../../lib/monitoring'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature'] as string
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  let event: Stripe.Event

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req, { limit: '2mb' })
    // Verify webhook signature with raw body
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message)
    logWebhookError('/api/webhooks/stripe', err)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  const supabase = createSupabaseAdmin()

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId
        const itemId = session.metadata?.itemId

        if (!userId || !itemId) {
          console.error('[Stripe Webhook] Missing userId or itemId in session metadata')
          break
        }

        // Record purchase in database
        const { error: purchaseError } = await supabase.from('purchases').insert({
          user_id: userId,
          item_id: itemId,
          stripe_session_id: session.id,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          status: 'completed',
          purchased_at: new Date().toISOString(),
        })

        if (purchaseError) {
          console.error('[Stripe Webhook] Failed to record purchase:', purchaseError)
        } else {
          console.log(`[Stripe Webhook] Purchase recorded: ${itemId} for user ${userId}`)
        }

        // You might also want to:
        // - Grant access to the purchased item
        // - Send confirmation email
        // - Update user's purchase history
        // - Add item to user's feed

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[Stripe Webhook] PaymentIntent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('[Stripe Webhook] PaymentIntent failed:', paymentIntent.id)
        
        // Log payment failure
        logPaymentFailure(
          new Error(`Payment failed: ${paymentIntent.id}`),
          {
            paymentIntentId: paymentIntent.id,
            userId: paymentIntent.metadata?.userId,
            itemId: paymentIntent.metadata?.itemId,
          }
        )

        // Record failed purchase
        const userId = paymentIntent.metadata?.userId
        const itemId = paymentIntent.metadata?.itemId

        if (userId && itemId) {
          await supabase.from('purchases').insert({
            user_id: userId,
            item_id: itemId,
            stripe_session_id: paymentIntent.id,
            amount: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
            status: 'failed',
            purchased_at: new Date().toISOString(),
          })
        }

        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing event:', error)
    logPaymentFailure(error, {
      endpoint: '/api/webhooks/stripe',
      eventType: event?.type,
    })
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}

// Disable body parsing for webhook (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false,
  },
}
