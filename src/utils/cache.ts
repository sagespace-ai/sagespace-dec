/**
 * Caching Utilities
 * 
 * Provides utilities for client-side caching with expiration
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { data: value, expiresAt })
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

// Singleton instance
export const cache = new Cache()

// Clean up expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.clearExpired()
  }, 60 * 1000)
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  feed: (params?: Record<string, any>) => {
    const key = 'feed'
    if (!params) return key
    return `${key}:${JSON.stringify(params)}`
  },
  user: (userId: string) => `user:${userId}`,
  sage: (sageId: string) => `sage:${sageId}`,
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  analytics: () => 'analytics',
  recommendations: () => 'recommendations',
}
