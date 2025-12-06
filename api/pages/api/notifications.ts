/**
 * GET /api/notifications - Get user notifications
 * 
 * Returns notifications for the authenticated user
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'share' | 'follow' | 'purchase' | 'system'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Notification[]>>
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
    // For now, generate notifications from feed_interactions
    // In the future, this could be a dedicated notifications table
    const { data: interactions, error: interactionsError } = await supabase
      .from('feed_interactions')
      .select(`
        id,
        feed_item_id,
        interaction_type,
        created_at,
        feed_items!inner (
          id,
          title,
          user_id
        )
      `)
      .eq('feed_items.user_id', user.id) // Only interactions on user's items
      .neq('user_id', user.id) // Exclude user's own interactions
      .order('created_at', { ascending: false })
      .limit(50)

    if (interactionsError) {
      throw interactionsError
    }

    // Transform interactions into notifications
    const notifications: Notification[] = (interactions || []).map((interaction: any) => {
      const feedItem = interaction.feed_items
      const type = interaction.interaction_type as 'like' | 'comment' | 'share'
      
      let title = ''
      let message = ''

      switch (type) {
        case 'like':
          title = 'New Like'
          message = `Someone liked your post: "${feedItem.title}"`
          break
        case 'comment':
          title = 'New Comment'
          message = `Someone commented on your post: "${feedItem.title}"`
          break
        case 'share':
          title = 'New Share'
          message = `Someone shared your post: "${feedItem.title}"`
          break
        default:
          title = 'New Interaction'
          message = `Someone interacted with your post: "${feedItem.title}"`
      }

      return {
        id: interaction.id,
        user_id: user.id,
        type,
        title,
        message,
        link: `/home#${feedItem.id}`,
        read: false, // TODO: Implement read status tracking
        created_at: interaction.created_at,
      }
    })

    return res.status(200).json({
      data: notifications,
    })
  } catch (error: any) {
    console.error('[Notifications API] Error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch notifications',
    })
  }
}
