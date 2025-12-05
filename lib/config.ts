// Application configuration based on environment

export const config = {
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
    timeout: 30000, // 30 seconds
  },

  // Feature flags
  features: {
    council: true,
    memory: true,
    multiverse: true,
    observatory: true,
    personaEditor: true,
    artifacts: true,
  },

  // Observability
  observability: {
    enabled: process.env.NODE_ENV === "production",
    sampleRate: 0.1, // 10% of events
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
} as const

export type Config = typeof config
