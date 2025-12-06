/**
 * GET /api/purchases - Get user's purchase history
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface Purchase {
  id: string
  user_id: string
  item_id: string
  stripe_session_id: string | null
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  purchased_at: string
  created_at: string
  updated_at: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Purchase[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get auth token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  try {
    // Get user's purchases
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      data: purchases as Purchase[],
    })
  } catch (error: any) {
    console.error('[Purchases API] Error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch purchases',
    })
  }
}
