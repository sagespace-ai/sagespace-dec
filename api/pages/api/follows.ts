/**
 * GET /api/follows - Get followers/following for a user
 * POST /api/follows - Follow a user
 * DELETE /api/follows?userId=xxx - Unfollow a user
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  following?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Follow[] | { message: string }>>
) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  if (req.method === 'GET') {
    const { userId, type = 'followers' } = req.query
    const targetUserId = (userId as string) || user.id

    if (type === 'followers') {
      // Get users who follow the target user
      const { data: follows, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower_id,
          following_id,
          created_at,
          follower:users!follows_follower_id_fkey (
            id,
            name,
            email,
            avatar
          )
        `)
        .eq('following_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ data: (follows || []) as Follow[] })
    } else if (type === 'following') {
      // Get users that the target user follows
      const { data: follows, error } = await supabase
        .from('follows')
        .select(`
          id,
          follower_id,
          following_id,
          created_at,
          following:users!follows_following_id_fkey (
            id,
            name,
            email,
            avatar
          )
        `)
        .eq('follower_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ data: (follows || []) as Follow[] })
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "followers" or "following"' })
    }
  }

  if (req.method === 'POST') {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    if (userId === user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    // Check if already following
    const { data: existing, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single()

    if (existing) {
      return res.status(409).json({ error: 'Already following this user' })
    }

    // Create follow relationship
    const { data: follow, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: userId,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json({
      data: follow as Follow,
      message: 'Successfully followed user',
    })
  }

  if (req.method === 'DELETE') {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId as string)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Successfully unfollowed user' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
