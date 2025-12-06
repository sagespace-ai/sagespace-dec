/**
 * Input Validation Utilities
 * 
 * Provides utilities for validating user input and sanitizing data
 */

/**
 * Sanitize HTML to prevent XSS
 * Uses DOMPurify-like approach: strips dangerous content while preserving safe HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // Create a temporary div to parse HTML
  const div = document.createElement('div')
  div.innerHTML = html
  
  // Remove script tags and event handlers
  const scripts = div.querySelectorAll('script')
  scripts.forEach(script => script.remove())
  
  // Remove event handlers from all elements
  const allElements = div.querySelectorAll('*')
  allElements.forEach(el => {
    // Remove all on* attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name)
      }
      // Remove javascript: protocol from href/src
      if (attr.name === 'href' || attr.name === 'src') {
        const value = attr.value
        if (value && value.toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name)
        }
      }
    })
  })
  
  return div.innerHTML
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate text length
 */
export function validateLength(
  text: string,
  min: number = 0,
  max: number = Infinity
): { valid: boolean; error?: string } {
  if (text.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` }
  }
  if (text.length > max) {
    return { valid: false, error: `Must be no more than ${max} characters` }
  }
  return { valid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` }
  }
  return { valid: true }
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    }
  }
  return { valid: true }
}

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate prompt/content input
 */
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' }
  }

  if (prompt.length > 2000) {
    return { valid: false, error: 'Prompt must be less than 2000 characters' }
  }

  // Check for potentially dangerous content
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(prompt)) {
      return { valid: false, error: 'Prompt contains invalid content' }
    }
  }

  return { valid: true }
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(date: Date): { valid: boolean; error?: string } {
  if (date <= new Date()) {
    return { valid: false, error: 'Date must be in the future' }
  }
  return { valid: true }
}
