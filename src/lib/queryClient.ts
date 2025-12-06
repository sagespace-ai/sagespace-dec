/**
 * React Query Client
 *
 * PHASE 2: Shared query client for server state
 * Corresponds to "Consolidate State Management - server state" in the audit.
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reasonable defaults for feed-like data
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
