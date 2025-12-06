/**
 * POST /api/feed/interactions - Create a feed interaction (like, comment, share, remix)
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '@/lib/supabase'
import { ApiResponse, FeedInteraction } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FeedInteraction>>
) {
  // Get auth token from Authorization header
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null

  // Get authenticated user
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  if (req.method === 'POST') {
    const { feed_item_id, interaction_type, content } = req.body

    // Validate required fields
    if (!feed_item_id || !interaction_type) {
      return res.status(400).json({ error: 'Missing required fields: feed_item_id, interaction_type' })
    }

    // Validate interaction type
    const validTypes = ['like', 'comment', 'share', 'remix']
    if (!validTypes.includes(interaction_type)) {
      return res.status(400).json({ error: 'Invalid interaction_type. Must be one of: like, comment, share, remix' })
    }

    // Validate content for comments
    if (interaction_type === 'comment' && !content) {
      return res.status(400).json({ error: 'Content is required for comments' })
    }

    // Check if feed item exists and belongs to user
    const { data: feedItem, error: feedError } = await supabase
      .from('feed_items')
      .select('id')
      .eq('id', feed_item_id)
      .eq('user_id', user.id)
      .single()

    if (feedError || !feedItem) {
      return res.status(404).json({ error: 'Feed item not found' })
    }

    // Insert interaction (using upsert to handle duplicates)
    const { data, error } = await supabase
      .from('feed_interactions')
      .upsert({
        user_id: user.id,
        feed_item_id,
        interaction_type,
        content: interaction_type === 'comment' ? content : null,
      }, {
        onConflict: 'user_id,feed_item_id,interaction_type',
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Update remixes count if it's a remix
    if (interaction_type === 'remix') {
      // Get current remixes count and increment
      const { data: feedItem } = await supabase
        .from('feed_items')
        .select('remixes')
        .eq('id', feed_item_id)
        .single()

      if (feedItem) {
        await supabase
          .from('feed_items')
          .update({ remixes: feedItem.remixes + 1 })
          .eq('id', feed_item_id)
      }
    }

    return res.status(201).json({
      data: data as FeedInteraction,
      message: 'Interaction created successfully',
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
