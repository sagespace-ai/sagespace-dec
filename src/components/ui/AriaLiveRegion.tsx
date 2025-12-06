/**
 * ARIA Live Region Component
 * 
 * Announces dynamic content updates to screen readers
 */

import { ReactNode } from 'react'

interface AriaLiveRegionProps {
  children: ReactNode
  level?: 'polite' | 'assertive'
  id?: string
}

export function AriaLiveRegion({
  children,
  level = 'polite',
  id = 'aria-live-region',
}: AriaLiveRegionProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live={level}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  )
}

/**
 * Hook to announce messages to screen readers
 */
export function useAriaAnnouncement() {
  const announce = (message: string, level: 'polite' | 'assertive' = 'polite') => {
    const region = document.getElementById('aria-live-region')
    if (region) {
      region.setAttribute('aria-live', level)
      region.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = ''
      }, 1000)
    }
  }

  return { announce }
}
