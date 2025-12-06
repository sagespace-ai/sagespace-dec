/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest'

// Mock validation functions (these would be imported from actual validation utils)
function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  return { valid: true }
}

function validatePassword(password: string): { valid: boolean; error?: string; strength?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a number' }
  }
  return { valid: true, strength: 'strong' }
}

function validateRequired(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'This field is required' }
  }
  return { valid: true }
}

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid email')
    })

    it('should reject empty email', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })
  })

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123')
      expect(result.valid).toBe(true)
      expect(result.strength).toBe('strong')
    })

    it('should reject short password', () => {
      const result = validatePassword('Short1')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('at least 8 characters')
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('lowercase123')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('uppercase')
    })

    it('should reject password without number', () => {
      const result = validatePassword('NoNumberHere')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('number')
    })
  })

  describe('Required Field Validation', () => {
    it('should validate non-empty value', () => {
      const result = validateRequired('test value')
      expect(result.valid).toBe(true)
    })

    it('should reject empty string', () => {
      const result = validateRequired('')
      expect(result.valid).toBe(false)
    })

    it('should reject whitespace-only string', () => {
      const result = validateRequired('   ')
      expect(result.valid).toBe(false)
    })
  })
})
