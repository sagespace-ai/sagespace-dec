/**
 * POST /api/archive - Archive a feed item
 * DELETE /api/archive?itemId=xxx - Unarchive a feed item
 * GET /api/archive - Get archived items
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse, FeedItem } from '../../lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FeedItem[] | { message: string }>>
) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  if (req.method === 'GET') {
    // Get all archived items
    const { data: archived, error } = await supabase
      .from('archived_items')
      .select(`
        feed_item_id,
        archived_at,
        feed_items (
          id,
          user_id,
          title,
          type,
          thumbnail,
          content_url,
          description,
          remixes,
          views,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          shares_count
        )
      `)
      .eq('user_id', user.id)
      .order('archived_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const feedItems = (archived || []).map((item: any) => item.feed_items).filter(Boolean)

    return res.status(200).json({ data: feedItems as FeedItem[] })
  }

  if (req.method === 'POST') {
    const { itemId } = req.body

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    // Verify item belongs to user
    const { data: item, error: itemError } = await supabase
      .from('feed_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .single()

    if (itemError || !item) {
      return res.status(404).json({ error: 'Feed item not found' })
    }

    // Archive item
    const { error } = await supabase
      .from('archived_items')
      .insert({
        user_id: user.id,
        feed_item_id: itemId,
      })

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Item is already archived' })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({ message: 'Item archived successfully' })
  }

  if (req.method === 'DELETE') {
    const { itemId } = req.query

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    // Unarchive item
    const { error } = await supabase
      .from('archived_items')
      .delete()
      .eq('user_id', user.id)
      .eq('feed_item_id', itemId as string)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Item unarchived successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
