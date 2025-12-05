export const APP_ROUTES = {
  // Marketing
  home: "/",
  login: "/auth/login",
  signup: "/auth/signup",

  // Main App
  hub: "/demo", // TODO: Migrate to /hub after updating all links
  playground: "/playground",
  sageWatch: "/observatory",
  sageCircle: "/council",
  memoryLane: "/memory",
  theFeed: "/multiverse", // TODO: Migrate to /feed
  sageGalaxy: "/universe-map", // TODO: Migrate to /galaxy
  sageStudio: "/persona-editor", // TODO: Migrate to /studio
  marketplace: "/marketplace",
  marketplaceSage: (slug: string) => `/marketplace/${slug}`,

  // API
  api: {
    chat: "/api/chat",
    agents: "/api/agents",
    feed: "/api/feed",
    artifacts: "/api/artifacts",
  },
} as const

// Route metadata for documentation
export const ROUTE_STATUS = {
  [APP_ROUTES.hub]: { implemented: true, needsMigration: true, targetPath: "/hub" },
  [APP_ROUTES.playground]: { implemented: true, needsPreSeededSession: false },
  [APP_ROUTES.sageWatch]: { implemented: true, needsAPI: true },
  [APP_ROUTES.sageCircle]: { implemented: true, needsAPI: true },
  [APP_ROUTES.memoryLane]: { implemented: true, needsAPI: true },
  [APP_ROUTES.theFeed]: { implemented: true, needsMigration: true, targetPath: "/feed" },
  [APP_ROUTES.sageGalaxy]: { implemented: true, needsMigration: true, targetPath: "/galaxy" },
  [APP_ROUTES.sageStudio]: { implemented: true, needsAPI: true },
  [APP_ROUTES.marketplace]: { implemented: true, needsAPI: false },
}
