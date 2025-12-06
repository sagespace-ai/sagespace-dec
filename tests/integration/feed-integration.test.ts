/**
 * Integration tests for feed functionality
 * 
 * Tests the complete flow of feed operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiService } from '../../src/services/api'

// Mock fetch
global.fetch = vi.fn()

describe('Feed Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Feed Retrieval Flow', () => {
    it('should fetch feed with authentication', async () => {
      localStorage.setItem('auth_token', 'test-token')
      
      const mockFeed = {
        data: [
          { id: '1', title: 'Post 1', type: 'post' },
          { id: '2', title: 'Post 2', type: 'post' },
        ],
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeed,
      })

      const result = await apiService.getFeed()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should handle feed filtering by view', async () => {
      localStorage.setItem('auth_token', 'test-token')
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      await apiService.getFeed('following')
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('view=following'),
        expect.any(Object)
      )
    })
  })

  describe('Feed Interaction Flow', () => {
    it('should handle like/unlike flow', async () => {
      localStorage.setItem('auth_token', 'test-token')
      
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { liked: true } }),
      })

      const result = await apiService.likeItem('item-1')
      expect(result.data).toBeDefined()
    })

    it('should handle comment creation flow', async () => {
      localStorage.setItem('auth_token', 'test-token')
      
      const mockComment = {
        data: {
          id: 'comment-1',
          content: 'Test comment',
          feed_item_id: 'item-1',
        },
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      })

      const result = await apiService.addComment('item-1', 'Test comment')
      expect(result.data).toBeDefined()
      expect(result.data.content).toBe('Test comment')
    })
  })
})
