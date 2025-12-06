/**
 * Server-side Monitoring and Error Tracking
 * 
 * Integrates Sentry for API error tracking
 */

type ErrorContext = {
  feature?: 'auth' | 'payments' | 'remix' | 'ai' | 'notifications' | 'content' | 'social'
  userId?: string
  endpoint?: string
  metadata?: Record<string, unknown>
}

let Sentry: any = null

// Lazy load Sentry
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
      ],
      beforeSend(event, hint) {
        // Tag errors by feature area
        if (hint.originalException) {
          const context = (hint.originalException as any).context as ErrorContext | undefined
          if (context?.feature) {
            event.tags = { ...event.tags, feature: context.feature }
          }
          if (context?.endpoint) {
            event.tags = { ...event.tags, endpoint: context.endpoint }
          }
        }
        return event
      },
    })
  } catch (error) {
    console.warn('[monitoring] Sentry initialization failed:', error)
  }
}

/**
 * Capture an exception with context
 */
export function captureException(error: Error, context?: ErrorContext) {
  if (Sentry) {
    Sentry.captureException(error, {
      tags: {
        feature: context?.feature,
        endpoint: context?.endpoint,
        environment: process.env.NODE_ENV,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.metadata,
    })
  } else {
    console.error('[monitoring]', error, context)
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
) {
  if (Sentry) {
    Sentry.captureMessage(message, {
      level,
      tags: {
        feature: context?.feature,
        endpoint: context?.endpoint,
        environment: process.env.NODE_ENV,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.metadata,
    })
  } else {
    const logMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'
    console[logMethod](`[monitoring:${level}]`, message, context)
  }
}

/**
 * Log payment failure
 */
export function logPaymentFailure(error: Error, metadata: Record<string, unknown>) {
  captureException(error, {
    feature: 'payments',
    metadata: {
      ...metadata,
      severity: 'critical',
    },
  })
}

/**
 * Log webhook signature error
 */
export function logWebhookError(endpoint: string, error: Error) {
  captureException(error, {
    feature: 'payments',
    endpoint,
    metadata: {
      severity: 'high',
      type: 'webhook_signature_error',
    },
  })
}

/**
 * Log authorization failure
 */
export function logAuthFailure(userId: string | undefined, endpoint: string, reason: string) {
  captureMessage(`Authorization failed: ${reason}`, 'warning', {
    feature: 'auth',
    userId,
    endpoint,
    metadata: {
      reason,
      severity: 'medium',
    },
  })
}

/**
 * Log rate limit hit
 */
export function logRateLimit(identifier: string, endpoint: string) {
  captureMessage('Rate limit exceeded', 'warning', {
    feature: 'auth',
    endpoint,
    metadata: {
      identifier,
      severity: 'low',
    },
  })
}
