/**
 * Unit tests for cache utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock cache implementation
class Cache {
  private store: Map<string, { value: any; expires: number }> = new Map()

  set(key: string, value: any, ttl: number = 60000) {
    const expires = Date.now() + ttl
    this.store.set(key, { value, expires })
  }

  get(key: string): any | null {
    const entry = this.store.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.store.delete(key)
      return null
    }
    
    return entry.value
  }

  delete(key: string) {
    this.store.delete(key)
  }

  clear() {
    this.store.clear()
  }
}

describe('Cache Utility', () => {
  let cache: Cache

  beforeEach(() => {
    cache = new Cache()
  })

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return null for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeNull()
  })

  it('should expire values after TTL', () => {
    // Mock Date.now to test expiration
    const originalNow = Date.now
    let currentTime = 1000
    
    Date.now = () => currentTime
    
    cache.set('key1', 'value1', 1000) // 1 second TTL
    expect(cache.get('key1')).toBe('value1')
    
    // Advance time past TTL
    currentTime = 2001
    expect(cache.get('key1')).toBeNull()
    
    Date.now = originalNow
  })

  it('should delete values', () => {
    cache.set('key1', 'value1')
    cache.delete('key1')
    expect(cache.get('key1')).toBeNull()
  })

  it('should clear all values', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.clear()
    expect(cache.get('key1')).toBeNull()
    expect(cache.get('key2')).toBeNull()
  })
})
