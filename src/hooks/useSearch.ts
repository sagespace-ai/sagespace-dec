"use client"

/**
 * useSearch Hook
 *
 * Provides search functionality with debouncing and caching
 */

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiService } from "../services/api"

interface SearchOptions {
  type?: "feed_item" | "user" | "sage" | "marketplace" | "all"
  limit?: number
  enabled?: boolean
  debounceMs?: number
}

export function useSearch(query: string, options: SearchOptions = {}) {
  const { type = "all", limit = 20, enabled = true, debounceMs = 300 } = options

  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce search query
  useEffect(() => {
    if (!enabled) return

    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs, enabled])

  const searchQuery = useQuery({
    queryKey: ["search", debouncedQuery, type, limit],
    queryFn: () => apiService.search(debouncedQuery, { type, limit }),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })

  return {
    results: searchQuery.data?.data?.results || [],
    total: searchQuery.data?.data?.total || 0,
    loading: searchQuery.isLoading,
    error: searchQuery.error?.message || null,
    query: debouncedQuery,
  }
}
