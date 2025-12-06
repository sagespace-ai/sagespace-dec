/**
 * GET /api/recommendations - Get social recommendations
 * 
 * Returns:
 * - Users to follow (based on mutual connections, similar interests)
 * - Trending content
 * - Suggested content
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface UserRecommendation {
  id: string
  name: string
  email: string
  avatar?: string
  reason: string
  mutual_followers?: number
}

interface ContentRecommendation {
  id: string
  title: string
  type: string
  thumbnail?: string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  reason: string
}

interface RecommendationsResponse {
  users: UserRecommendation[]
  content: ContentRecommendation[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<RecommendationsResponse>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createSupabaseAdmin()

  try {
    // Get users to follow (users with mutual connections or popular users)
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (followingError) {
      throw followingError
    }

    const followingIds = (following || []).map((f: any) => f.following_id)
    const excludeIds = [...followingIds, user.id] // Exclude self and already following

    // Get users who are followed by people you follow (mutual connections)
    const { data: mutualUsers, error: mutualError } = await supabase
      .from('follows')
      .select(`
        following_id,
        follower:users!follows_follower_id_fkey (
          id,
          name,
          email,
          avatar
        )
      `)
      .in('follower_id', followingIds.length > 0 ? followingIds : ['00000000-0000-0000-0000-000000000000'])
      .not('following_id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',') || 'null'})`)

    // Get popular users (users with most followers, excluding already following)
    const { data: popularUsers, error: popularError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        avatar,
        followers_count:follows!follows_following_id_fkey(count)
      `)
      .not('id', 'in', `(${excludeIds.map(id => `'${id}'`).join(',') || 'null'})`)
      .limit(10)

    // Combine and format user recommendations
    const userRecs: UserRecommendation[] = []

    // Add mutual connection recommendations
    if (mutualUsers && !mutualError) {
      const mutualMap = new Map<string, { user: any; count: number }>()
      mutualUsers.forEach((item: any) => {
        const followingId = item.following_id
        if (!mutualMap.has(followingId)) {
          mutualMap.set(followingId, { user: null, count: 0 })
        }
        const entry = mutualMap.get(followingId)!
        entry.count++
        if (!entry.user) {
          // Get the user details
          entry.user = { id: followingId }
        }
      })

      // Get user details for mutual connections
      const mutualUserIds = Array.from(mutualMap.keys())
      if (mutualUserIds.length > 0) {
        const { data: mutualUserDetails } = await supabase
          .from('users')
          .select('id, name, email, avatar')
          .in('id', mutualUserIds)
          .limit(5)

        mutualUserDetails?.forEach((u: any) => {
          const entry = mutualMap.get(u.id)
          if (entry) {
            userRecs.push({
              id: u.id,
              name: u.name,
              email: u.email,
              avatar: u.avatar,
              reason: `${entry.count} mutual follower${entry.count !== 1 ? 's' : ''}`,
              mutual_followers: entry.count,
            })
          }
        })
      }
    }

    // Add popular user recommendations
    if (popularUsers && !popularError) {
      popularUsers.forEach((u: any) => {
        const followersCount = (u.followers_count as any)?.[0]?.count || 0
        if (followersCount > 0 && !userRecs.find(r => r.id === u.id)) {
          userRecs.push({
            id: u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar,
            reason: `Popular creator with ${followersCount} follower${followersCount !== 1 ? 's' : ''}`,
          })
        }
      })
    }

    // Get trending content (most liked/commented items from last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: trendingItems, error: trendingError } = await supabase
      .from('feed_items')
      .select(`
        id,
        title,
        type,
        thumbnail,
        description,
        likes_count,
        comments_count,
        created_at,
        user_id,
        author:users!feed_items_user_id_fkey (
          id,
          name,
          avatar
        )
      `)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('likes_count', { ascending: false, nullsFirst: false })
      .limit(10)

    const contentRecs: ContentRecommendation[] = []
    if (trendingItems && !trendingError) {
      trendingItems.forEach((item: any) => {
        if (item.likes_count > 0 || item.comments_count > 0) {
          contentRecs.push({
            id: item.id,
            title: item.title,
            type: item.type,
            thumbnail: item.thumbnail,
            author: item.author ? {
              id: item.author.id,
              name: item.author.name,
              avatar: item.author.avatar,
            } : undefined,
            reason: `${item.likes_count || 0} likes, ${item.comments_count || 0} comments`,
          })
        }
      })
    }

    return res.status(200).json({
      data: {
        users: userRecs.slice(0, 10), // Limit to 10 user recommendations
        content: contentRecs.slice(0, 10), // Limit to 10 content recommendations
      },
    })
  } catch (error: any) {
    console.error('[Recommendations API] Error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch recommendations',
    })
  }
}
