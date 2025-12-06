/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiter for API endpoints
 * In production, use Redis or a dedicated rate limiting service
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  /**
   * Check if request should be rate limited
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || now > entry.resetAt) {
      // Create new entry
      const resetAt = now + this.config.windowMs
      this.store.set(identifier, { count: 1, resetAt })
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt,
      }
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      }
    }

    // Increment count
    entry.count++
    this.store.set(identifier, entry)

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }
}

// Create rate limiters for different endpoints
export const rateLimiters = {
  // General API: 100 requests per 15 minutes
  general: new RateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }),

  // Create endpoint: 10 requests per minute
  create: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 10 }),

  // Upload endpoint: 5 requests per minute
  upload: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 5 }),

  // Chat endpoint: 30 requests per minute
  chat: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 30 }),

  // Search endpoint: 20 requests per minute
  search: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 20 }),
}

/**
 * Rate limit check function for Next.js API routes
 * 
 * Returns rate limit status for use in API handlers
 * Monitors rate limit hits for security and performance tracking
 */
export async function rateLimit(
  req: any,
  type: keyof typeof rateLimiters = 'general'
): Promise<{ success: boolean; identifier?: string; retryAfter?: number }> {
  const limiter = rateLimiters[type]
  
  // Get identifier (user ID or IP)
  const authHeader = req.headers.authorization
  const identifier = authHeader
    ? authHeader.replace('Bearer ', '').substring(0, 20)
    : req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  
  const result = limiter.check(identifier)
  
  if (!result.allowed) {
    // Log rate limit hit
    const { logRateLimit } = await import('./monitoring')
    logRateLimit(identifier, req.url || 'unknown')
    
    return {
      success: false,
      identifier,
      retryAfter: result.resetAt,
    }
  }
  
  return { success: true, identifier }
}
