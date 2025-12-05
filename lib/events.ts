import { trackEventServer } from "./posthog"
import { captureException, captureMessage } from "./sentry"

type EventType =
  | "chat_turn"
  | "council_complete"
  | "artifact_create"
  | "credit_low"
  | "persona_create"
  | "level_up"
  | "daily_streak"

interface Event {
  type: EventType
  userId: string
  timestamp: number
  props?: Record<string, any>
}

export async function logEvent(event: Event) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[event]", event)
  }

  // Send to PostHog server-side
  try {
    await trackEventServer({
      eventName: event.type,
      userId: event.userId,
      properties: {
        timestamp: event.timestamp,
        ...event.props,
      },
    })
  } catch (error) {
    console.error("[events] PostHog error:", error)
  }

  // Log important milestones to Sentry
  if (["level_up", "council_complete"].includes(event.type)) {
    captureMessage(`User ${event.userId} triggered ${event.type}`, "info")
  }
}

export async function logError(error: Error, context?: Record<string, any>) {
  console.error("[error]", error, context)
  captureException(error, context)
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") {
    // Server-side tracking
    if (process.env.SENTRY_DSN) {
      console.log("[Sentry] Event:", event, properties)
    }
    if (process.env.POSTHOG_API_KEY) {
      console.log("[PostHog] Event:", event, properties)
    }
    return
  }

  // Client-side tracking (demo mode logs to console)
  console.log("[v0] Event tracked:", event, properties)
}
