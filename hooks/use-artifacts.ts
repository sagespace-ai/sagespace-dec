"use client"

import useSWR from "swr"
import { http } from "@/lib/http"
import type { Artifact, CreateArtifactRequest } from "@/lib/types"
import { useCallback } from "react"

const fetcher = (url: string) => http.get<Artifact[]>(url)

export function useArtifacts(conversationId?: string) {
  const endpoint = conversationId ? `/api/artifacts?conversationId=${conversationId}` : "/api/artifacts"
  const { data, error, mutate } = useSWR<Artifact[]>(endpoint, fetcher)

  const createArtifact = useCallback(
    async (request: CreateArtifactRequest) => {
      const result = await http.post<Artifact>("/api/artifacts", request)
      await mutate()
      return result
    },
    [mutate],
  )

  return {
    artifacts: data || [],
    loading: !error && !data,
    error,
    createArtifact,
    refresh: mutate,
  }
}
