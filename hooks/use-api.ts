"use client"

import { useState } from "react"
import toast from "react-hot-toast"

export function useAPI() {
  const [loading, setLoading] = useState(false)

  async function request<T>(url: string, options?: RequestInit): Promise<{ ok: boolean; data?: T; error?: string }> {
    setLoading(true)
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || "An error occurred")
        return { ok: false, error: json.error }
      }

      return { ok: true, data: json.data }
    } catch (error) {
      console.error("[useAPI] Error:", error)
      toast.error("Network error")
      return { ok: false, error: "Network error" }
    } finally {
      setLoading(false)
    }
  }

  return { request, loading }
}
