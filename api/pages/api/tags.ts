/**
 * GET /api/tags - Get user's tags
 * POST /api/tags - Create a new tag
 * PATCH /api/tags?id=xxx - Update a tag
 * DELETE /api/tags?id=xxx - Delete a tag
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface Tag {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
  item_count?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Tag | Tag[]>>
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
      // Get single tag with item count
      const { data: tag, error } = await supabase
        .from('tags')
        .select(`
          *,
          item_count:feed_item_tags(count)
        `)
        .eq('id', id as string)
        .eq('user_id', user.id)
        .single()

      if (error || !tag) {
        return res.status(404).json({ error: 'Tag not found' })
      }

      return res.status(200).json({
        data: {
          ...tag,
          item_count: (tag.item_count as any)?.[0]?.count || 0,
        } as Tag,
      })
    } else {
      // Get all tags with item counts
      const { data: tags, error } = await supabase
        .from('tags')
        .select(`
          *,
          item_count:feed_item_tags(count)
        `)
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      const formattedTags = (tags || []).map((tag: any) => ({
        ...tag,
        item_count: (tag.item_count as any)?.[0]?.count || 0,
      }))

      return res.status(200).json({ data: formattedTags as Tag[] })
    }
  }

  if (req.method === 'POST') {
    const { name, color } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' })
    }

    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A tag with this name already exists' })
      }
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({
      data: { ...tag, item_count: 0 } as Tag,
      message: 'Tag created successfully',
    })
  }

  if (req.method === 'PATCH') {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: 'Tag ID is required' })
    }

    const { name, color } = req.body
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (color !== undefined) updateData.color = color

    const { data: tag, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id as string)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A tag with this name already exists' })
      }
      return res.status(500).json({ error: error.message })
    }

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    return res.status(200).json({
      data: tag as Tag,
      message: 'Tag updated successfully',
    })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: 'Tag ID is required' })
    }

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id as string)
      .eq('user_id', user.id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Tag deleted successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
