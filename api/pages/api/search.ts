/**
 * GET /api/search - Global search endpoint
 * 
 * Searches across feed items, users, sages, and marketplace items
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { createSupabaseAdmin, getAuthenticatedUser } from '../../lib/supabase'
import { ApiResponse } from '../../lib/types'

interface SearchResult {
  type: 'feed_item' | 'user' | 'sage' | 'marketplace'
  id: string
  title: string
  description?: string
  thumbnail?: string
  metadata?: Record<string, any>
  relevance?: number
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  filters?: {
    types?: string[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SearchResponse>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get auth token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { q, type, limit = 20 } = req.query
  const query = (q as string)?.trim()

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' })
  }

  const supabase = createSupabaseAdmin()
  const results: SearchResult[] = []
  const searchLimit = Math.min(parseInt(limit as string) || 20, 50)

  try {
    const searchTypes = type
      ? (Array.isArray(type) ? type : [type])
      : ['feed_item', 'user', 'sage', 'marketplace']

    // Search feed items
    if (searchTypes.includes('feed_item')) {
      const { data: feedItems, error: feedError } = await supabase
        .from('feed_items')
        .select('id, title, description, thumbnail, type, created_at')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('user_id', user.id) // Only user's own items for now
        .limit(searchLimit)

      if (!feedError && feedItems) {
        feedItems.forEach((item: any) => {
          results.push({
            type: 'feed_item',
            id: item.id,
            title: item.title,
            description: item.description,
            thumbnail: item.thumbnail,
            metadata: {
              contentType: item.type,
              createdAt: item.created_at,
            },
          })
        })
      }
    }

    // Search users (from users table)
    if (searchTypes.includes('user')) {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name, email, avatar')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(searchLimit)

      if (!userError && users) {
        users.forEach((u: any) => {
          results.push({
            type: 'user',
            id: u.id,
            title: u.name,
            description: u.email,
            thumbnail: u.avatar,
            metadata: {
              email: u.email,
            },
          })
        })
      }
    }

    // Search sages
    if (searchTypes.includes('sage')) {
      const { data: sages, error: sageError } = await supabase
        .from('sages')
        .select('id, name, role, description, avatar')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,role.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(searchLimit)

      if (!sageError && sages) {
        sages.forEach((sage: any) => {
          results.push({
            type: 'sage',
            id: sage.id,
            title: sage.name,
            description: sage.description || `AI ${sage.role}`,
            thumbnail: sage.avatar,
            metadata: {
              role: sage.role,
            },
          })
        })
      }
    }

    // Search marketplace (for now, search feed items marked as marketplace)
    // In the future, this could search a dedicated marketplace_items table
    if (searchTypes.includes('marketplace')) {
      const { data: marketplaceItems, error: marketplaceError } = await supabase
        .from('feed_items')
        .select('id, title, description, thumbnail, type, created_at')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('user_id', user.id) // For now, only user's items
        .limit(searchLimit)

      if (!marketplaceError && marketplaceItems) {
        marketplaceItems.forEach((item: any) => {
          results.push({
            type: 'marketplace',
            id: item.id,
            title: item.title,
            description: item.description,
            thumbnail: item.thumbnail,
            metadata: {
              contentType: item.type,
              createdAt: item.created_at,
            },
          })
        })
      }
    }

    // Sort by relevance (simple: title matches first, then description)
    results.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase())
      const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase())
      if (aTitleMatch && !bTitleMatch) return -1
      if (!aTitleMatch && bTitleMatch) return 1
      return 0
    })

    return res.status(200).json({
      data: {
        results: results.slice(0, searchLimit),
        total: results.length,
        query,
        filters: {
          types: searchTypes as string[],
        },
      },
    })
  } catch (error: any) {
    console.error('[Search API] Error:', error)
    return res.status(500).json({
      error: error.message || 'Failed to perform search',
    })
  }
}
