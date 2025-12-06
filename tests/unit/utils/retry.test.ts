/**
 * Unit tests for retry utility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { retry } from '../../../src/utils/retry'

describe('Retry Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on retryable errors', async () => {
    let attempts = 0
    const fn = vi.fn().mockImplementation(async () => {
      attempts++
      if (attempts < 2) {
        const error = new Error('Network error')
        error.name = 'NetworkError'
        throw error
      }
      return 'success'
    })

    const result = await retry(fn, { maxRetries: 3, retryDelay: 10 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should throw after max retries', async () => {
    const error = new Error('Network error')
    error.name = 'NetworkError'
    const fn = vi.fn().mockRejectedValue(error)

    await expect(retry(fn, { maxRetries: 2, retryDelay: 10 })).rejects.toThrow('Network error')
    expect(fn).toHaveBeenCalled()
  })

  it('should not retry non-retryable errors', async () => {
    const error = new Error('Validation error')
    error.status = 400 // 4xx errors are not retryable
    const fn = vi.fn().mockRejectedValue(error)

    await expect(retry(fn)).rejects.toThrow('Validation error')
    expect(fn).toHaveBeenCalledTimes(1) // Should not retry
  })

  it('should handle retry function signature', () => {
    // Test that retry function exists and accepts correct parameters
    expect(typeof retry).toBe('function')
    const fn = async () => 'test'
    expect(() => retry(fn)).not.toThrow()
  })
})
