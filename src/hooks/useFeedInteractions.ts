/**
 * useFeedInteractions Hook
 *
 * Phase 1: Data-backed interactions for feed items (like, comment, share, remix).
 * Uses the existing /api/feed/interactions endpoint and React Query mutations.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'

export type FeedInteractionType = 'like' | 'comment' | 'share' | 'remix'

interface InteractionPayload {
  feed_item_id: string
  interaction_type: FeedInteractionType
  content?: string
}

export function useFeedInteractions() {
  const queryClient = useQueryClient()

  const interactionMutation = useMutation({
    mutationFn: async (payload: InteractionPayload) => {
      const { data, error } = await apiService.createFeedInteraction(payload)

      if (error) {
        throw new Error(error)
      }

      return data
    },
    onSuccess: () => {
      // Refresh feed so derived counts / views stay in sync when we add them
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  return {
    createInteraction: interactionMutation.mutateAsync,
    creating: interactionMutation.isPending,
    error: interactionMutation.error as Error | null,
  }
}
