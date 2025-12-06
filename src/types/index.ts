/**
 * Type Definitions
 * 
 * Centralized type definitions for the application
 */

// User Types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt?: string
}

// Database User (matches Supabase schema)
export interface DbUser {
  id: string
  name: string
  email: string
  avatar?: string
  created_at: string
  updated_at: string
}

// Sage Types
export interface Sage {
  id: string
  name: string
  role: string
  description: string
  avatar: string
  active: boolean
  memory: 'local' | 'cross-session' | 'global'
  autonomy: 'advisory' | 'semi-autonomous' | 'autonomous'
  dataAccess: string
  color: string
}

// Database Sage (matches Supabase schema)
export interface DbSage {
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

// Creation Types
export interface Creation {
  id: string
  title: string
  type: 'image' | 'video' | 'audio' | 'text' | 'simulation'
  thumbnail: string
  remixes: number
  views: number
  createdAt: string
  userId: string
}

// Feed Item Types (matches Supabase schema)
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

// Feed Interaction Types
export interface FeedInteraction {
  id: string
  user_id: string
  feed_item_id: string
  interaction_type: 'like' | 'comment' | 'share' | 'remix'
  content?: string
  created_at: string
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[]
  cursor?: string
  has_more: boolean
}

// Marketplace Types
export interface MarketplaceItem {
  id: string
  title: string
  creator: string
  creatorType: 'human' | 'ai'
  price: number
  rating: number
  reviews: number
  image: string
  verified: boolean
  category: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'creation' | 'social' | 'system' | 'marketplace'
  title: string
  message: string
  time: string
  read: boolean
  icon?: string
}

// Onboarding Types
export interface OnboardingData {
  goals: string[]
  interests: string[]
  privacy: 'private' | 'public' | null
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

// Form Types
export interface FormErrors {
  [key: string]: string[]
}
