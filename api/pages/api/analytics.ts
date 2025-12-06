/**
 * GET /api/analytics - Get user analytics and insights
 * 
 * Returns:
 * - Content performance metrics
 * - Engagement statistics
 * - Growth trends
 * - Top performing content
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface ContentMetrics {
  total_posts: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_views: number
  average_engagement_rate: number
}

interface EngagementTrend {
  date: string
  likes: number
  comments: number
  shares: number
  views: number
}

interface TopContent {
  id: string
  title: string
  type: string
  thumbnail?: string
  likes_count: number
  comments_count: number
  shares_count: number
  views: number
  created_at: string
}

interface AnalyticsResponse {
  content_metrics: ContentMetrics
  engagement_trends: EngagementTrend[]
  top_content: TopContent[]
  follower_growth: {
    current: number
    change_7d: number
    change_30d: number
  }
  engagement_by_type: {
    type: string
    count: number
    avg_engagement: number
  }[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AnalyticsResponse>>
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
    // Get all user's feed items
    const { data: feedItems, error: itemsError } = await supabase
      .from('feed_items')
      .select('id, title, type, thumbnail, created_at, views, remixes')
      .eq('user_id', user.id)

    if (itemsError) {
      throw itemsError
    }

    const itemIds = (feedItems || []).map((item: any) => item.id)

    // Get interaction counts
    const { data: interactions, error: interactionsError } = await supabase
      .from('feed_interactions')
      .select('feed_item_id, interaction_type')
      .in('feed_item_id', itemIds.length > 0 ? itemIds : ['00000000-0000-0000-0000-000000000000'])

    if (interactionsError) {
      throw interactionsError
    }

    // Calculate content metrics
    const totalPosts = feedItems?.length || 0
    const likes = (interactions || []).filter((i: any) => i.interaction_type === 'like').length
    const comments = (interactions || []).filter((i: any) => i.interaction_type === 'comment').length
    const shares = (interactions || []).filter((i: any) => i.interaction_type === 'share').length
    const totalViews = (feedItems || []).reduce((sum: number, item: any) => sum + (item.views || 0), 0)
    const totalEngagement = likes + comments + shares
    const avgEngagementRate = totalPosts > 0 ? (totalEngagement / totalPosts) : 0

    const contentMetrics: ContentMetrics = {
      total_posts: totalPosts,
      total_likes: likes,
      total_comments: comments,
      total_shares: shares,
      total_views: totalViews,
      average_engagement_rate: Math.round(avgEngagementRate * 100) / 100,
    }

    // Calculate engagement trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentItems, error: recentError } = await supabase
      .from('feed_items')
      .select('id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: recentInteractions, error: recentInteractionsError } = await supabase
      .from('feed_interactions')
      .select('feed_item_id, interaction_type, created_at')
      .in('feed_item_id', itemIds.length > 0 ? itemIds : ['00000000-0000-0000-0000-000000000000'])
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Group interactions by date
    const trendsMap = new Map<string, { likes: number; comments: number; shares: number; views: number }>()
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      trendsMap.set(dateStr, { likes: 0, comments: 0, shares: 0, views: 0 })
    }

    // Add interactions to trends
    if (recentInteractions) {
      recentInteractions.forEach((interaction: any) => {
        const date = new Date(interaction.created_at).toISOString().split('T')[0]
        const trend = trendsMap.get(date)
        if (trend) {
          if (interaction.interaction_type === 'like') trend.likes++
          else if (interaction.interaction_type === 'comment') trend.comments++
          else if (interaction.interaction_type === 'share') trend.shares++
        }
      })
    }

    // Add views from recent items
    if (recentItems) {
      recentItems.forEach((item: any) => {
        const date = new Date(item.created_at).toISOString().split('T')[0]
        const trend = trendsMap.get(date)
        if (trend && item.views) {
          trend.views += item.views || 0
        }
      })
    }

    const engagementTrends: EngagementTrend[] = Array.from(trendsMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Get top performing content (by engagement)
    const itemEngagementMap = new Map<string, { likes: number; comments: number; shares: number; views: number }>()
    
    if (feedItems) {
      feedItems.forEach((item: any) => {
        itemEngagementMap.set(item.id, {
          likes: 0,
          comments: 0,
          shares: 0,
          views: item.views || 0,
        })
      })
    }

    if (interactions) {
      interactions.forEach((interaction: any) => {
        const engagement = itemEngagementMap.get(interaction.feed_item_id)
        if (engagement) {
          if (interaction.interaction_type === 'like') engagement.likes++
          else if (interaction.interaction_type === 'comment') engagement.comments++
          else if (interaction.interaction_type === 'share') engagement.shares++
        }
      })
    }

    const topContent: TopContent[] = Array.from(itemEngagementMap.entries())
      .map(([id, engagement]) => {
        const item = feedItems?.find((i: any) => i.id === id)
        if (!item) return null
        return {
          id,
          title: item.title,
          type: item.type,
          thumbnail: item.thumbnail,
          likes_count: engagement.likes,
          comments_count: engagement.comments,
          shares_count: engagement.shares,
          views: engagement.views,
          created_at: item.created_at,
        }
      })
      .filter((item): item is TopContent => item !== null)
      .sort((a, b) => {
        const scoreA = a.likes_count + a.comments_count * 2 + a.shares_count * 3 + a.views
        const scoreB = b.likes_count + b.comments_count * 2 + b.shares_count * 3 + b.views
        return scoreB - scoreA
      })
      .slice(0, 10)

    // Get follower growth
    const { data: currentFollows, error: followsError } = await supabase
      .from('follows')
      .select('created_at')
      .eq('following_id', user.id)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo2 = new Date()
    thirtyDaysAgo2.setDate(thirtyDaysAgo2.getDate() - 30)

    const currentFollowers = currentFollows?.length || 0
    const followers7d = (currentFollows || []).filter(
      (f: any) => new Date(f.created_at) >= sevenDaysAgo
    ).length
    const followers30d = (currentFollows || []).filter(
      (f: any) => new Date(f.created_at) >= thirtyDaysAgo2
    ).length

    // Engagement by content type
    const typeEngagement = new Map<string, { count: number; totalEngagement: number }>()
    
    if (feedItems) {
      feedItems.forEach((item: any) => {
        const engagement = itemEngagementMap.get(item.id)
        if (engagement) {
          const existing = typeEngagement.get(item.type) || { count: 0, totalEngagement: 0 }
          existing.count++
          existing.totalEngagement += engagement.likes + engagement.comments + engagement.shares + engagement.views
          typeEngagement.set(item.type, existing)
        }
      })
    }

    const engagementByType = Array.from(typeEngagement.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      avg_engagement: data.count > 0 ? Math.round((data.totalEngagement / data.count) * 100) / 100 : 0,
    }))

    return res.status(200).json({
      data: {
        content_metrics: contentMetrics,
        engagement_trends: engagementTrends,
        top_content: topContent,
        follower_growth: {
          current: currentFollowers,
          change_7d: followers7d,
          change_30d: followers30d,
        },
        engagement_by_type: engagementByType,
      },
    })
  } catch (error: any) {
    console.error('[Analytics API] Error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to fetch analytics',
    })
  }
}
