/**
 * API Type Definitions
 * Defines request/response types for all API endpoints
 */

import type { FeedItem, User, Sage, MarketplaceItem } from "./index"

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T | null
  error?: string
  message?: string
}

// Error response
export interface ApiError {
  error: string
  message?: string
  status?: number
  details?: Record<string, unknown>
}

// Session data from Supabase
export interface SessionData {
  user: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
      avatar?: string
      [key: string]: unknown
    }
    created_at: string
  }
  access_token: string
  refresh_token: string
  expires_at?: number
}

// Retry options for API calls
export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  retryable?: (error: ApiError | Error) => boolean
}

// Request options
export interface RequestOptions extends RequestInit {
  retryOptions?: RetryOptions
}

// Feed endpoints
export interface CreateFeedItemRequest {
  title: string
  type: "image" | "video" | "audio" | "text" | "simulation"
  description?: string
  thumbnail?: string
  content_url?: string
  metadata?: Record<string, unknown>
  prompt?: string
  creativity?: number
  fidelity?: number
}

export interface FeedResponse {
  data: FeedItem[]
  cursor?: string
  has_more: boolean
}

// Remix endpoints
export interface RemixInput {
  text?: string
  imageUrl?: string
  metadata?: Record<string, unknown>
}

export interface RemixRequest {
  inputA: RemixInput
  inputB: RemixInput
  mode?: "concept_blend" | "image_blend" | "idea_generation"
  extraContext?: Record<string, unknown>
}

export interface RemixResponse {
  feedItem: FeedItem
  generatedContent?: {
    contentUrl?: string
    thumbnail?: string
    text?: string
  }
  debugInfo?: Record<string, unknown>
}

// Comment types
export interface Comment {
  id: string
  user_id: string
  feed_item_id: string
  content: string
  created_at: string
  updated_at: string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  replies?: Comment[]
  replies_count?: number
}

export interface CreateCommentRequest {
  feed_item_id: string
  content: string
  parent_comment_id?: string
}

export interface CommentsResponse {
  comments: Comment[]
  total: number
}

// Analytics types
export interface AnalyticsMetrics {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgEngagementRate: number
  topContent: Array<{
    id: string
    title: string
    views: number
    engagementRate: number
  }>
  recentActivity: Array<{
    type: "view" | "like" | "comment" | "share"
    timestamp: string
    itemId: string
  }>
}

// Search types
export interface SearchFilters {
  type?: "all" | "content" | "users" | "sages" | "marketplace" | "feed_item" | "user" | "sage"
  sortBy?: "relevance" | "date" | "popularity"
  dateRange?: {
    start: string
    end: string
  }
  limit?: number
}

export interface SearchResult {
  type: "content" | "user" | "sage" | "marketplace" | "feed_item"
  id: string
  title: string
  description?: string
  thumbnail?: string
  relevanceScore: number
  data: FeedItem | User | Sage | MarketplaceItem
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
}
