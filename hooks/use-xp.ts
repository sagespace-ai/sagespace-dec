"use client"

import useSWR from "swr"
import { http } from "@/lib/http"
import { useAuth } from "@/lib/auth-context"

type Badge = {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
  rarity?: string
}

interface XPData {
  xp: number
  level: number
  nextLevelAt: number
  badges: Badge[]
}

export function useXP() {
  const { user } = useAuth()

  const { data, error, mutate } = useSWR<XPData>(user ? "/api/xp" : null, (url: string) => http.get<XPData>(url), {
    refreshInterval: 30000,
  })

  return {
    xp: data?.xp || 0,
    level: data?.level || 1,
    nextLevelAt: data?.nextLevelAt || 100,
    badges: data?.badges || [],
    loading: !error && !data && Boolean(user),
    error,
    refresh: mutate,
  }
}
