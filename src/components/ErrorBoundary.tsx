import { Component, ReactNode, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Description, Card2035Content } from './ui/Card2035'
import { Button2035 } from './ui/Button2035'
import { SmartNavigation } from './navigation/SmartNavigation'
import { FadeIn } from './motion/FadeIn'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorDisplayProps {
  error: Error
  errorInfo: React.ErrorInfo | null
  onReset: () => void
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Store error info in state for display
    this.setState({ errorInfo })
    
    // Record error in SATI telemetry (with error handling)
    try {
      import('../core/sati/Telemetry').then(({ getTelemetry }) => {
        try {
          const telemetry = getTelemetry()
          telemetry.record({
            type: 'error-rate-high',
            severity: 'critical',
            message: error.message,
            metadata: {
              componentStack: errorInfo.componentStack,
              errorName: error.name,
              userAgent: navigator.userAgent,
              url: window.location.href,
              timestamp: new Date().toISOString(),
            },
          })
        } catch (telemetryError) {
          // If telemetry fails, at least log to console
          console.error('Failed to record error in telemetry:', telemetryError)
        }
      }).catch(() => {
        // Telemetry module not available - that's okay
        console.warn('Telemetry module not available')
      })
    } catch (telemetryError) {
      // If telemetry import fails, continue anyway
      console.warn('Failed to import telemetry:', telemetryError)
    }

    // Send to error tracking service (with error handling)
    try {
      if (import.meta.env.PROD || import.meta.env.VITE_SENTRY_DSN) {
        import('../lib/monitoring').then(({ captureException }) => {
          try {
            captureException(error, {
              feature: 'content', // Default, can be enhanced
              metadata: {
                componentStack: errorInfo.componentStack,
                errorName: error.name,
                userAgent: navigator.userAgent,
                url: window.location.href,
              },
            })
          } catch (monitoringError) {
            console.warn('Failed to capture exception:', monitoringError)
          }
        }).catch(() => {
          // Monitoring module not available - that's okay
          console.warn('Monitoring module not available')
        })
      }
    } catch (monitoringError) {
      // If monitoring import fails, continue anyway
      console.warn('Failed to import monitoring:', monitoringError)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/home'
  }

  getErrorCategory(error: Error): { category: string; suggestion: string; icon: typeof AlertTriangle } {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        category: 'Network Error',
        suggestion: 'Check your internet connection and try again.',
        icon: AlertTriangle
      }
    }

    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return {
        category: 'Authentication Error',
        suggestion: 'Your session may have expired. Try signing in again.',
        icon: AlertTriangle
      }
    }

    if (message.includes('not found') || message.includes('404')) {
      return {
        category: 'Resource Not Found',
        suggestion: 'The resource you\'re looking for doesn\'t exist or has been moved.',
        icon: AlertTriangle
      }
    }

    if (message.includes('permission') || message.includes('forbidden') || message.includes('access')) {
      return {
        category: 'Permission Error',
        suggestion: 'You don\'t have permission to access this resource.',
        icon: AlertTriangle
      }
    }

    return {
      category: 'Unexpected Error',
      suggestion: 'Something unexpected happened. Your data is safe, and you can usually fix this by trying again.',
      icon: AlertTriangle
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      if (!this.state.error) {
        return this.props.children
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// Enhanced Error Display Component with Progressive Disclosure
function ErrorDisplay({ error, errorInfo, onReset }: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  
  const errorCategory = (() => {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        category: 'Network Error',
        suggestion: 'Check your internet connection and try again.',
        color: 'blue'
      }
    }

    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return {
        category: 'Authentication Error',
        suggestion: 'Your session may have expired. Try signing in again.',
        color: 'orange'
      }
    }

    if (message.includes('not found') || message.includes('404')) {
      return {
        category: 'Resource Not Found',
        suggestion: 'The resource you\'re looking for doesn\'t exist or has been moved.',
        color: 'purple'
      }
    }

    if (message.includes('permission') || message.includes('forbidden') || message.includes('access')) {
      return {
        category: 'Permission Error',
        suggestion: 'You don\'t have permission to access this resource.',
        color: 'red'
      }
    }

    return {
      category: 'Unexpected Error',
      suggestion: 'Something unexpected happened. Your data is safe, and you can usually fix this by trying again.',
      color: 'red'
    }
  })()

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="max-w-4xl w-full space-y-6">
        <FadeIn>
          <Card2035 className="text-center">
            <Card2035Content>
              <div className="mb-6">
                <div className={`mx-auto w-20 h-20 ${colorClasses[errorCategory.color as keyof typeof colorClasses]} rounded-full flex items-center justify-center mb-6`}>
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <Card2035Header>
                  <Card2035Title className="text-2xl">We hit a glitch in your universe</Card2035Title>
                  <Card2035Description className="mt-2">
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {errorCategory.category}
                      </p>
                      <p className="text-sm">
                        {errorCategory.suggestion}
                      </p>
                    </div>
                  </Card2035Description>
                </Card2035Header>

                {/* User-Friendly Error Message */}
                {error.message && error.message !== 'Error' && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>What happened:</strong> {error.message}
                    </p>
                  </div>
                )}

                {/* Progressive Disclosure - Technical Details */}
                <div className="mt-4 text-left">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      {showDetails ? 'Hide' : 'Show'} technical details
                    </span>
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {showDetails && (
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Error Type
                        </p>
                        <p className="text-xs font-mono text-gray-900 dark:text-white">
                          {error.name}
                        </p>
                      </div>
                      
                      {error.message && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Error Message
                          </p>
                          <p className="text-xs text-gray-900 dark:text-white break-words">
                            {error.message}
                          </p>
                        </div>
                      )}

                      {error.stack && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Stack Trace
                          </p>
                          <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded overflow-auto max-h-48 font-mono">
                            {error.stack}
                          </pre>
                        </div>
                      )}

                      {errorInfo?.componentStack && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Component Stack
                          </p>
                          <pre className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded overflow-auto max-h-32 font-mono">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          This error has been automatically reported to help us improve.
                        </p>
                        <a
                          href="https://sentry.io"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View error details <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button2035
                  variant="primary"
                  size="md"
                  onClick={onReset}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button2035>
                <Link
                  to="/home"
                  className="flex-1 inline-flex items-center justify-center h-11 px-6 text-base rounded-[14px] font-medium transition-all border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
                <Button2035
                  variant="secondary"
                  size="md"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
                  Go Back
                </Button2035>
              </div>

              {/* Progressive Disclosure - Navigation Help */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setShowNavigation(!showNavigation)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400"
                >
                  <span>Need help finding your way?</span>
                  {showNavigation ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Card2035Content>
          </Card2035>
        </FadeIn>

        {/* Smart Navigation Suggestions - Progressive Disclosure */}
        {showNavigation && (
          <FadeIn delay={0.1}>
            <Card2035>
              <Card2035Content className="pt-6">
                <SmartNavigation 
                  title="Explore these pages instead"
                  showTitle={true}
                  maxSuggestions={6}
                />
              </Card2035Content>
            </Card2035>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
