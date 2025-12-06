/**
 * useRemixStitch Hook
 * 
 * React Query hook for the Remix/Stitch feature.
 * Handles API calls and state management for combining two inputs.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import type { RemixRequest, RemixResponse } from '../types/remix'

interface UseRemixStitchReturn {
  remix: (request: RemixRequest) => Promise<RemixResponse | undefined>
  isLoading: boolean
  error: string | null
  data: RemixResponse | null
}

export function useRemixStitch(): UseRemixStitchReturn {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (request: RemixRequest): Promise<RemixResponse> => {
      const { data, error } = await apiService.remix({
        inputA: request.inputA,
        inputB: request.inputB,
        mode: request.mode || 'concept_blend',
        extraContext: request.extraContext,
      })

      if (error) {
        throw new Error(error)
      }

      return data as RemixResponse
    },
    onSuccess: () => {
      // Invalidate feed queries to refresh the feed with new remix
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  return {
    remix: async (request: RemixRequest) => {
      try {
        const result = await mutation.mutateAsync(request)
        return result
      } catch (error) {
        console.error('Remix error:', error)
        return undefined
      }
    },
    isLoading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    data: mutation.data || null,
  }
}
