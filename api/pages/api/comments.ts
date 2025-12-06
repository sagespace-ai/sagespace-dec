/**
 * GET /api/comments?feedItemId=xxx - Get comments for a feed item
 * POST /api/comments - Create a comment
 * PATCH /api/comments?id=xxx - Update a comment
 * DELETE /api/comments?id=xxx - Delete a comment
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface Comment {
  id: string
  feed_item_id: string
  user_id: string
  parent_id?: string
  content: string
  created_at: string
  updated_at: string
  author?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  replies?: Comment[]
  replies_count?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Comment | Comment[]>>
) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  if (req.method === 'GET') {
    const { feedItemId } = req.query

    if (!feedItemId) {
      return res.status(400).json({ error: 'Feed item ID is required' })
    }

    // Get all comments for the feed item (top-level only)
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_user_id_fkey (
          id,
          name,
          email,
          avatar
        ),
        replies_count:comments!comments_parent_id_fkey(count)
      `)
      .eq('feed_item_id', feedItemId as string)
      .is('parent_id', null) // Only top-level comments
      .order('created_at', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment: any) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            author:users!comments_user_id_fkey (
              id,
              name,
              email,
              avatar
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          author: comment.author?.[0] || comment.author,
          replies: replies || [],
          replies_count: (comment.replies_count as any)?.[0]?.count || 0,
        }
      })
    )

    return res.status(200).json({ data: commentsWithReplies as Comment[] })
  }

  if (req.method === 'POST') {
    const { feedItemId, content, parentId } = req.body

    if (!feedItemId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Feed item ID and content are required' })
    }

    // Verify feed item exists
    const { data: feedItem, error: feedError } = await supabase
      .from('feed_items')
      .select('id')
      .eq('id', feedItemId)
      .single()

    if (feedError || !feedItem) {
      return res.status(404).json({ error: 'Feed item not found' })
    }

    // If parentId is provided, verify it exists and belongs to the same feed item
    if (parentId) {
      const { data: parent, error: parentError } = await supabase
        .from('comments')
        .select('id, feed_item_id')
        .eq('id', parentId)
        .single()

      if (parentError || !parent || parent.feed_item_id !== feedItemId) {
        return res.status(404).json({ error: 'Parent comment not found' })
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        feed_item_id: feedItemId,
        user_id: user.id,
        parent_id: parentId || null,
        content: content.trim(),
      })
      .select(`
        *,
        author:users!comments_user_id_fkey (
          id,
          name,
          email,
          avatar
        )
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Update feed item comments count
    await supabase.rpc('increment_feed_item_comments', { item_id: feedItemId })

    return res.status(201).json({
      data: {
        ...comment,
        author: comment.author?.[0] || comment.author,
        replies: [],
        replies_count: 0,
      } as Comment,
      message: 'Comment created successfully',
    })
  }

  if (req.method === 'PATCH') {
    const { id } = req.query
    const { content } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Comment ID is required' })
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', id as string)
      .eq('user_id', user.id) // Only allow updating own comments
      .select(`
        *,
        author:users!comments_user_id_fkey (
          id,
          name,
          email,
          avatar
        )
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' })
    }

    return res.status(200).json({
      data: {
        ...comment,
        author: comment.author?.[0] || comment.author,
      } as Comment,
      message: 'Comment updated successfully',
    })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Comment ID is required' })
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id as string)
      .eq('user_id', user.id) // Only allow deleting own comments

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Comment deleted successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
