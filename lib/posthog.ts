// PostHog analytics integration - Server-side only
// For client-side tracking, use server actions to log events

type PostHogEvent = {
  eventName: string
  userId?: string
  properties?: Record<string, any>
}

// Server-side only - do not expose API key to client
export async function trackEventServer(event: PostHogEvent) {
  const apiKey = process.env.POSTHOG_API_KEY
  const apiHost = process.env.POSTHOG_HOST || "https://app.posthog.com"

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[posthog]", event)
    }
    return
  }

  try {
    await fetch(`${apiHost}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        event: event.eventName,
        distinct_id: event.userId || "anonymous",
        properties: event.properties,
      }),
    })
  } catch (error) {
    console.error("[posthog] Failed to track event:", error)
  }
}

export async function identifyUserServer(userId: string, traits?: Record<string, any>) {
  const apiKey = process.env.POSTHOG_API_KEY
  const apiHost = process.env.POSTHOG_HOST || "https://app.posthog.com"

  if (!apiKey) return

  try {
    await fetch(`${apiHost}/identify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        distinct_id: userId,
        properties: traits,
      }),
    })
  } catch (error) {
    console.error("[posthog] Failed to identify user:", error)
  }
}

// Client-side tracking via server action
export async function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV === "development") {
    console.log("[posthog]", eventName, properties)
  }

  // In production, this would call a server action
  // For now, just log in development
}
