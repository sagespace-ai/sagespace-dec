/**
 * Skeleton Loading Components
 * 
 * Provides skeleton screens for better loading UX
 */

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }
  const animationClasses = animate ? 'animate-pulse' : ''

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], animationClasses, className)}
      style={style}
    />
  )
}

/**
 * Feed Item Skeleton
 */
export function FeedItemSkeleton() {
  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={60} height={12} />
          </div>
          <Skeleton width={80} height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={200} />
      <div className="flex items-center gap-4">
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={80} height={20} />
      </div>
    </div>
  )
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
      <Skeleton width={200} height={24} />
      <Skeleton width="100%" height={16} />
      <Skeleton width="80%" height={16} />
    </div>
  )
}

/**
 * List Skeleton
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width={150} height={16} />
            <Skeleton width={100} height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={100} height={16} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} width={100} height={16} />
          ))}
        </div>
      ))}
    </div>
  )
}
