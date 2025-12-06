/**
 * API Helper Utilities
 * 
 * Utility functions for working with the API and transforming data.
 */

import { User, DbUser, Sage, DbSage, FeedItem } from '../types'

/**
 * Transform database user to frontend user format
 */
export function transformUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    avatar: dbUser.avatar,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  }
}

/**
 * Transform database sage to frontend sage format
 */
export function transformSage(dbSage: DbSage): Sage {
  return {
    id: dbSage.id,
    name: dbSage.name,
    role: dbSage.role,
    description: dbSage.description,
    avatar: dbSage.avatar,
    active: dbSage.active,
    memory: dbSage.memory,
    autonomy: dbSage.autonomy,
    dataAccess: dbSage.data_access,
    color: dbSage.color,
  }
}

/**
 * Transform feed item for frontend (if needed)
 */
export function transformFeedItem(item: FeedItem): FeedItem {
  // FeedItem already matches database format, but can add transformations here
  return item
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: string | null | undefined): boolean {
  if (!error) return false
  return error.toLowerCase().includes('unauthorized') || 
         error.toLowerCase().includes('authentication') ||
         error.toLowerCase().includes('401')
}
