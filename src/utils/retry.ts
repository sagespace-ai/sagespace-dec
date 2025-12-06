/**
 * Retry utility for API requests
 */

import type { ApiError } from "../types/api"

interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  retryable?: (error: ApiError | Error) => boolean
}

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000 // 1 second

/**
 * Check if an error is retryable
 */
function isRetryableError(error: ApiError | Error | unknown): boolean {
  if (!error || typeof error !== "object") {
    return false
  }

  const err = error as ApiError & Error

  // Network errors are retryable
  if (err.name === "NetworkError" || err.message?.includes("network")) {
    return true
  }

  // 5xx server errors are retryable
  if (err.status !== undefined && err.status >= 500 && err.status < 600) {
    return true
  }

  // 429 Too Many Requests is retryable
  if (err.status === 429) {
    return true
  }

  // Timeout errors are retryable
  if (err.name === "TimeoutError" || err.message?.includes("timeout")) {
    return true
  }

  return false
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = DEFAULT_MAX_RETRIES, retryDelay = DEFAULT_RETRY_DELAY, retryable = isRetryableError } = options

  let lastError: ApiError | Error | unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break
      }

      // Don't retry if error is not retryable
      if (!retryable(error)) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }

  throw lastError
}
