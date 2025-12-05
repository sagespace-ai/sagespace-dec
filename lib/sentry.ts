// Sentry error tracking integration
// Install: npm install @sentry/nextjs

type SentryConfig = {
  dsn?: string
  environment?: string
  tracesSampleRate?: number
  integrations?: unknown[]
  [key: string]: unknown
}

type SentryInstance = {
  init: (config: SentryConfig) => void
  captureException: (error: Error, context?: { extra?: Record<string, unknown> }) => void
  captureMessage: (message: string, level: "info" | "warning" | "error") => void
  BrowserTracing: new () => unknown
}

let Sentry: SentryInstance | null = null

// Lazy load Sentry to avoid bundle bloat
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require("@sentry/nextjs")

    if (Sentry) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        integrations: [new Sentry.BrowserTracing()],
      })
    }
  } catch (error) {
    console.warn("[sentry] Failed to initialize Sentry:", error)
  }
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (Sentry) {
    Sentry.captureException(error, { extra: context })
  } else {
    console.error("[sentry]", error, context)
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (Sentry) {
    Sentry.captureMessage(message, level)
  } else {
    console.log(`[sentry][${level}]`, message)
  }
}
