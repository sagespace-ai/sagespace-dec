"use client"

import useSWR from "swr"
import { http } from "@/lib/http"
import type { CouncilDeliberation, CreateCouncilRequest } from "@/lib/types"
import { useCallback, useState } from "react"

export function useCouncil() {
  const [deliberationId, setDeliberationId] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const fetcher = (url: string) => http.get<CouncilDeliberation>(url)

  const { data, error, mutate } = useSWR<CouncilDeliberation>(
    deliberationId ? `/api/council/${deliberationId}` : null,
    fetcher,
    {
      refreshInterval: polling ? 2000 : 0, // Poll every 2s if status is not complete
    },
  )

  const startDeliberation = useCallback(
    async (request: CreateCouncilRequest) => {
      const result = await http.post<CouncilDeliberation>("/api/council", request)
      setDeliberationId(result.id)
      setPolling(result.status !== "complete")
      return result
    },
    [mutate],
  )

  // Stop polling when complete
  if (data?.status === "complete" && polling) {
    setPolling(false)
  }

  return {
    deliberation: data,
    loading: !error && !data && Boolean(deliberationId),
    polling,
    error,
    startDeliberation,
    refresh: mutate,
  }
}
