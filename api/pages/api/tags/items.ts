/**
 * POST /api/tags/items - Add tag to feed item
 * DELETE /api/tags/items?itemId=xxx&tagId=xxx - Remove tag from feed item
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../../lib/supabase'
import { ApiResponse } from '../../../lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ message: string }>>
) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  if (req.method === 'POST') {
    const { itemId, tagId } = req.body

    if (!itemId || !tagId) {
      return res.status(400).json({ error: 'Item ID and Tag ID are required' })
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

    // Verify tag belongs to user
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('id', tagId)
      .eq('user_id', user.id)
      .single()

    if (tagError || !tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    // Add tag to item
    const { error } = await supabase
      .from('feed_item_tags')
      .insert({
        feed_item_id: itemId,
        tag_id: tagId,
      })

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Tag is already on this item' })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({ message: 'Tag added to item successfully' })
  }

  if (req.method === 'DELETE') {
    const { itemId, tagId } = req.query

    if (!itemId || !tagId) {
      return res.status(400).json({ error: 'Item ID and Tag ID are required' })
    }

    // Verify item belongs to user
    const { data: item, error: itemError } = await supabase
      .from('feed_items')
      .select('id')
      .eq('id', itemId as string)
      .eq('user_id', user.id)
      .single()

    if (itemError || !item) {
      return res.status(404).json({ error: 'Feed item not found' })
    }

    // Remove tag from item
    const { error } = await supabase
      .from('feed_item_tags')
      .delete()
      .eq('feed_item_id', itemId as string)
      .eq('tag_id', tagId as string)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Tag removed from item successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
