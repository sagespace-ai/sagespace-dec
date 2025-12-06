/**
 * POST /api/checkout - Create Stripe Checkout Session
 * 
 * Creates a Stripe Checkout session for marketplace item purchases
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'
import { captureException, logPaymentFailure } from '../../lib/monitoring'

interface CheckoutRequest {
  itemId: string
  itemTitle: string
  price: number // in dollars
  itemType?: string
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ sessionId: string; url: string }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get auth token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const { itemId, itemTitle, price, itemType = 'marketplace_item' }: CheckoutRequest = req.body

  if (!itemId || !itemTitle || !price || price <= 0) {
    return res.status(400).json({ error: 'Missing required fields: itemId, itemTitle, price' })
  }

  try {
    const supabase = createSupabaseAdmin()

    // Verify item exists (optional - you might want to fetch from database)
    // For now, we'll trust the frontend and verify in webhook

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemTitle,
              description: `Purchase ${itemTitle} from SageSpace Marketplace`,
              metadata: {
                itemId,
                itemType,
              },
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/marketplace?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/marketplace?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        itemId,
        itemType,
      },
      customer_email: user.email || undefined,
    })

    return res.status(200).json({
      data: {
        sessionId: session.id,
        url: session.url || '',
      },
      message: 'Checkout session created successfully',
    })
  } catch (error: any) {
    console.error('[Checkout API] Error:', error)
    logPaymentFailure(error as Error, {
      itemId,
      userId: user.id,
      endpoint: '/api/checkout',
    })
    return res.status(500).json({
      error: error.message || 'Failed to create checkout session',
    })
  }
}
