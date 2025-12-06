/**
 * Monitoring and Error Tracking
 *
 * Integrates Sentry for error tracking and monitoring
 * Falls back to console logging if Sentry is not configured
 */

type ErrorContext = {
  feature?: "auth" | "payments" | "remix" | "ai" | "notifications" | "content" | "social"
  userId?: string
  metadata?: Record<string, unknown>
}

type SentryInstance = typeof import("@sentry/react") | null

let Sentry: SentryInstance = null

// Lazy load Sentry to avoid bundle bloat
// Note: Sentry is already initialized in main.tsx, so we just use it here
if (typeof window !== "undefined") {
  try {
    // Try to get Sentry from window or import it
    if ((window as any).Sentry) {
      Sentry = (window as any).Sentry
    } else {
      import("@sentry/react")
        .then((SentryModule) => {
          Sentry = SentryModule
        })
        .catch(() => {
          // Sentry not available - that's okay, we'll use console logging
          console.warn("[monitoring] Sentry not available")
        })
    }
  } catch (error) {
    console.warn("[monitoring] Failed to load Sentry:", error)
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
        environment: import.meta.env.MODE,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.metadata,
    })
  } else {
    console.error("[monitoring]", error, context)
  }
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext) {
  if (Sentry) {
    Sentry.captureMessage(message, {
      level,
      tags: {
        feature: context?.feature,
        environment: import.meta.env.MODE,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.metadata,
    })
  } else {
    console[level === "error" ? "error" : level === "warning" ? "warn" : "log"](
      `[monitoring:${level}]`,
      message,
      context,
    )
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(userId: string | null, email?: string) {
  if (Sentry) {
    Sentry.setUser(userId ? { id: userId, email } : null)
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level: "info" | "warning" | "error" = "info",
  data?: Record<string, unknown>,
) {
  if (Sentry) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
    })
  }
}
