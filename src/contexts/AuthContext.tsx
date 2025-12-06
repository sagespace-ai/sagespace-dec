"use client"

/**
 * Authentication Context
 *
 * Manages user authentication state and provides auth methods.
 * Integrates with Supabase Auth and the API service.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase, syncAuthToken, initAuthSync } from "../lib/supabase"
import type { User } from "../types"
import { apiService } from "../services/api"
import type { SessionData } from "../types/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth sync
  useEffect(() => {
    let isMounted = true
    let subscription: { unsubscribe: () => void } | null = null

    const initializeAuth = async () => {
      console.log("[v0] Initializing authentication...")

      if (!supabase) {
        console.warn("[v0] Supabase not configured - running in guest mode")
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      try {
        // Safely initialize auth sync
        try {
          initAuthSync()
        } catch (error) {
          console.warn("[v0] Error initializing auth sync:", error)
        }

        try {
          const sessionPromise = supabase.auth.getSession().catch((error) => {
            console.warn("[v0] Error getting session:", error)
            return { data: { session: null }, error: null }
          })

          const timeoutPromise = new Promise<{ data: { session: null }; error: null }>((resolve) =>
            setTimeout(() => {
              console.warn("[v0] Session check timed out - continuing in guest mode")
              resolve({ data: { session: null }, error: null })
            }, 2000),
          )

          const result = (await Promise.race([sessionPromise, timeoutPromise])) as {
            data: { session: SessionData | null }
            error: any
          }

          if (isMounted) {
            if (result?.data?.session && !result.error) {
              try {
                await loadUserProfile()
              } catch (error) {
                console.warn("[v0] Error loading user profile:", error)
                setLoading(false)
              }
            } else {
              setLoading(false)
            }
          }
        } catch (error) {
          console.warn("[v0] Error checking session:", error)
          if (isMounted) {
            setLoading(false)
          }
        }

        // Listen for auth changes
        try {
          const {
            data: { subscription: authSubscription },
          } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return

            try {
              if (session) {
                try {
                  await syncAuthToken()
                } catch (error) {
                  console.warn("[v0] Error syncing auth token:", error)
                }
                try {
                  await loadUserProfile()
                } catch (error) {
                  console.warn("[v0] Error loading user profile in auth change:", error)
                  setLoading(false)
                }
              } else {
                setUser(null)
                localStorage.removeItem("auth_token")
                setLoading(false)
              }
            } catch (error) {
              console.warn("[v0] Error in auth state change handler:", error)
              if (isMounted) {
                setLoading(false)
              }
            }
          })
          subscription = authSubscription
        } catch (error) {
          console.warn("[v0] Error setting up auth listener:", error)
          if (isMounted) {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("[v0] Error initializing auth:", error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth().catch((error) => {
      console.error("[v0] Fatal error in auth initialization:", error)
      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.warn("[v0] Error unsubscribing from auth:", error)
        }
      }
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      if (!supabase) {
        console.warn("[v0] No Supabase client available")
        setLoading(false)
        return
      }

      let session = null
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Session fetch timeout")), 2000)),
        ])
        session = (sessionResult as any)?.data?.session || null
      } catch (error) {
        console.warn("[v0] Error getting session in loadUserProfile:", error)
        setLoading(false)
        return
      }

      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }

      if (!import.meta.env.VITE_API_URL) {
        console.log("[v0] No API URL configured, using session data only")
        const sessionUser = session.user
        setUser({
          id: sessionUser.id,
          name: sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0] || "User",
          email: sessionUser.email || "",
          avatar: sessionUser.user_metadata?.avatar || null,
          createdAt: new Date(sessionUser.created_at).toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      // Try to load user profile from API with timeout
      let data = null
      let error: string | undefined = undefined

      try {
        const apiCall = apiService.getMe().catch((err) => {
          console.warn("[v0] API call failed in loadUserProfile:", err)
          return { data: null, error: err.message || "Failed to load user profile" }
        })
        const timeout = new Promise<{ data: null; error: string }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: "API request timeout" }), 3000),
        )

        const result = await Promise.race([apiCall, timeout])
        data = result.data
        error = result.error
      } catch (err: any) {
        console.warn("[v0] Error in loadUserProfile API call:", err)
        error = err.message || "Failed to load user profile"
      }

      if (error || !data) {
        console.warn("[v0] Failed to load user profile from API, using session data:", error)
        const sessionUser = session.user
        setUser({
          id: sessionUser.id,
          name: sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0] || "User",
          email: sessionUser.email || "",
          avatar: sessionUser.user_metadata?.avatar || null,
          createdAt: new Date(sessionUser.created_at).toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } else {
        const userData = data as any
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
        })
      }
    } catch (error) {
      console.error("[v0] Error loading user profile:", error)
      try {
        if (supabase) {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (session?.user) {
            const sessionUser = session.user
            setUser({
              id: sessionUser.id,
              name: sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0] || "User",
              email: sessionUser.email || "",
              avatar: sessionUser.user_metadata?.avatar || null,
              createdAt: new Date(sessionUser.created_at).toISOString(),
              updatedAt: new Date().toISOString(),
            })
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Authentication is not available. Please check your configuration.")
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setLoading(false)
        // Provide more helpful error messages
        let errorMessage = error.message
        if (error.message === "Invalid login credentials") {
          errorMessage =
            "Invalid email or password. Please check your credentials or create an account if you don't have one."
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and confirm your account before signing in."
        } else if (error.message.includes("User not found")) {
          errorMessage = "No account found with this email. Please sign up to create an account."
        }
        const enhancedError = new Error(errorMessage)
        ;(enhancedError as any).originalError = error
        throw enhancedError
      }

      if (data.session) {
        try {
          await syncAuthToken()
          await loadUserProfile()
          // loadUserProfile sets loading to false in its finally block
          // But ensure it's set here too in case loadUserProfile doesn't complete
        } catch (profileError: any) {
          // If profile loading fails, still consider login successful
          // User can still use the app with session data
          console.warn("[v0] Error loading user profile after sign in:", profileError)
          setLoading(false)
          // Don't throw - login was successful, profile loading is secondary
        }
      } else {
        // No session returned - this shouldn't happen but handle it
        setLoading(false)
        throw new Error("Login failed: No session was created. Please try again.")
      }
    } catch (error: any) {
      setLoading(false)
      // Re-throw the error so the UI can display it
      if (error.message) {
        throw error
      }
      throw new Error("Failed to sign in. Please try again.")
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) {
      throw new Error("Authentication is not available. Please check your configuration.")
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        setLoading(false)
        // Provide more helpful error messages
        let errorMessage = error.message
        if (error.message.includes("already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead."
        } else if (error.message.includes("Password")) {
          errorMessage = "Password does not meet requirements. Please use at least 6 characters."
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        }
        const enhancedError = new Error(errorMessage)
        ;(enhancedError as any).originalError = error
        throw enhancedError
      }

      // Handle case where sign-up succeeds but no session (email confirmation required)
      if (data.session) {
        await syncAuthToken()
        await loadUserProfile()
      } else if (data.user) {
        // User created but needs email confirmation
        // Store user email for potential manual confirmation
        setLoading(false)
        const userEmail = data.user.email || email
        throw new Error(
          `Account created successfully! However, email confirmation is required and the confirmation email may not have been sent. Your account email: ${userEmail}. Please either: 1) Check your email spam folder, 2) Manually confirm your account in Supabase Dashboard (Authentication → Users → find your email → Confirm), or 3) Disable email confirmation in Supabase Settings for development.`,
        )
      } else {
        setLoading(false)
        throw new Error("Account creation failed. Please try again.")
      }
    } catch (error: any) {
      setLoading(false)
      // Re-throw if it's already an enhanced error
      if (error.message && error.originalError) {
        throw error
      }
      // Otherwise, wrap it
      throw new Error(error.message || "Failed to create account. Please try again.")
    }
  }

  const signOut = async () => {
    if (!supabase) {
      // Gracefully handle missing Supabase - just clear local state
      setUser(null)
      localStorage.removeItem("auth_token")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn("[v0] Error signing out:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("auth_token")
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await loadUserProfile()
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error("Authentication is not available. Please check your configuration.")
    }

    if (!email.trim()) {
      throw new Error("Please enter your email address.")
    }

    // Get the current origin for the redirect URL
    // Use window.location.origin to get the correct port (5173 for Vite dev server)
    const redirectUrl = `${window.location.origin}/auth/reset-password`

    console.log("[Reset Password] Redirect URL:", redirectUrl)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      let errorMessage = error.message
      if (error.message.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait a few minutes before trying again."
      } else if (error.message.includes("not found")) {
        // Don't reveal if email exists for security
        errorMessage = "If an account exists with this email, a password reset link has been sent."
      }
      throw new Error(errorMessage)
    }
  }

  const updatePassword = async (newPassword: string) => {
    if (!supabase) {
      throw new Error(
        "Supabase authentication is not configured. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) and restart the development server.",
      )
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.")
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      let errorMessage = error.message
      if (error.message.includes("session")) {
        errorMessage = "Your reset link may have expired. Please request a new password reset."
      } else if (error.message.includes("Password")) {
        errorMessage = "Password does not meet requirements. Please use at least 6 characters."
      }
      throw new Error(errorMessage)
    }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error("Authentication is not available. Please check your configuration.")
    }

    setLoading(true)
    try {
      // Get the current origin for the redirect URL
      const redirectUrl = `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        setLoading(false)
        // Provide user-friendly error messages
        let errorMessage = error.message || "Failed to initiate Google sign-in"

        // Check for specific error codes and messages
        // Supabase AuthError has: message, status, name
        const errorMsg = error.message?.toLowerCase() || ""
        const errorStatus = (error as any).status

        if (
          errorMsg.includes("provider is not enabled") ||
          errorMsg.includes("unsupported provider") ||
          errorMsg.includes("validation_failed") ||
          errorStatus === 400
        ) {
          errorMessage = "Google sign-in is not enabled. Please contact support or use email/password to sign in."
        } else if (errorMsg.includes("redirect_uri_mismatch")) {
          errorMessage = "OAuth configuration error. Please contact support."
        } else if (errorMsg.includes("invalid_client")) {
          errorMessage = "Google OAuth is not properly configured. Please contact support."
        }

        throw new Error(errorMessage)
      }

      // The OAuth flow will redirect to Google, then back to our callback
      // We don't need to do anything else here - the redirect will happen
      // The callback route will handle the session creation
    } catch (error: any) {
      setLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshUser,
        resetPassword,
        updatePassword,
      }}
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
