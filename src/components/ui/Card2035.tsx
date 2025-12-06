/**
 * Card 2035 Component
 * 
 * Modern card component with enhanced styling
 * Adapted from SAGN_Unified
 */

import * as React from 'react'
import { cn } from '../../lib/utils'

const Card2035 = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive = false, children, ...props }, ref) => {
  // PHASE 4: Respect prefers-reduced-motion for interactive cards
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-[16px] border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 p-6',
        'shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all',
        // PHASE 4: Enhanced focus styles for accessibility
        interactive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
        interactive && 'cursor-pointer hover:bg-white/8 hover:border-white/15 dark:hover:bg-white/8 dark:hover:border-white/15',
        // PHASE 4: Only apply scale transforms if motion is not reduced
        !prefersReducedMotion && interactive && 'hover:scale-[1.01] active:scale-[0.99]',
        className
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      {children}
    </div>
  )
})
Card2035.displayName = 'Card2035'

const Card2035Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 mb-4', className)}
    {...props}
  />
))
Card2035Header.displayName = 'Card2035Header'

const Card2035Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-tight tracking-tight text-black dark:text-white', className)}
    {...props}
  />
))
Card2035Title.displayName = 'Card2035Title'

const Card2035Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed', className)} {...props} />
))
Card2035Description.displayName = 'Card2035Description'

const Card2035Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
Card2035Content.displayName = 'Card2035Content'

export { Card2035, Card2035Header, Card2035Title, Card2035Description, Card2035Content }
