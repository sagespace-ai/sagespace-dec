/**
 * useFeed Hook
 *
 * PHASE 2: Server state via React Query with cursor-based pagination.
 * Corresponds to "Consolidate State Management - server state" in the audit.
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import type { FeedItem, PaginatedResponse } from '../types'

interface UseFeedOptions {
  initialLimit?: number
  autoLoad?: boolean
  personaHint?: string
  view?: 'default' | 'marketplace' | 'universe' | 'following'
}

interface FeedPage {
  items: FeedItem[]
  cursor?: string
  hasMore: boolean
}

export function useFeed(options: UseFeedOptions = {}) {
  const { initialLimit = 20, autoLoad = true, personaHint, view = 'default' } = options

  const query = useInfiniteQuery<FeedPage, Error>({
    queryKey: ['feed', { limit: initialLimit, persona: personaHint ?? null, view }],
    enabled: autoLoad,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.cursor : undefined),
    queryFn: async ({ pageParam }) => {
      const cursor = (pageParam as string | undefined) ?? undefined
      const { data, error } = await apiService.getFeed(cursor, initialLimit, personaHint, view)

      if (error) {
        throw new Error(error)
      }

      const feedData = (data as unknown) as PaginatedResponse<FeedItem>

      return {
        items: feedData.data || [],
        cursor: feedData.cursor,
        hasMore: feedData.has_more,
      }
    },
  })

  const items = query.data?.pages.flatMap((page) => page.items) ?? []
  const lastPage = query.data?.pages[query.data.pages.length - 1]
  const hasMore = lastPage?.hasMore ?? false

  return {
    items,
    loading: query.isLoading || query.isFetching,
    error: query.error?.message ?? null,
    hasMore,
    loadMore: () => {
      if (hasMore && !query.isFetchingNextPage) {
        query.fetchNextPage()
      }
    },
    refresh: () => {
      query.refetch()
    },
  }
}
