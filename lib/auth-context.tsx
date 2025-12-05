"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  credits: number
  xp: number
  role: "user" | "admin"
  plan: "free" | "pro" | "enterprise"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  updateCredits: (amount: number) => void
  updateXp: (amount: number) => void
  isProUser: () => boolean
  isEnterpriseUser: () => boolean
  upgradePlan: (plan: "pro" | "enterprise") => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  let supabase: ReturnType<typeof createClient> | null = null

  useEffect(() => {
    try {
      supabase = createClient()
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      setLoading(false)
      return
    }

    // Get initial session
    const getUser = async () => {
      if (!supabase) return

      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          // Fetch profile from database
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

          if (profile) {
            setUser({
              id: authUser.id,
              name: profile.name,
              email: authUser.email || profile.email,
              image: profile.image,
              credits: profile.credits || 200,
              xp: profile.xp || 0,
              role: profile.role || "user",
              plan: profile.tier || "free",
            })
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
        if (session?.user) {
          const { data: profile } = await supabase!.from("profiles").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUser({
              id: session.user.id,
              name: profile.name,
              email: session.user.email || profile.email,
              image: profile.image,
              credits: profile.credits || 200,
              xp: profile.xp || 0,
              role: profile.role || "user",
              plan: profile.tier || "free",
            })
          }
        } else {
          setUser(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("[v0] Error signing out:", error)
    }
  }

  const updateCredits = (amount: number) => {
    if (user) {
      setUser({ ...user, credits: user.credits + amount })
    }
  }

  const updateXp = (amount: number) => {
    if (user) {
      setUser({ ...user, xp: user.xp + amount })
    }
  }

  const isProUser = () => {
    return user?.plan === "pro" || user?.plan === "enterprise"
  }

  const isEnterpriseUser = () => {
    return user?.plan === "enterprise"
  }

  const upgradePlan = (plan: "pro" | "enterprise") => {
    if (user) {
      setUser({ ...user, plan })
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, updateCredits, updateXp, isProUser, isEnterpriseUser, upgradePlan }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
