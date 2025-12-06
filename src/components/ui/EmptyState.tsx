import { ReactNode } from 'react'
import { Button2035 } from './Button2035'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-6 text-gray-400 dark:text-gray-600 opacity-60">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button2035 variant="primary" size="md" onClick={action.onClick}>
              {action.label}
            </Button2035>
          )}
          {secondaryAction && (
            <Button2035 variant="secondary" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button2035>
          )}
        </div>
      )}
    </div>
  )
}
