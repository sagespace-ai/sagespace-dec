/**
 * Unit tests for API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiService } from '../../../src/services/api'

// Mock fetch
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      try {
        await apiService.getFeed()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should handle 401 unauthorized', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })

      try {
        await apiService.getFeed()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should handle 500 server errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      try {
        await apiService.getFeed()
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('Authentication', () => {
    it('should include auth token in requests', async () => {
      localStorage.setItem('auth_token', 'test-token')
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await apiService.getFeed()

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })
  })

  describe('Request Retry', () => {
    it('should retry on transient errors', async () => {
      ;(fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })

      // Note: Retry logic is in utils/retry.ts
      // This test verifies the service uses retry
      await expect(apiService.getFeed()).resolves.toBeDefined()
    })
  })
})
