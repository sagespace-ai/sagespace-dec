/**
 * Unit tests for Remix/content evolution logic
 */

import { describe, it, expect } from 'vitest'

interface RemixInput {
  itemIds: string[]
  prompt?: string
  creativity?: number
  fidelity?: number
}

interface RemixResult {
  id: string
  content: string
  type: string
  remixChain: string[]
}

function validateRemixInput(input: RemixInput): { valid: boolean; error?: string } {
  if (!input.itemIds || input.itemIds.length === 0) {
    return { valid: false, error: 'At least one item is required' }
  }

  if (input.itemIds.length > 5) {
    return { valid: false, error: 'Maximum 5 items can be remixed' }
  }

  if (input.creativity !== undefined && (input.creativity < 0 || input.creativity > 100)) {
    return { valid: false, error: 'Creativity must be between 0 and 100' }
  }

  if (input.fidelity !== undefined && (input.fidelity < 0 || input.fidelity > 100)) {
    return { valid: false, error: 'Fidelity must be between 0 and 100' }
  }

  return { valid: true }
}

function createRemixChain(originalItemIds: string[], newItemId: string): string[] {
  return [...originalItemIds, newItemId]
}

function calculateRemixDepth(remixChain: string[]): number {
  return remixChain.length - 1
}

describe('Remix Input Validation', () => {
  it('should require at least one item', () => {
    const result = validateRemixInput({ itemIds: [] })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('At least one item')
  })

  it('should allow single item remix', () => {
    const result = validateRemixInput({ itemIds: ['item-1'] })
    expect(result.valid).toBe(true)
  })

  it('should allow multiple items', () => {
    const result = validateRemixInput({ itemIds: ['item-1', 'item-2', 'item-3'] })
    expect(result.valid).toBe(true)
  })

  it('should reject more than 5 items', () => {
    const result = validateRemixInput({
      itemIds: ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6'],
    })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Maximum 5 items')
  })

  it('should validate creativity range', () => {
    expect(validateRemixInput({ itemIds: ['item-1'], creativity: -1 }).valid).toBe(false)
    expect(validateRemixInput({ itemIds: ['item-1'], creativity: 101 }).valid).toBe(false)
    expect(validateRemixInput({ itemIds: ['item-1'], creativity: 50 }).valid).toBe(true)
  })

  it('should validate fidelity range', () => {
    expect(validateRemixInput({ itemIds: ['item-1'], fidelity: -1 }).valid).toBe(false)
    expect(validateRemixInput({ itemIds: ['item-1'], fidelity: 101 }).valid).toBe(false)
    expect(validateRemixInput({ itemIds: ['item-1'], fidelity: 75 }).valid).toBe(true)
  })
})

describe('Remix Chain Logic', () => {
  it('should create remix chain from original items', () => {
    const chain = createRemixChain(['item-1', 'item-2'], 'remix-1')
    expect(chain).toEqual(['item-1', 'item-2', 'remix-1'])
  })

  it('should calculate remix depth correctly', () => {
    expect(calculateRemixDepth(['item-1', 'remix-1'])).toBe(1)
    expect(calculateRemixDepth(['item-1', 'item-2', 'remix-1', 'remix-2'])).toBe(3)
  })

  it('should handle single item remix', () => {
    const chain = createRemixChain(['item-1'], 'remix-1')
    expect(chain.length).toBe(2)
    expect(calculateRemixDepth(chain)).toBe(1)
  })
})
