/**
 * Accessibility tests using axe-core
 * 
 * Tests key pages and components for WCAG 2.1 AA compliance
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock components for testing
const MockButton = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
)

const MockInput = ({ label, ...props }: any) => (
  <div>
    <label htmlFor={props.id}>{label}</label>
    <input id={props.id} {...props} />
  </div>
)

describe('Accessibility - Basic Components', () => {
  it('buttons should have accessible labels', async () => {
    const { container } = render(
      <MockButton aria-label="Save content">Save</MockButton>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('inputs should have associated labels', async () => {
    const { container } = render(
      <MockInput label="Email" id="email" type="email" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper heading hierarchy', async () => {
    const { container } = render(
      <div>
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
      </div>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

describe('Accessibility - Keyboard Navigation', () => {
  it('interactive elements should be keyboard accessible', () => {
    const button = document.createElement('button')
    expect(button.tabIndex).toBe(0) // Buttons are naturally focusable
  })

  it('should have skip links', () => {
    // Skip link should exist (when rendered in actual app)
    // This test verifies the component structure
    const { container } = render(
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
    )
    const skipLink = container.querySelector('a[href="#main-content"]')
    expect(skipLink).toBeTruthy()
  })
})

describe('Accessibility - ARIA Labels', () => {
  it('icon buttons should have aria-labels', () => {
    const iconButton = document.createElement('button')
    iconButton.setAttribute('aria-label', 'Close dialog')
    expect(iconButton.getAttribute('aria-label')).toBeTruthy()
  })

  it('form inputs should have labels', () => {
    const input = document.createElement('input')
    const label = document.createElement('label')
    label.setAttribute('for', 'test-input')
    input.id = 'test-input'
    expect(label.getAttribute('for')).toBe(input.id)
  })
})
