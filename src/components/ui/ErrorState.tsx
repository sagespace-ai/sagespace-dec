/**
 * ErrorState Component
 * PHASE 4: Consistent error states with retry capability
 */

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Card2035, Card2035Content } from './Card2035'
import { Button2035 } from './Button2035'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  className = '' 
}: ErrorStateProps) {
  return (
    <Card2035 className={`text-center py-12 ${className}`}>
      <Card2035Content>
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {message}
        </p>
        {onRetry && (
          <Button2035 
            variant="primary" 
            size="md" 
            onClick={onRetry}
            aria-label="Retry operation"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button2035>
        )}
      </Card2035Content>
    </Card2035>
  )
}
