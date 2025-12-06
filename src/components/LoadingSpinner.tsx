interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

/**
 * PHASE 4: Enhanced loading spinner with accessibility support
 */
export default function LoadingSpinner({ size = 'md', className = '', label = 'Loading' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-live="polite">
      <div
        className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin`}
        aria-hidden="true"
      ></div>
      <span className="sr-only">{label}</span>
    </div>
  )
}
