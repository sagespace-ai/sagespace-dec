/**
 * GET /api/collections - Get user's collections
 * POST /api/collections - Create a new collection
 * PATCH /api/collections?id=xxx - Update a collection
 * DELETE /api/collections?id=xxx - Delete a collection
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface Collection {
  id: string
  user_id: string
  name: string
  description?: string
  color?: string
  icon?: string
  created_at: string
  updated_at: string
  item_count?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Collection | Collection[]>>
) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  if (req.method === 'GET') {
    const { id } = req.query

    if (id) {
      // Get single collection with item count
      const { data: collection, error } = await supabase
        .from('collections')
        .select(`
          *,
          item_count:collection_items(count)
        `)
        .eq('id', id as string)
        .eq('user_id', user.id)
        .single()

      if (error || !collection) {
        return res.status(404).json({ error: 'Collection not found' })
      }

      return res.status(200).json({
        data: {
          ...collection,
          item_count: (collection.item_count as any)?.[0]?.count || 0,
        } as Collection,
      })
    } else {
      // Get all collections with item counts
      const { data: collections, error } = await supabase
        .from('collections')
        .select(`
          *,
          item_count:collection_items(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      const formattedCollections = (collections || []).map((col: any) => ({
        ...col,
        item_count: (col.item_count as any)?.[0]?.count || 0,
      }))

      return res.status(200).json({ data: formattedCollections as Collection[] })
    }
  }

  if (req.method === 'POST') {
    const { name, description, color, icon } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Collection name is required' })
    }

    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim(),
        color,
        icon,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return res.status(409).json({ error: 'A collection with this name already exists' })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({
      data: { ...collection, item_count: 0 } as Collection,
      message: 'Collection created successfully',
    })
  }

  if (req.method === 'PATCH') {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: 'Collection ID is required' })
    }

    const { name, description, color, icon } = req.body
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim()
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon

    const { data: collection, error } = await supabase
      .from('collections')
      .update(updateData)
      .eq('id', id as string)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A collection with this name already exists' })
      }
      return res.status(500).json({ error: error.message })
    }

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' })
    }

    return res.status(200).json({
      data: collection as Collection,
      message: 'Collection updated successfully',
    })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: 'Collection ID is required' })
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id as string)
      .eq('user_id', user.id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Collection deleted successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
