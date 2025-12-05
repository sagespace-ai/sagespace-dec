import { Redis } from "@upstash/redis"

let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function checkRateLimit(
  key: string,
  limit: number,
  window: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) {
    // If Redis is not configured, allow all requests
    return { allowed: true, remaining: limit }
  }

  try {
    const count = await redis.incr(key)

    if (count === 1) {
      await redis.expire(key, window)
    }

    const allowed = count <= limit
    const remaining = Math.max(0, limit - count)

    return { allowed, remaining }
  } catch (error) {
    console.error("[rate] Error checking rate limit:", error)
    return { allowed: true, remaining: limit }
  }
}

export async function getRateLimitKey(
  type: "global" | "user" | "chat" | "council",
  identifier: string,
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000 / 60) // Per minute
  return `rate:${type}:${identifier}:${timestamp}`
}
