/**
 * GET /api/feed - Get feed items with cursor-based pagination
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '@/lib/supabase'
import { ApiResponse, FeedItem, FeedInteraction, PaginatedResponse } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<FeedItem>>>
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

  if (req.method === 'GET') {
    // Get query parameters
    const limit = parseInt(req.query.limit as string) || 20
    const cursor = req.query.cursor as string | undefined
    const persona = (req.query.persona as string | undefined)?.trim() || null
    const view = (req.query.view as 'default' | 'marketplace' | 'universe' | 'following' | undefined) || 'default'
    const following = req.query.following === 'true' || view === 'following'

    // Build base query - we'll join users separately for better compatibility
    let query = supabase
      .from('feed_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit + 1) // Fetch one extra to check if there's more

    // Apply view-specific filtering
    if (following || view === 'following') {
      // Following feed - only show items from users the current user follows
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (followsError) {
        return res.status(500).json({ error: followsError.message })
      }

      const followingIds = (follows || []).map((f: any) => f.following_id)
      
      if (followingIds.length === 0) {
        // User doesn't follow anyone, return empty feed
        return res.status(200).json({
          data: {
            data: [],
            cursor: undefined,
            has_more: false,
          },
        })
      }

      query = query.in('user_id', followingIds)
    } else if (view === 'marketplace') {
      // Marketplace: items that have interactions (trending/popular)
      // We'll filter after fetching interactions, so for now just get all items
      // and filter in post-processing
    } else if (view === 'universe') {
      // Universe: user's own items (same as default for now, but semantically distinct)
      query = query.eq('user_id', user.id)
    } else {
      // Default: show all items (no user filter)
    }

    // Apply cursor if provided
    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Check if there are more items
    const hasMore = data.length > limit
    const items = hasMore ? data.slice(0, limit) : data

    // Get unique user IDs and fetch user data
    const userIds = [...new Set(items.map((item: any) => item.user_id))]
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, email, avatar')
      .in('id', userIds)

    // Create a map of user data
    const usersMap = new Map(
      (usersData || []).map((u: any) => [u.id, u])
    )

    // Transform items to include user data
    const transformedItems = items.map((item: any) => {
      const userData = usersMap.get(item.user_id) || {}
      return {
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        type: item.type,
        thumbnail: item.thumbnail,
        content_url: item.content_url,
        description: item.description,
        remixes: item.remixes,
        views: item.views,
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Add author information
        author: {
          id: userData.id || item.user_id,
          name: userData.name || 'Unknown User',
          email: userData.email || '',
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=6366f1&color=fff`,
        },
      }
    })

    // Aggregate interaction counts (likes, comments, shares) for these items
    const feedItemIds = transformedItems.map((item) => item.id as string)
    let itemsWithCounts: any[] = transformedItems

    if (feedItemIds.length > 0) {
      const { data: interactions, error: interactionsError } = await supabase
        .from('feed_interactions')
        .select('feed_item_id, interaction_type')
        .in('feed_item_id', feedItemIds)

      if (!interactionsError && interactions) {
        const countsByItem: Record<string, { likes: number; comments: number; shares: number }> = {}

        for (const interaction of interactions as FeedInteraction[]) {
          const id = interaction.feed_item_id
          if (!countsByItem[id]) {
            countsByItem[id] = { likes: 0, comments: 0, shares: 0 }
          }
          if (interaction.interaction_type === 'like') countsByItem[id].likes += 1
          if (interaction.interaction_type === 'comment') countsByItem[id].comments += 1
          if (interaction.interaction_type === 'share') countsByItem[id].shares += 1
        }

        itemsWithCounts = itemsWithCounts.map((item: any) => {
          const counts = countsByItem[item.id] || { likes: 0, comments: 0, shares: 0 }
          return {
            ...item,
            likes_count: counts.likes,
            comments_count: counts.comments,
            shares_count: counts.shares,
          }
        })

        // Apply marketplace filter: only items with at least one interaction
        if (view === 'marketplace') {
          itemsWithCounts = itemsWithCounts.filter(
            (item) =>
              (item.likes_count ?? 0) > 0 ||
              (item.comments_count ?? 0) > 0 ||
              (item.shares_count ?? 0) > 0 ||
              item.remixes > 0 ||
              item.views > 5 // Items with some views are considered "trending"
          )
        }
      } else if (view === 'marketplace') {
        // If no interactions found and view is marketplace, return empty
        itemsWithCounts = []
      }
    } else if (view === 'marketplace') {
      // If no items, marketplace should be empty
      itemsWithCounts = []
    }

    // Get cursor for next page (created_at of last item)
    const nextCursor =
      itemsWithCounts.length > 0 ? itemsWithCounts[itemsWithCounts.length - 1].created_at : undefined

    return res.status(200).json({
      data: {
        data: itemsWithCounts,
        cursor: nextCursor,
        has_more: hasMore,
      },
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
