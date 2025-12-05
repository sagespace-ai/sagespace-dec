"use client"

import useSWR from "swr"
import { http } from "@/lib/http"
import type { AgentMetrics, SystemHealth } from "@/lib/types"

export function useObservatory() {
  const metricsFetcher = (url: string) => http.get<AgentMetrics[]>(url)
  const healthFetcher = (url: string) => http.get<SystemHealth>(url)

  const {
    data: metrics,
    error: metricsError,
    mutate: mutateMetrics,
  } = useSWR<AgentMetrics[]>(
    "/api/observability/metrics",
    metricsFetcher,
    { refreshInterval: 30000 }, // Refresh every 30s
  )

  const {
    data: health,
    error: healthError,
    mutate: mutateHealth,
  } = useSWR<SystemHealth>(
    "/api/observability/health",
    healthFetcher,
    { refreshInterval: 10000 }, // Refresh every 10s
  )

  return {
    metrics: metrics || [],
    health,
    loading: (!metricsError && !metrics) || (!healthError && !health),
    error: metricsError || healthError,
    refresh: () => {
      mutateMetrics()
      mutateHealth()
    },
  }
}
