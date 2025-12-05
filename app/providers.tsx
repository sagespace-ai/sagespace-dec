"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function AuthListener({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    try {
      const supabase = createClient()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event: string) => {
        if (event === "SIGNED_IN") {
          router.refresh()
        }
        if (event === "SIGNED_OUT") {
          router.push("/auth/login")
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("[v0] AuthListener error:", error)
      // Don't block rendering if auth setup fails
    }
  }, [router])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthListener>{children}</AuthListener>
    </AuthProvider>
  )
}
