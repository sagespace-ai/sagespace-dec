"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  joinedDate: string
  stats: {
    creations: number
    interactions: number
    followers: number
    following: number
  }
}

interface UserContextType {
  user: User | null
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // UserContext should be deprecated in favor of AuthContext
    console.log("[v0] UserContext initializing...")

    // Just set loading to false - auth user will come from AuthContext
    setIsLoading(false)

    console.log("[v0] UserContext initialized (deprecated - using AuthContext)")
  }, [])

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("sagespace-user", JSON.stringify(updated))
      }
      return updated
    })
  }

  return <UserContext.Provider value={{ user, updateUser, isLoading }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
