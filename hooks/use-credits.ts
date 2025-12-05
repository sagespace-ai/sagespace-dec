"use client"

import useSWR from "swr"
import { http } from "@/lib/http"
import { useAuth } from "@/lib/auth-context"

type CreditHistoryItem = {
  id: string
  amount: number
  reason: string
  timestamp: string
  conversationId?: string
  metadata?: Record<string, unknown>
}

interface CreditsData {
  balance: number
  history: CreditHistoryItem[]
  plan: string
}

const fetcher = (url: string) => http.get<CreditsData>(url)

export function useCredits() {
  const { user } = useAuth()

  const { data, error, mutate } = useSWR<CreditsData>(user ? "/api/credits" : null, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  return {
    credits: data?.balance || 0,
    history: data?.history || [],
    plan: data?.plan || "free",
    loading: !error && !data && Boolean(user),
    error,
    refresh: mutate,
  }
}
