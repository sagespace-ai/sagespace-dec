/**
 * API Type Definitions
 * 
 * These types match the database schema and frontend types
 */

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  created_at: string
  updated_at: string
}

export interface Sage {
  id: string
  user_id: string
  name: string
  role: string
  description: string
  avatar: string
  active: boolean
  memory: 'local' | 'cross-session' | 'global'
  autonomy: 'advisory' | 'semi-autonomous' | 'autonomous'
  data_access: string
  color: string
  created_at: string
  updated_at: string
}

export interface FeedItem {
  id: string
  user_id: string
  title: string
  type: 'image' | 'video' | 'audio' | 'text' | 'simulation'
  thumbnail?: string
  content_url?: string
  description?: string
  remixes: number
  views: number
  created_at: string
  updated_at: string
  likes_count?: number
  comments_count?: number
  shares_count?: number
  // Author information (from users table)
  author?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface FeedInteraction {
  id: string
  user_id: string
  feed_item_id: string
  interaction_type: 'like' | 'comment' | 'share' | 'remix'
  content?: string
  created_at: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  cursor?: string
  has_more: boolean
}
