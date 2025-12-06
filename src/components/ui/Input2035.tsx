/**
 * Input 2035 Component
 * 
 * Enhanced input component with modern styling
 * Adapted from SAGN_Unified
 */

import * as React from 'react'
import { cn } from '../../lib/utils'

export interface Input2035Props extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input2035 = React.forwardRef<HTMLInputElement, Input2035Props>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[12px] border border-white/10 bg-white/5 dark:bg-white/5',
          'px-4 py-2 text-sm text-black dark:text-white',
          'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input2035.displayName = 'Input2035'

export { Input2035 }
