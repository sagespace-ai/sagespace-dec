/**
 * GET /api/collections/items?collectionId=xxx - Get items in a collection
 * POST /api/collections/items - Add item to collection
 * DELETE /api/collections/items?collectionId=xxx&itemId=xxx - Remove item from collection
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../../lib/supabase'
import { ApiResponse, FeedItem } from '../../../lib/types'

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
    const { collectionId } = req.query
    if (!collectionId) {
      return res.status(400).json({ error: 'Collection ID is required' })
    }

    // Verify collection belongs to user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId as string)
      .eq('user_id', user.id)
      .single()

    if (collectionError || !collection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    // Get items in collection
    const { data: items, error } = await supabase
      .from('collection_items')
      .select(`
        feed_item_id,
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
      .eq('collection_id', collectionId as string)
      .order('added_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const feedItems = (items || []).map((item: any) => item.feed_items).filter(Boolean)

    return res.status(200).json({ data: feedItems as FeedItem[] })
  }

  if (req.method === 'POST') {
    const { collectionId, itemId } = req.body

    if (!collectionId || !itemId) {
      return res.status(400).json({ error: 'Collection ID and Item ID are required' })
    }

    // Verify collection belongs to user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (collectionError || !collection) {
      return res.status(404).json({ error: 'Collection not found' })
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

    // Add item to collection
    const { error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        feed_item_id: itemId,
      })

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Item is already in this collection' })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({ message: 'Item added to collection successfully' })
  }

  if (req.method === 'DELETE') {
    const { collectionId, itemId } = req.query

    if (!collectionId || !itemId) {
      return res.status(400).json({ error: 'Collection ID and Item ID are required' })
    }

    // Verify collection belongs to user
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId as string)
      .eq('user_id', user.id)
      .single()

    if (collectionError || !collection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    // Remove item from collection
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId as string)
      .eq('feed_item_id', itemId as string)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Item removed from collection successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
