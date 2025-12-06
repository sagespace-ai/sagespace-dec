/**
 * useSages Hook
 *
 * PHASE 2: Server state via React Query for sages.
 * Corresponds to "Consolidate State Management - server state" in the audit.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import type { Sage } from '../types'

const SAGES_QUERY_KEY = ['sages']

export function useSages() {
  const queryClient = useQueryClient()

  const sagesQuery = useQuery<Sage[], Error>({
    queryKey: SAGES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await apiService.getSages()

      if (error) {
        throw new Error(error)
      }

      if (!data || !Array.isArray(data)) {
        return []
      }

      // Transform database sage to frontend sage format
      return data.map((dbSage: any) => ({
        id: dbSage.id,
        name: dbSage.name,
        role: dbSage.role,
        description: dbSage.description,
        avatar: dbSage.avatar,
        active: dbSage.active,
        memory: dbSage.memory,
        autonomy: dbSage.autonomy,
        dataAccess: dbSage.data_access,
        color: dbSage.color,
      })) as Sage[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (sageData: {
      name: string
      role: string
      description: string
      avatar: string
      memory: 'local' | 'cross-session' | 'global'
      autonomy: 'advisory' | 'semi-autonomous' | 'autonomous'
      dataAccess: string
      color: string
    }) => {
      const { data, error } = await apiService.createSage(sageData)

      if (error) {
        throw new Error(error)
      }

      const created = data as any
      const newSage: Sage = {
        id: created.id,
        name: created.name,
        role: created.role,
        description: created.description,
        avatar: created.avatar,
        active: created.active,
        memory: created.memory,
        autonomy: created.autonomy,
        dataAccess: created.data_access,
        color: created.color,
      }

      return newSage
    },
    onSuccess: (newSage) => {
      // PHASE 2: Update cached sages list
      queryClient.setQueryData<Sage[] | undefined>(SAGES_QUERY_KEY, (prev) =>
        prev ? [newSage, ...prev] : [newSage],
      )
    },
  })

  return {
    sages: sagesQuery.data ?? [],
    loading: sagesQuery.isLoading || createMutation.isPending,
    error: sagesQuery.error?.message ?? createMutation.error?.message ?? null,
    refresh: () => sagesQuery.refetch(),
    createSage: createMutation.mutateAsync,
  }
}
