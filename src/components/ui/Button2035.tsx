/**
 * Button 2035 Component
 * 
 * Modern button component with subtle animations
 * Adapted from SAGN_Unified
 */

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface Button2035Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft'
  size?: 'sm' | 'md' | 'lg'
}

const Button2035 = React.forwardRef<HTMLButtonElement, Button2035Props>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    // PHASE 4: Respect prefers-reduced-motion for animations
    const prefersReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false

    const motionProps: React.ComponentProps<typeof motion.div> = prefersReducedMotion
      ? {}
      : {
          whileHover: { scale: 1.01 },
          whileTap: { scale: 0.99 },
          transition: { duration: 0.15 },
        }

    return (
      <motion.div
        {...motionProps}
        className="inline-block"
      >
        <button
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center font-medium transition-all',
            // PHASE 4: Enhanced focus styles for accessibility
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            'disabled:pointer-events-none disabled:opacity-40',
            {
              // Variants
              'bg-white text-black hover:bg-gray-50 dark:bg-white dark:text-black dark:hover:bg-gray-100': variant === 'primary',
              'border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10':
                variant === 'secondary',
              'hover:bg-white/5 dark:hover:bg-white/5': variant === 'ghost',
              'bg-white/10 hover:bg-white/15 dark:bg-white/10 dark:hover:bg-white/15': variant === 'soft',
              // Sizes
              'h-9 px-4 text-sm rounded-[12px]': size === 'sm',
              'h-11 px-6 text-base rounded-[14px]': size === 'md',
              'h-13 px-8 text-lg rounded-[16px]': size === 'lg',
            },
            className
          )}
          {...props}
        >
          {children}
        </button>
      </motion.div>
    )
  }
)
Button2035.displayName = 'Button2035'

export { Button2035 }
