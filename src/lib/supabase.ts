/**
 * Supabase Client for Frontend
 *
 * This creates a Supabase client for direct database access from the frontend.
 * Uses the anon key and respects Row Level Security (RLS).
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"

console.log("[v0] Initializing Supabase client...")

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("[v0] Supabase URL:", supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "not set")
console.log("[v0] Supabase Key:", supabaseAnonKey ? "present" : "not set")

// Check if Supabase is configured - more relaxed check to allow demo mode
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== "" &&
  supabaseAnonKey.trim() !== "" &&
  !supabaseUrl.includes("demo.supabase.co") &&
  !supabaseAnonKey.includes("demo-key") &&
  supabaseUrl !== "https://placeholder.supabase.co"

if (!isConfigured) {
  console.warn("⚠️ Supabase not configured - running in DEMO MODE")
  console.warn("To enable full authentication, set these environment variables:")
  console.warn("  - VITE_SUPABASE_URL")
  console.warn("  - VITE_SUPABASE_ANON_KEY")
  console.warn("Get these from: https://app.supabase.com/project/_/settings/api")
} else {
  console.log("[v0] Supabase client configured successfully")
}

// This prevents null reference errors throughout the app
const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Get the current session token
 */
export async function getAuthToken(): Promise<string | null> {
  if (!supabase) {
    console.log("[v0] No Supabase client - running in demo mode")
    return null
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch (error) {
    console.warn("[v0] Error getting auth token:", error)
    return null
  }
}

/**
 * Set auth token in localStorage (for API service)
 */
export async function syncAuthToken() {
  try {
    const token = await getAuthToken()
    if (token) {
      localStorage.setItem("auth_token", token)
    } else {
      localStorage.removeItem("auth_token")
    }
  } catch (error) {
    console.warn("[v0] Error syncing auth token:", error)
    // Don't throw - token sync failure shouldn't block app
  }
}

/**
 * Initialize auth token sync
 * Call this when the app starts
 */
export function initAuthSync() {
  console.log("[v0] Setting up auth sync...")

  try {
    // Sync token on auth state change
    supabase.auth.onAuthStateChange(async () => {
      try {
        await syncAuthToken()
      } catch (error) {
        console.warn("[v0] Error syncing auth token on change:", error)
        // Don't throw - token sync failure shouldn't block app
      }
    })

    // Initial sync
    syncAuthToken().catch((error) => {
      console.warn("[v0] Error in initial auth token sync:", error)
      // Don't throw - token sync failure shouldn't block app
    })

    console.log("[v0] Auth sync initialized successfully")
  } catch (error) {
    console.warn("[v0] Error setting up auth sync:", error)
    // Don't throw - auth sync setup failure shouldn't block app
  }
}

export { supabase }
